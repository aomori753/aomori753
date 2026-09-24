import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Read-only checks for this small, deliberately curated public repository.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allowed = new Set([
  "README.md", "README_REBRAND_V2.md", "AGENTS.md", "SECURITY.md", ".gitignore", ".gitattributes",
  "assets/.keep", "assets/patent-publication.png", "assets/profile-header.svg",
  "assets/brand/jo-mark.svg", "assets/brand/header-dark.svg", "assets/brand/header-light.svg", "assets/brand/header-fallback.png",
  "assets/brand/header-mobile-dark.svg", "assets/brand/header-mobile-light.svg",
  "assets/project-cards/construction-supply-dark.svg", "assets/project-cards/construction-supply-light.svg",
  "assets/project-cards/sitearm-dark.svg", "assets/project-cards/sitearm-light.svg",
  "assets/project-cards/construction-logistics-dx-dark.svg", "assets/project-cards/construction-logistics-dx-light.svg",
  "assets/project-cards/eapa-dark.svg", "assets/project-cards/eapa-light.svg",
  "assets/project-cards/fieldops-ai-dark.svg", "assets/project-cards/fieldops-ai-light.svg",
  "assets/icons/php.svg", "assets/icons/git.svg", "assets/icons/typescript.svg", "assets/icons/sql.svg",
  "assets/icons/code.svg", "assets/icons/workflow.svg", "assets/icons/terminal.svg", "assets/icons/assistant.svg",
  "assets/projects/construction-logistics-concept-dark.svg", "assets/projects/construction-logistics-concept-light.svg",
  "assets/projects/eapa-concept-dark.svg", "assets/projects/eapa-concept-light.svg",
  "assets/projects/sitearm-concept-dark.svg", "assets/projects/sitearm-concept-light.svg",
  "docs/profile-maintenance.md", "docs/profile-sync.json",
  "docs/rebrand/design.md", "docs/rebrand/verification.md",
  "docs/rebrand/README_VERSION_COMPARISON.md", "docs/rebrand/CONTENT_MAP.md",
  "docs/rebrand/CONTENT_REVIEW.md", "docs/rebrand/DESIGN_SYSTEM.md",
  "docs/rebrand/ASSET_LICENSES.md", "docs/rebrand/RENDER_CHECKLIST.md",
  "docs/rebrand/MAIN_CONCEPT.md", "docs/rebrand/PROFILE_SETTINGS_PROPOSED.md",
  "docs/rebrand/PUBLICATION_CHECKLIST.md", "REBRAND_V2_CHANGE_RECORD.txt",
  "REBRAND_CHANGE_RECORD_20260925-004105.txt", "scripts/check-rebrand.py",
  "scripts/check-profile.mjs", ".github/workflows/profile-check.yml",
]);
const sourceFiles = [
  "PROFILE_MASTER.md", "docs/CONTENT_PROVENANCE.md", "src/content/profile.ts",
  "src/content/projects.ts", "src/content/roadmap.ts", "src/content/toolkit.ts",
  "src/content/sitearm.ts", "src/content/domains.ts", "src/content/lab.ts",
];
const requiredAnchors = [
  "profile", "projects", "toolkit", "development", "design", "vision", "integrity", "connect",
];
const sensitivePatterns = [
  ["private key", /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/],
  ["access token", /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16}|sk-(?:proj-)?[A-Za-z0-9_-]{24,}|xox[baprs]-[A-Za-z0-9-]{20,})\b/],
  ["credential assignment", /["']?(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)["']?\s*[:=]\s*["'][^\s"']{8,}["']/i],
  ["personal email address", /\b[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+\b/i],
  ["machine-specific path", /(?:\b[A-Z]:[\\/]|file:\/\/|(?<![\w./:-])\/(?:Users|home)\/[^\s/]+)/i],
];
const problems = [];
const normalized = (value) => value.replace(/\r\n?/g, "\n");
const sha256 = (value) => createHash("sha256").update(normalized(value)).digest("hex");
const inside = (base, target) => {
  const relative = path.relative(base, target);
  return !path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`);
};
const safeName = (name) => {
  let result = name;
  for (const [, expression] of sensitivePatterns) {
    result = result.replace(new RegExp(expression.source, `${expression.flags}g`), "[redacted]");
  }
  return JSON.stringify(result);
};
const fail = (file, message) => problems.push(`${safeName(file)}: ${message}`);
const readable = new Map();

function markupOnly(value, omitInlineCode = false) {
  const text = value.replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1\s*$/gm, "");
  return omitInlineCode ? text.replace(/(`+)([\s\S]*?)\1(?!`)/g, "") : text;
}

function anchors(value, file) {
  const result = new Set();
  const text = markupOnly(value);
  for (const match of text.matchAll(/\b(?:id|name)\s*=\s*["']([^"']+)["']/gi)) {
    if (result.has(match[1])) fail(file, "Duplicate explicit anchor.");
    result.add(match[1]);
  }
  const counts = new Map();
  for (const match of text.matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const slug = match[1].replace(/<[^>]*>/g, "").toLowerCase()
      .replace(/[^\p{L}\p{N}\p{M}_\- ]/gu, "").replace(/ /g, "-");
    const count = counts.get(slug) ?? 0;
    counts.set(slug, count + 1);
    result.add(count ? `${slug}-${count}` : slug);
  }
  return result;
}

function checkDetails(text, file) {
  const stack = [];
  for (const match of markupOnly(text, true).matchAll(/<\s*(\/?)\s*(details|summary)\b[^>]*>/gi)) {
    const closing = Boolean(match[1]);
    const tag = match[2].toLowerCase();
    const parent = stack.at(-1);
    if (closing) {
      if (parent?.tag !== tag) return fail(file, "Unbalanced details/summary tags.");
      if (tag === "details" && parent.summaries !== 1) fail(file, "Each details block needs one summary.");
      stack.pop();
    } else {
      if (tag === "summary") {
        if (parent?.tag !== "details") return fail(file, "Summary must be directly inside details.");
        parent.summaries += 1;
      }
      stack.push({ tag, summaries: 0 });
    }
  }
  if (stack.length) fail(file, "Unclosed details/summary tags.");
}

function checkDestination(raw, file, image = false) {
  let destination;
  try {
    destination = decodeURIComponent(raw.replace(/&amp;/g, "&").trim());
  } catch {
    return fail(file, "Malformed link encoding.");
  }
  if (/^https:\/\//i.test(destination)) {
    if (image) fail(file, "External image sources are not permitted.");
    if (/https?:\/\/[^/]*@/i.test(destination)) fail(file, "A link contains embedded credentials.");
    return;
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(destination) || destination.startsWith("/")) {
    return fail(file, "Link must use HTTPS or a repository-relative path.");
  }
  const hashAt = destination.indexOf("#");
  const fragment = hashAt >= 0 ? destination.slice(hashAt + 1) : "";
  const pathname = (hashAt >= 0 ? destination.slice(0, hashAt) : destination).split("?")[0];
  const target = pathname ? path.resolve(root, path.dirname(file), pathname) : path.join(root, file);
  const relative = path.relative(root, target).split(path.sep).join("/");
  if (!inside(root, target) || !allowed.has(relative) || !readable.has(relative)) {
    return fail(file, "Local link points outside the approved public files or to a missing file.");
  }
  if (fragment && /\.md$/i.test(relative) && !anchors(readable.get(relative), relative).has(fragment)) {
    fail(file, "Local link references a missing anchor.");
  }
}

function attributes(tag, file) {
  const result = new Map();
  const body = tag.replace(/^<\/?[\w:-]+\b/, "").replace(/\/?\s*>$/, "");
  const expression = /([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let end = 0;
  for (const match of body.matchAll(expression)) {
    if (body.slice(end, match.index).trim()) fail(file, "Malformed or unsupported HTML/XML attribute.");
    const name = match[1].toLowerCase();
    if (result.has(name)) fail(file, "Duplicate HTML/XML attribute.");
    result.set(name, match[2] ?? match[3] ?? match[4]);
    end = match.index + match[0].length;
  }
  if (body.slice(end).trim()) fail(file, "Malformed or unsupported HTML/XML attribute.");
  return result;
}

function checkPictures(text, file) {
  let picture;
  let previousEnd = 0;
  for (const match of text.matchAll(/<\s*(\/?)\s*([a-z][a-z\d]*)\b[^>]*>/gi)) {
    const closing = Boolean(match[1]);
    const tag = match[2].toLowerCase();
    if (picture && text.slice(previousEnd, match.index).trim()) {
      fail(file, "Picture must contain only source elements and one fallback image.");
    }
    previousEnd = match.index + match[0].length;
    if (tag === "picture") {
      if (closing) {
        if (!picture) { fail(file, "Unbalanced picture tags."); continue; }
        const widePair = ["dark:wide", "light:wide"].every((key) => picture.media.has(key));
        const mobilePair = ["dark:mobile", "light:mobile"].every((key) => picture.media.has(key));
        if (picture.images !== 1 || !widePair ||
            !(picture.media.size === 2 || (picture.media.size === 4 && mobilePair))) {
          fail(file, "Each picture needs dark/light sources, an optional paired mobile variant, and one fallback image.");
        }
        if (picture.brand && !/\.png$/.test(picture.fallback)) {
          fail(file, "Critical header artwork needs a PNG fallback.");
        }
        picture = undefined;
      } else {
        if (picture || /\/\s*>$/.test(match[0])) fail(file, "Pictures cannot be nested or self-closing.");
        if (attributes(match[0], file).size) fail(file, "Picture layout must use native GitHub rendering.");
        picture = { images: 0, media: new Set(), brand: false, fallback: "" };
      }
      continue;
    }
    if (tag === "source") {
      if (closing || !picture) { fail(file, "Source must be a void element directly inside picture."); continue; }
      if (picture.images) fail(file, "Picture sources must precede the fallback image.");
      const attrs = attributes(match[0], file);
      if ([...attrs.keys()].some((name) => !["media", "srcset", "type"].includes(name))) {
        fail(file, "Picture source has unsupported attributes.");
      }
      const media = (attrs.get("media") ?? "").replace(/\s+/g, "");
      const terms = media.split("and");
      const scheme = terms.map((term) => /^\(prefers-color-scheme:(dark|light)\)$/.exec(term)?.[1]).find(Boolean);
      const mobile = terms.includes("(max-width:600px)");
      const mediaKey = `${scheme}:${mobile ? "mobile" : "wide"}`;
      if (!scheme || terms.length !== (mobile ? 2 : 1) || picture.media.has(mediaKey)) {
        fail(file, "Picture queries must pair distinct dark/light themes, optionally at max-width 600px.");
      }
      if (mobile && picture.media.has(`${scheme}:wide`)) {
        fail(file, "Mobile artwork must precede its matching unrestricted theme source.");
      }
      picture.media.add(mediaKey);
      const source = attrs.get("srcset") ?? "";
      if (source.includes("assets/brand/")) picture.brand = true;
      if (!source || /[\s,?#]/.test(source) || !/\.(?:svg|png)$/.test(source)) {
        fail(file, "Source srcset must name one local SVG or PNG without descriptors or query parameters.");
      } else checkDestination(source, file, true);
      if (attrs.has("type") && !["image/svg+xml", "image/png"].includes(attrs.get("type"))) {
        fail(file, "Unsupported picture source image type.");
      }
      continue;
    }
    if (picture && tag !== "img") fail(file, "Only source and img elements may appear inside picture.");
    if (tag === "img" && picture) {
      if (closing) fail(file, "Fallback img must be a void element.");
      picture.images += 1;
      const attrs = attributes(match[0], file);
      picture.fallback = attrs.get("src") ?? "";
      if (!/\.(?:png|svg)$/.test(picture.fallback) || !attrs.has("alt")) {
        fail(file, "Picture fallback must be a local SVG or PNG with an alt attribute.");
      }
    }
  }
  if (picture) fail(file, "Unclosed picture element.");
}

function checkMarkdown(value, file) {
  const text = markupOnly(value, true);
  checkDetails(value, file);
  checkPictures(text, file);
  for (const match of text.matchAll(/(!?)\[[^\]\n]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g)) {
    checkDestination(match[2] ?? match[3], file, Boolean(match[1]));
  }
  const definitions = new Map();
  for (const match of text.matchAll(/^\s{0,3}\[([^\]]+)\]:\s*(?:<([^>]+)>|(\S+))/gm)) {
    definitions.set(match[1].toLowerCase(), match[2] ?? match[3]);
    checkDestination(match[2] ?? match[3], file);
  }
  for (const match of text.matchAll(/!\[([^\]]*)\](?:\[([^\]]*)\])?(?!\()/g)) {
    const destination = definitions.get((match[2] || match[1]).toLowerCase());
    if (destination) checkDestination(destination, file, true);
    else fail(file, "Image reference has no matching definition.");
  }
  for (const tag of text.matchAll(/<([a-z][a-z\d]*)\b[^>]*>/gi)) {
    for (const match of tag[0].matchAll(/\b(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
      checkDestination(match[2] ?? match[3] ?? match[4], file, match[1].toLowerCase() === "src");
    }
    if (/\b(?:on[a-z]+|style|class)\s*=/i.test(tag[0]) ||
        (tag[1].toLowerCase() !== "source" && /\bsrcset\s*=/i.test(tag[0]))) {
      fail(file, "Event handlers, custom CSS and non-picture alternate sources are not permitted.");
    }
  }
  if (/<\s*(?:script|style|iframe|object|embed|link|meta|base|canvas|svg|video|audio|form|input|button|small|sub)\b/i.test(text)) {
    fail(file, "Active HTML, custom layout or reduced-size prose is not permitted.");
  }
  if (/url\(\s*["']?(?!#)|(?:readme-typing-svg|github-readme-stats|komarev\.com|shields\.io)/i.test(text)) {
    fail(file, "Remote image, badge or tracking service reference requires removal.");
  }
}

function checkMainConcept(value, file) {
  // The published root may retain its earlier wording while this candidate is reviewed.
  if (file !== "README_REBRAND_V2.md") return;
  const text = markupOnly(value);
  const futureYear = /\b20(?:2[6-9]|[3-9]\d)\b/;
  const headings = [...text.matchAll(/^ {0,3}#{1,6}\s+(.+)$/gm)].map((match) => match[1]);
  headings.push(...[...text.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map((match) => match[1]));
  if (headings.some((heading) => futureYear.test(heading.replace(/<[^>]*>/g, "")))) {
    fail(file, "Candidate professional-direction headings must be undated.");
  }
  const visible = text.replace(/<[^>]*>/g, " ").replace(/[*_`]/g, "");
  const timelineRows = text.replace(/<[^>]*>/g, " ").replace(/\*\*|__|`/g, "");
  if (/\b20(?:2[6-9]|[3-9]\d)\s*(?:[-–—→]|to|through|年?\s*[〜～])\s*20\d{2}\b/i.test(visible)
      || /^\s*(?:[-+*]\s+|\|\s*)20(?:2[6-9]|[3-9]\d)\b/m.test(timelineRows)) {
    fail(file, "Candidate must use undated professional layers, not future year ranges or dated timeline rows.");
  }

  const native = markupOnly(value, true);
  const sections = [...native.matchAll(/^ {0,3}(#{1,6})\s+(.+)$/gm)];
  const index = sections.findIndex((section) => /\bfieldops\s+ai\b/i.test(section[2]));
  if (index < 0) return fail(file, "Candidate needs a native FieldOps AI section.");
  const heading = sections[index];
  const next = sections.slice(index + 1).find((section) => section[1].length <= heading[1].length);
  const fieldops = native.slice(heading.index + heading[0].length, next?.index ?? native.length)
    .replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/[*_]/g, "");
  if (!/\bACTIVE DEVELOPMENT\s*[—–:·|-]?\s*Architecture\s*&\s*Workflow Design\b/i.test(fieldops)) {
    fail(file, "FieldOps project status must be ACTIVE DEVELOPMENT — Architecture & Workflow Design.");
  }
  if (!/(?:\b(?:architecture|visual|illustration|diagram)\b[^.\n]{0,100}\bCONCEPT\b|\bCONCEPT\b[^.\n]{0,100}\b(?:architecture|visual|illustration|diagram)\b)/i.test(fieldops)) {
    fail(file, "FieldOps architecture visual must retain a separate native CONCEPT label.");
  }
  if (/\bFieldOps\s+AI\s+(?:is|remains)\s+(?:still\s+)?PLANNED\b|\bPLANNED\s*[—–:-]\s*FieldOps\s+AI(?=\s*(?:[.·\n]|$))/i.test(visible)
      || /^\s*project(?:\s+status)?\s*[:—–-]\s*PLANNED\b/im.test(fieldops)) {
    fail(file, "Candidate retains a superseded FieldOps project-level PLANNED label; provider plans may remain planned.");
  }
}

function checkSvg(value, file) {
  if (/<\s*(?:script|style|foreignObject)\b|\b(?:on[a-z]+|style|class)\s*=|<!ENTITY|<!DOCTYPE|@import/i.test(value)) {
    fail(file, "SVG contains active or externally resolved content.");
  }
  for (const match of value.matchAll(/\b(?:href|src)\s*=\s*["']([^"']*)["']|url\(\s*["']?([^\s)'"\s]+)/gi)) {
    if (!(match[1] ?? match[2]).startsWith("#")) fail(file, "SVG references a nonlocal resource.");
  }
  const legacy = file === "assets/profile-header.svg";
  const permitted = new Set([
    "svg", "title", "desc", "defs", "g", "path", "rect", "circle", "ellipse",
    "line", "polyline", "polygon", "linearGradient", "radialGradient", "stop", "clipPath", "text", "tspan",
  ]);
  const text = value.replace(/<!--[\s\S]*?-->/g, "").replace(/^\s*<\?xml\s[^?]*\?>/, "");
  const stack = [];
  let rootAttrs;
  let roots = 0;
  for (const match of text.matchAll(/<(\/?)\s*([\w:.-]+)\b[^>]*>/g)) {
    const [, closing, tag] = match;
    if (!permitted.has(tag)) fail(file, "SVG contains unsupported elements; use self-contained geometric artwork.");
    if (closing) {
      if (stack.pop() !== tag) fail(file, "SVG elements are unbalanced.");
      continue;
    }
    const attrs = attributes(match[0], file);
    if (!stack.length) {
      roots += 1;
      if (tag !== "svg") fail(file, "SVG needs one outer svg element.");
      rootAttrs = attrs;
    }
    if ([...attrs].some(([name, attribute]) => /\\/.test(attribute) ||
        (name.startsWith("xmlns") && (name !== "xmlns" || attribute !== "http://www.w3.org/2000/svg")))) {
      fail(file, "SVG must not use escaped attribute syntax or alternate namespaces.");
    }
    if (!/\/\s*>$/.test(match[0])) stack.push(tag);
  }
  if (stack.length || roots !== 1 || /<\?/.test(text)) fail(file, "SVG structure is incomplete or unsupported.");
  const viewBox = (rootAttrs?.get("viewbox") ?? "").trim().split(/[\s,]+/).map(Number);
  const width = Number(rootAttrs?.get("width"));
  const height = Number(rootAttrs?.get("height"));
  if (rootAttrs?.get("xmlns") !== "http://www.w3.org/2000/svg"
      || viewBox.length !== 4 || !viewBox.every(Number.isFinite) || viewBox[2] <= 0 || viewBox[3] <= 0
      || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0
      || Math.abs(width / height - viewBox[2] / viewBox[3]) > 0.000001) {
    fail(file, "SVG needs its namespace, positive dimensions and a matching viewBox aspect ratio.");
  }
  if (!legacy && rootAttrs?.get("preserveaspectratio") !== "xMidYMid meet") {
    fail(file, "New SVG artwork must explicitly preserve its aspect ratio.");
  }
}

function checkPng(bytes, file) {
  if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    return fail(file, "Image does not have a valid PNG signature.");
  }
  const permitted = new Set(["IHDR", "PLTE", "IDAT", "IEND", "tRNS", "gAMA", "cHRM", "sRGB", "pHYs", "sBIT"]);
  let offset = 8;
  let ended = false;
  let imageData = false;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const chunk = bytes.toString("ascii", offset + 4, offset + 8);
    if (length > bytes.length - offset - 12) return fail(file, "PNG chunk exceeds the image boundary.");
    if (!permitted.has(chunk)) fail(file, "PNG contains metadata or unsupported chunks; inspect and remove from derived artwork.");
    if ((offset === 8 && (chunk !== "IHDR" || length !== 13)) || (offset > 8 && chunk === "IHDR")) {
      fail(file, "PNG header structure is invalid.");
    }
    if (chunk === "IDAT") imageData = true;
    offset += length + 12;
    if (chunk === "IEND") {
      ended = length === 0;
      break;
    }
  }
  if (!ended || !imageData || offset !== bytes.length) fail(file, "PNG is incomplete or has trailing data.");
}

function checkManifest(portfolioPath) {
  const file = "docs/profile-sync.json";
  let manifest;
  try { manifest = JSON.parse(readable.get(file)); }
  catch { return fail(file, "Cannot parse the synchronization baseline."); }
  if (manifest.sourceName !== "JerichoOng-Portfolio" || manifest.hashAlgorithm !== "sha256"
      || manifest.normalization !== "LF" || !/^\d{4}-\d{2}-\d{2}$/.test(manifest.reviewedOn ?? "")
      || !manifest.sources || Object.keys(manifest.sources).sort().join("\n") !== [...sourceFiles].sort().join("\n")
      || !Object.values(manifest.sources).every((hash) => /^[a-f\d]{64}$/.test(hash))) {
    return fail(file, "Invalid source list or synchronization metadata.");
  }
  if (!portfolioPath) return;
  let portfolioRoot;
  try { portfolioRoot = realpathSync(path.resolve(portfolioPath)); }
  catch { return fail(file, "The supplied portfolio directory is unavailable."); }
  for (const source of sourceFiles) {
    try {
      const target = realpathSync(path.join(portfolioRoot, source));
      if (!inside(portfolioRoot, target)) throw new Error("Outside source directory");
      if (sha256(readFileSync(target, "utf8")) !== manifest.sources[source]) {
        fail(source, "Portfolio source changed since the reviewed baseline; review before updating its hash.");
      }
    } catch { fail(source, "Portfolio source is missing or unreadable."); }
  }
}

function main() {
  if (Number(process.versions.node.split(".")[0]) < 22) throw new Error("Node version");
  const args = process.argv.slice(2);
  if (args.length && !(args.length === 2 && args[0] === "--portfolio" && args[1])) {
    console.error("Usage: node scripts/check-profile.mjs [--portfolio PATH]");
    process.exitCode = 1;
    return;
  }
  const candidates = [...new Set(execFileSync("git", [
    "ls-files", "--cached", "--others", "--exclude-standard", "-z",
  ], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).split("\0").filter(Boolean))].sort();
  for (const file of allowed) {
    if (file !== "assets/.keep" && !candidates.includes(file)) fail(file, "Required public file is missing or ignored.");
  }
  for (const file of candidates) {
    if (!allowed.has(file)) {
      fail(file, "Unexpected publication path; review and explicitly approve or exclude this file.");
      continue;
    }
    try {
      const target = path.join(root, file);
      if (!lstatSync(target).isFile() || !inside(realpathSync(root), realpathSync(target))) {
        fail(file, "Public files must be ordinary files inside this repository.");
        continue;
      }
      if (file.endsWith(".png")) {
        checkPng(readFileSync(target), file);
        readable.set(file, "");
      } else {
        readable.set(file, readFileSync(target, "utf8"));
      }
    } catch {
      if (file !== "assets/.keep") fail(file, "Public file is missing or unreadable.");
    }
  }
  for (const [file, text] of readable) {
    if (file.endsWith(".png")) continue;
    for (const [label, expression] of sensitivePatterns) {
      if (expression.test(text)) fail(file, `Possible ${label}; inspect locally. Matched content is withheld.`);
    }
    if (file.endsWith(".md")) checkMarkdown(text, file);
    if (file === "README_REBRAND_V2.md") checkMainConcept(text, file);
    if (file.endsWith(".svg")) checkSvg(text, file);
  }
  for (const file of ["README.md", "README_REBRAND_V2.md"]) {
    const readmeAnchors = anchors(readable.get(file) ?? "", file);
    for (const anchor of requiredAnchors) {
      if (!readmeAnchors.has(anchor)) fail(file, `Required section anchor is missing: ${anchor}.`);
    }
  }
  checkManifest(args[1]);
  if (problems.length) {
    console.error(`Profile checks failed (${problems.length}):\n${[...new Set(problems)].map((item) => `- ${item}`).join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log(`Profile checks passed: ${readable.size} approved public files; local links, anchors, markup and privacy signatures checked.`);
    console.log(args[1] ? `Portfolio baseline matches all ${sourceFiles.length} reviewed source files.` : "Portfolio drift was not checked; use --portfolio PATH for that read-only comparison.");
  }
}

try { main(); }
catch {
  console.error("Profile checks could not run. Use Node.js 22 or newer with Git available in this repository.");
  process.exitCode = 1;
}
