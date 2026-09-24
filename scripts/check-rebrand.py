"""Check a presentation-only rebrand against the frozen, rendered README.

With no --candidate, write the baseline inventory. Supply rendered HTML fragments
with --baseline-html/--candidate-html, or use installed PowerShell Markdown.
Reports and generated fragments must remain under the ignored .rebrand-local/.
This checks exact visible copy and links; neutral additions need human review.
"""

import argparse
from collections import Counter
import difflib
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_BASELINE_SHA256 = "147e867ad1cf6c1af5db3336daf3bd99cf572d9606040308bb2e47d0540ab917"
BLOCKS = {"p", "li", "th", "td", "summary", "footer", "figcaption", "sub", "h1", "h2", "h3", "h4", "h5", "h6"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
IGNORED = {"script", "style", "template", "head", "title", "svg", "noscript"}


def normalize(text):
    return re.sub(r"\s+", " ", text).strip()


def digest(data):
    return hashlib.sha256(data).hexdigest()


class Element:
    def __init__(self, tag, attrs=(), line=0, serial=0):
        self.tag = tag
        self.attrs = dict(attrs)
        self.children = []
        self.location = f"{tag}@line{line}:node{serial}"

    @property
    def hidden(self):
        style = self.attrs.get("style", "") or ""
        classes = (self.attrs.get("class", "") or "").split()
        return (self.tag in IGNORED or "hidden" in self.attrs
                or self.attrs.get("aria-hidden", "").lower() == "true"
                or any(item in {"hidden", "sr-only", "visually-hidden"} for item in classes)
                or bool(re.search(r"(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:[;\s]|$)|font-size\s*:\s*0(?:px|em|rem|[;\s]|$))", style, re.I)))


class VisibleHTML(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Element("document")
        self.stack = [self.root]
        self.serial = 0
        self.feed(html)
        self.close()

    def handle_starttag(self, tag, attrs):
        self.serial += 1
        node = Element(tag, attrs, self.getpos()[0], self.serial)
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, text):
        self.stack[-1].children.append(text)


def visible_text(node):
    if isinstance(node, str):
        return node
    if node.hidden:
        return ""
    if node.tag in {"br", "hr"}:
        return " "
    return "".join((" " if isinstance(child, Element) and child.tag in BLOCKS else "")
                   + visible_text(child)
                   + (" " if isinstance(child, Element) and child.tag in BLOCKS else "")
                   for child in node.children)


def inventory_html(html):
    tree = VisibleHTML(html).root
    blocks, links, images = [], [], []
    heading = ""

    def visit(node, covered=False):
        nonlocal heading
        if isinstance(node, str) or node.hidden:
            return
        text = normalize(visible_text(node))
        if node.tag == "a" and node.attrs.get("href") and text:
            links.append({"label": text, "target": node.attrs["href"], "location": node.location})
        if node.tag in {"img", "source"}:
            images.append({"tag": node.tag, "path": node.attrs.get("src", node.attrs.get("srcset", "")),
                           "alt": node.attrs.get("alt", ""), "location": node.location})
        selected = node.tag in BLOCKS and bool(text) and not covered
        if selected:
            if re.fullmatch(r"h[1-6]", node.tag):
                heading = text
            blocks.append({"id": f"B{len(blocks) + 1:03d}", "tag": node.tag,
                           "location": node.location, "heading": heading, "text": text})
        for child in node.children:
            if isinstance(child, str) and not (covered or selected):
                stray = normalize(child)
                if stray:
                    blocks.append({"id": f"B{len(blocks) + 1:03d}", "tag": "text",
                                   "location": node.location, "heading": heading, "text": stray})
            else:
                visit(child, covered or selected)

    visit(tree)
    return {"blocks": blocks, "links": links, "images": images}


def svg_wording(markdown, images):
    result = []
    for image in images:
        source = image["path"]
        if not source.lower().endswith(".svg") or ":" in source:
            continue
        asset = (markdown.parent / source).resolve()
        if not asset.is_relative_to(markdown.parent.resolve()):
            raise ValueError("Baseline SVG path leaves its snapshot directory.")
        root = ET.parse(asset).getroot()
        for node in root.iter():
            if node.tag.rsplit("}", 1)[-1] == "text":
                text = normalize("".join(node.itertext()))
                if text:
                    result.append({"id": f"G{len(result) + 1:03d}", "path": source, "text": text})
    return result


def render(markdown, supplied, output):
    if supplied:
        return supplied.read_text(encoding="utf-8-sig"), "supplied rendered HTML"
    executable = shutil.which("pwsh")
    if not executable:
        raise ValueError("Supply rendered HTML or install PowerShell with ConvertFrom-Markdown.")
    env = os.environ.copy()
    env["REBRAND_MARKDOWN_INPUT"] = str(markdown.resolve())
    command = "[Console]::OutputEncoding = [Text.UTF8Encoding]::new(); (ConvertFrom-Markdown -LiteralPath $env:REBRAND_MARKDOWN_INPUT).Html"
    completed = subprocess.run([executable, "-NoLogo", "-NoProfile", "-NonInteractive", "-Command", command],
                               capture_output=True, encoding="utf-8", check=True, env=env)
    output.write_text(completed.stdout, encoding="utf-8", newline="\n")
    return completed.stdout, "PowerShell ConvertFrom-Markdown"


def compare(baseline, candidate):
    mapping, missing, used, covered = [], [], set(), {}
    originals = baseline["blocks"] + [dict(item, tag="svg-text", heading="Original artwork") for item in baseline["graphic_text"]]
    for original in originals:
        match = None
        # Prefer the intact block over a repeated project name in new navigation.
        candidates = sorted(candidate["blocks"], key=lambda block: (
            block["text"] != original["text"], block["tag"] != original["tag"],
            block["heading"] != original["heading"]))
        for block in candidates:
            offset = block["text"].find(original["text"])
            while offset >= 0:
                key = (original["text"], block["id"], offset)
                if key not in used:
                    match = (block, offset, key)
                    break
                offset = block["text"].find(original["text"], offset + 1)
            if match:
                break
        if match:
            block, offset, key = match
            used.add(key)
            covered.setdefault(block["id"], []).append((offset, offset + len(original["text"])))
            mapping.append({"original_id": original["id"], "candidate_id": block["id"],
                            "original_tag": original["tag"], "candidate_tag": block["tag"],
                            "original_heading": original["heading"], "candidate_heading": block["heading"],
                            "candidate_location": block["location"], "text": original["text"],
                            "relocated": original["tag"] != block["tag"] or original["heading"] != block["heading"]
                            or original["id"] != block["id"]})
        else:
            nearest = sorted(candidate["blocks"], key=lambda block: difflib.SequenceMatcher(
                None, original["text"], block["text"], autojunk=False).ratio(), reverse=True)
            missing.append({**original, "closest_visible_block": nearest[0] if nearest else None})
    additions = []
    for block in candidate["blocks"]:
        intervals = sorted(covered.get(block["id"], []))
        cursor, residual = 0, []
        for start, end in intervals:
            if start > cursor:
                residual.append(block["text"][cursor:start])
            cursor = max(cursor, end)
        residual.append(block["text"][cursor:])
        for piece in residual:
            if normalize(piece):
                text = normalize(piece)
                classification = ("presentation_separator" if not any(character.isalnum() for character in text)
                                  else "repeated_existing_wording" if any(text in item["text"] for item in originals)
                                  else "added_visible_text")
                additions.append({"candidate_id": block["id"], "location": block["location"],
                                  "text": text, "classification": classification,
                                  "review": "Review as a neutral presentation label; not automatically approved."})
    old_links = Counter((item["label"], item["target"]) for item in baseline["links"])
    new_links = Counter((item["label"], item["target"]) for item in candidate["links"])
    link_rows = lambda counter: [{"label": label, "target": target, "count": count}
                                 for (label, target), count in counter.items()]
    missing_links = link_rows(old_links - new_links)
    changed_links = [{**item, "candidate_targets": sorted({link["target"] for link in candidate["links"]
                                                          if link["label"] == item["label"]})}
                     for item in missing_links]
    return {"status": "PASS_COPY_PRESERVATION" if not missing and not missing_links else "FAIL",
            "baseline_blocks": len(baseline["blocks"]), "baseline_graphic_strings": len(baseline["graphic_text"]),
            "candidate_blocks": len(candidate["blocks"]), "mapped_count": len(mapping),
            "mapping": mapping, "missing_or_changed_blocks": missing,
            "missing_or_changed_links": changed_links, "added_links": link_rows(new_links - old_links),
            "new_visible_text_for_review": additions,
            "structural_relocations": [item for item in mapping if item["relocated"]],
            "baseline_images": baseline["images"], "candidate_images": candidate["images"],
            "limitations": "Visible copy/link comparison is exact after whitespace normalization. Image replacements and new labels require manual review. Alt text, comments, hidden nodes and graphic-only candidate text cannot satisfy preservation."}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline", type=Path, required=True)
    parser.add_argument("--baseline-html", type=Path)
    parser.add_argument("--candidate", type=Path)
    parser.add_argument("--candidate-html", type=Path)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    if args.candidate_html and not args.candidate:
        parser.error("--candidate-html requires --candidate")
    baseline_bytes = args.baseline.read_bytes()
    baseline_hash = digest(baseline_bytes)
    if baseline_hash != EXPECTED_BASELINE_SHA256:
        raise ValueError("Frozen baseline SHA-256 does not match. Restore the preserved baseline; never regenerate it to make a check pass.")
    report = args.report.resolve()
    if not report.is_relative_to(ROOT / ".rebrand-local"):
        raise ValueError("Write inventories and reports only inside the ignored .rebrand-local directory.")
    report.parent.mkdir(parents=True, exist_ok=True)
    baseline_html, baseline_renderer = render(args.baseline, args.baseline_html, report.with_suffix(".baseline.html"))
    baseline = inventory_html(baseline_html)
    baseline["graphic_text"] = svg_wording(args.baseline, baseline["images"])
    if not baseline["blocks"]:
        raise ValueError("The baseline rendering contains no visible blocks.")
    metadata = {"baseline_sha256": baseline_hash, "baseline_html_sha256": digest(baseline_html.encode("utf-8")),
                "baseline_renderer": baseline_renderer, "normalization": "Whitespace only; exact case, punctuation, numbers, words and status."}
    if args.candidate:
        candidate_html, candidate_renderer = render(args.candidate, args.candidate_html, report.with_suffix(".candidate.html"))
        result = {**metadata, "candidate_sha256": digest(args.candidate.read_bytes()),
                  "candidate_html_sha256": digest(candidate_html.encode("utf-8")), "candidate_renderer": candidate_renderer,
                  **compare(baseline, inventory_html(candidate_html))}
    else:
        result = {**metadata, "status": "BASELINE_INVENTORY", **baseline}
    report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"{result['status']}: {len(baseline['blocks'])} baseline blocks, {len(baseline['links'])} links, {len(baseline['graphic_text'])} graphic strings.")
    if args.candidate:
        print(f"Mapped {result['mapped_count']}; missing/changed text {len(result['missing_or_changed_blocks'])}; missing/changed links {len(result['missing_or_changed_links'])}; new visible segments for review {len(result['new_visible_text_for_review'])}.")
    return 1 if result["status"] == "FAIL" else 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, subprocess.CalledProcessError, ET.ParseError) as error:
        print(f"Integrity check could not complete: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(2)
