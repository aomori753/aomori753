import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Read-only checks for this small, deliberately curated public repository.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PUBLIC_FILES = Object.freeze([
  "README.md", "SECURITY.md", ".gitignore", ".gitattributes",
  "assets/selected-public-images/industrial-design-publication.png",
  "assets/brand/jo-mark.svg", "assets/brand/header-dark.svg", "assets/brand/header-light.svg", "assets/brand/header-fallback.png",
  "assets/brand/header-mobile-dark.svg", "assets/brand/header-mobile-light.svg",
  "assets/project-cards/construction-supply-dark.svg", "assets/project-cards/construction-supply-light.svg",
  "assets/project-cards/sitearm-dark.svg", "assets/project-cards/sitearm-light.svg",
  "assets/project-cards/construction-logistics-dx-dark.svg", "assets/project-cards/construction-logistics-dx-light.svg",
  "assets/project-cards/eapa-dark.svg", "assets/project-cards/eapa-light.svg",
  "assets/project-cards/fieldops-ai-dark.svg", "assets/project-cards/fieldops-ai-light.svg",
  "assets/icons/php.svg", "assets/icons/git.svg", "assets/icons/typescript.svg", "assets/icons/sql.svg",
  "assets/icons/code.svg", "assets/icons/workflow.svg", "assets/icons/terminal.svg", "assets/icons/assistant.svg",
  "docs/ASSET_LICENSES.md",
  "scripts/check-profile.mjs", "scripts/check-profile.test.mjs", "scripts/README.md",
  ".github/workflows/profile-check.yml",
]);
const allowed = new Set(PUBLIC_FILES);
const internalMaintenanceFiles = new Set([
  "AGENTS.md",
  "README_REBRAND_V2.md",
  "docs/profile-sync.json",
]);
const internalMaintenanceDirectories = [
  ".private/", ".preview/", ".rebrand-local/", "change-records/",
  "docs-private/", "docs/rebrand/", "internal/", "private/",
];
const isInternalMaintenancePath = (file) => {
  const normalized = file.replaceAll("\\", "/").replace(/^\.\/+/, "");
  return internalMaintenanceFiles.has(normalized)
    || internalMaintenanceDirectories.some((directory) => normalized.startsWith(directory));
};
const requiredAnchors = [
  "profile", "fieldops", "projects", "toolkit", "development", "design", "vision", "integrity", "connect",
];
const sensitivePatterns = [
  ["private key", /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/],
  ["access token", /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16}|sk-(?:proj-)?[A-Za-z0-9_-]{24,}|xox[baprs]-[A-Za-z0-9-]{20,})\b/],
  ["credential assignment", /["']?(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)["']?\s*[:=]\s*["'][^\s"']{8,}["']/i],
  ["personal email address", /\b[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+\b/i],
  ["machine-specific path", /(?:\b[A-Z]:[\\/]|file:\/\/|(?<![\w./:-])\/(?:Users|home)\/[^\s/]+)/i],
];
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
/**
 * Validate public file contents without changing files or contacting services.
 * @param {Map<string, string | Buffer>} entries Repository-relative paths and contents.
 * @returns {string[]} Unique failures, with sensitive matched values withheld.
 */
export function checkPublicFiles(entries) {
  const problems = [];
  const fail = (file, message) => problems.push(`${safeName(file)}: ${message}`);
  const readable = new Map();
  for (const file of PUBLIC_FILES) {
    if (!entries.has(file)) fail(file, "Required public file is missing or ignored.");
  }
  for (const [file, contents] of entries) {
    if (isInternalMaintenancePath(file)) {
      fail(file, "Internal maintenance files must remain untracked and outside the public repository.");
      continue;
    }
    if (!allowed.has(file)) {
      fail(file, "Unexpected publication path; review and explicitly approve or exclude this file.");
      continue;
    }
    if (file.endsWith(".png")) {
      if (!Buffer.isBuffer(contents)) fail(file, "PNG input must contain binary image data.");
      else checkPng(contents, file);
      readable.set(file, "");
    } else {
      readable.set(file, Buffer.isBuffer(contents) ? contents.toString("utf8") : contents);
    }
  }

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
        if (tag === "details" && stack.some((item) => item.tag === "details")) {
          fail(file, "Nested details disclosures are not permitted.");
        }
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
    if (destination.includes("\\")) return fail(file, "Links must use URL forward slashes.");
    if (/^https:\/\//i.test(destination)) {
      if (image) fail(file, "External image sources are not permitted.");
      let url;
      try { url = new URL(destination); }
      catch { return fail(file, "Malformed HTTPS destination."); }
      if (url.username || url.password) fail(file, "A link contains embedded credentials.");
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
      for (const alignment of tag[0].matchAll(/\s+align\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
        if ((alignment[1] ?? alignment[2] ?? alignment[3]).trim().toLowerCase() !== "left") {
          fail(file, "Public prose must use native left alignment.");
        }
      }
    }
    if (/<\s*(?:script|style|iframe|object|embed|link|meta|base|canvas|svg|video|audio|form|input|button|small|sub|center|font)\b/i.test(text)) {
      fail(file, "Active HTML, custom layout or reduced-size prose is not permitted.");
    }
    if (/url\(\s*["']?(?!#)|(?:readme-typing-svg|github-readme-stats|komarev\.com|shields\.io)/i.test(text)) {
      fail(file, "Remote image, badge or tracking service reference requires removal.");
    }
  }

  function checkEditorialHygiene(value, file) {
    // Immutable source links may legitimately contain a commit identifier.
    const prose = value.replace(/https:\/\/[^\s<>"']+/gi, "");
    // Short hexadecimal values can also be publication numbers or colors.
    // Treat them as audit identifiers only after an explicit audit label.
    const auditLabels = prose.replace(/[*_`]/g, "");
    const abbreviations = auditLabels.matchAll(/\b(?:commit|revision|baseline|fingerprint|checksum|hash|sha(?:-?(?:1|256))?)(?:[ \t]+(?:id|hash|checksum|fingerprint))?[ \t]*(?:[:=][ \t]*)?["' ]*([a-f\d]{6,39})\b(\.{3}|…)?/gi);
    const hasAbbreviation = [...abbreviations].some((match) => match[1].length >= 7 || Boolean(match[2]));
    if (/\b(?:[a-f\d]{40}|[a-f\d]{64})\b/i.test(prose) || hasAbbreviation) {
      fail(file, "Internal commit identifiers and audit fingerprints belong in local review records, not public prose.");
    }
    if (/\.(?:rebrand-local|private|preview)\/[A-Za-z\d][^\s<>]*/i.test(prose)) {
      fail(file, "Concrete local snapshot and preview paths do not belong in public documentation.");
    }
  }

  function checkProfileContent(value, file) {
    // Keep the published profile's project status and undated direction consistent.
    if (file !== "README.md") return;
    const text = markupOnly(value);
    const futureYear = /\b20(?:2[6-9]|[3-9]\d)\b/;
    const headings = [...text.matchAll(/^ {0,3}#{1,6}\s+(.+)$/gm)].map((match) => match[1]);
    headings.push(...[...text.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map((match) => match[1]));
    if (headings.some((heading) => futureYear.test(heading.replace(/<[^>]*>/g, "")))) {
      fail(file, "Professional-direction headings must be undated.");
    }
    const visible = text.replace(/<[^>]*>/g, " ").replace(/[*_`]/g, "");
    const timelineRows = text.replace(/<[^>]*>/g, " ").replace(/\*\*|__|`/g, "");
    if (/\b20(?:2[6-9]|[3-9]\d)\s*(?:[-–—→]|to|through|年?\s*[〜～])\s*20\d{2}\b/i.test(visible)
        || /^\s*(?:[-+*]\s+|\|\s*)20(?:2[6-9]|[3-9]\d)\b/m.test(timelineRows)) {
      fail(file, "Profile must use undated professional layers, not future year ranges or dated timeline rows.");
    }

    const native = markupOnly(value, true);
    if (/\bCyberGuard(?:AI)?\b/i.test(value)) fail(file, "Remove the superseded cybersecurity project name; use Sentrivela.");
    if (!/\bSentrivela\b/.test(native.replace(/<[^>]*>/g, " "))) {
      fail(file, "The public profile must retain the Sentrivela project name in native text.");
    }
    const sections = [...native.matchAll(/^ {0,3}(#{1,6})\s+(.+)$/gm)];
    const index = sections.findIndex((section) => /\bfieldops\s+ai\b/i.test(section[2]));
    if (index < 0) return fail(file, "Profile needs a native FieldOps AI section.");
    const heading = sections[index];
    const next = sections.slice(index + 1).find((section) => section[1].length <= heading[1].length);
    const fieldopsMarkup = native.slice(heading.index + heading[0].length, next?.index ?? native.length);
    const fieldops = fieldopsMarkup.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/[*_]/g, "");
    if (!/\bACTIVE DEVELOPMENT\s*[—–:·|-]?\s*Architecture\s*&\s*Workflow Design\b/i.test(fieldops)) {
      fail(file, "FieldOps project status must be ACTIVE DEVELOPMENT — Architecture & Workflow Design.");
    }
    if (!/(?:\b(?:architecture|visual|illustration|diagram)\b[^.\n]{0,100}\bCONCEPT\b|\bCONCEPT\b[^.\n]{0,100}\b(?:architecture|visual|illustration|diagram)\b)/i.test(fieldops)) {
      fail(file, "FieldOps architecture visual must retain a separate native CONCEPT label.");
    }
    for (const label of ["PRIVATE SOURCE", "CASE STUDY IN DEVELOPMENT"]) {
      if (!fieldops.includes(label)) fail(file, `FieldOps must retain the native ${label} label.`);
    }
    // FieldOps has no public source repository. Provider documentation links
    // remain valid; repository links for other projects are checked elsewhere.
    const definitions = new Map([...native.matchAll(/^\s{0,3}\[([^\]]+)\]:\s*(?:<([^>]+)>|(\S+))/gm)]
      .map((match) => [match[1].toLowerCase(), match[2] ?? match[3]]));
    const referenceTargets = [...fieldopsMarkup.matchAll(/\[([^\]\n]+)\](?:\[([^\]\n]*)\])?(?!\()/g)]
      .map((match) => definitions.get((match[2] || match[1]).toLowerCase()) ?? "");
    if (/https:\/\/(?:www\.)?(?:github\.com|gitlab\.com|bitbucket\.org)\/[^\s/"'#<>]+\/[^\s"'<>)]/i.test([fieldopsMarkup, ...referenceTargets].join("\n"))) {
      fail(file, "FieldOps is private source; remove repository links from its project section.");
    }
    if (/\bFieldOps\s+AI\s+(?:is|remains)\s+(?:still\s+)?PLANNED\b|\bPLANNED\s*[—–:-]\s*FieldOps\s+AI(?=\s*(?:[.·\n]|$))/i.test(visible)
        || /^\s*project(?:\s+status)?\s*[:—–-]\s*PLANNED\b/im.test(fieldops)) {
      fail(file, "Profile retains a superseded FieldOps project-level PLANNED label; provider plans may remain planned.");
    }
  }

  function checkSvg(value, file) {
    if (/<\s*(?:script|style|foreignObject)\b|\b(?:on[a-z]+|style|class)\s*=|<!ENTITY|<!DOCTYPE|@import/i.test(value)) {
      fail(file, "SVG contains active or externally resolved content.");
    }
    for (const match of value.matchAll(/\b(?:href|src)\s*=\s*["']([^"']*)["']|url\(\s*["']?([^\s)'"\s]+)/gi)) {
      if (!(match[1] ?? match[2]).startsWith("#")) fail(file, "SVG references a nonlocal resource.");
    }
    for (const tag of ["title", "desc"]) {
      const content = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(value)?.[1];
      if (!content?.replace(/<[^>]*>/g, "").trim()) fail(file, "SVG artwork needs a nonempty title and description.");
    }
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
    if (rootAttrs?.get("preserveaspectratio") !== "xMidYMid meet") {
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

  for (const [file, text] of readable) {
    if (file.endsWith(".png")) continue;
    for (const [label, expression] of sensitivePatterns) {
      if (expression.test(text)) fail(file, `Possible ${label}; inspect locally. Matched content is withheld.`);
    }
    if (file.endsWith(".md")) {
      checkMarkdown(text, file);
      checkEditorialHygiene(text, file);
    }
    if (file === "README.md") checkProfileContent(text, file);
    if (file.endsWith(".svg")) checkSvg(text, file);
  }
  const readmeAnchors = anchors(readable.get("README.md") ?? "", "README.md");
  for (const anchor of requiredAnchors) {
    if (!readmeAnchors.has(anchor)) fail("README.md", `Required section anchor is missing: ${anchor}.`);
  }
  return [...new Set(problems)];
}

function readPublicFiles() {
  let candidates;
  try {
    candidates = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
      cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    }).split("\0").filter(Boolean);
  } catch (error) {
    const reason = error.code === "ENOENT" ? "Git was not found" : `Git could not run (${error.code ?? "command failed"})`;
    throw new Error(`${reason}. Run from a Git checkout with permission to execute Git.`);
  }
  const entries = new Map();
  const problems = [];
  for (const file of [...new Set(candidates)].sort()) {
    const target = path.join(root, file);
    let stat;
    try { stat = lstatSync(target); }
    catch (error) {
      // A tracked deletion is part of the current working tree. Required paths
      // are still checked below, before a change can pass validation.
      if (error.code === "ENOENT") continue;
      problems.push(`${safeName(file)}: Cannot inspect public file (${error.code ?? "read error"}).`);
      continue;
    }
    if (!allowed.has(file)) {
      entries.set(file, "");
      continue;
    }
    if (!stat.isFile() || !inside(realpathSync(root), realpathSync(target))) {
      problems.push(`${safeName(file)}: Public files must be ordinary files inside this repository.`);
      continue;
    }
    try { entries.set(file, readFileSync(target)); }
    catch (error) {
      problems.push(`${safeName(file)}: Cannot read public file (${error.code ?? "read error"}).`);
    }
  }
  return { entries, problems };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    console.log("Usage: node scripts/check-profile.mjs\n\nRead-only validation of public files, local links, accessible artwork and publication hygiene.\nRequires Node.js 22 or newer and Git. No credentials, dependencies or network access are needed.");
    return;
  }
  if (args.length) throw new Error("Unsupported arguments. Use node scripts/check-profile.mjs --help.");
  if (Number(process.versions.node.split(".")[0]) < 22) throw new Error("Node.js 22 or newer is required.");
  const { entries, problems } = readPublicFiles();
  const failures = [...new Set([...problems, ...checkPublicFiles(entries)])];
  if (failures.length) {
    console.error(`Profile checks failed (${failures.length}):\n${failures.map((item) => `- ${item}`).join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log(`Profile checks passed: ${entries.size} public files; links, anchors, markup, artwork and publication hygiene checked.`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); }
  catch (error) {
    console.error(`Profile check could not complete: ${error.message}`);
    process.exitCode = 1;
  }
}
