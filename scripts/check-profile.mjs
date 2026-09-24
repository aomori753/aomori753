import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Read-only checks for this small, deliberately curated public repository.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allowed = new Set([
  "README.md", "SECURITY.md", ".gitignore", ".gitattributes",
  "assets/.keep", "assets/patent-publication.png", "assets/profile-header.svg",
  "docs/profile-maintenance.md", "docs/profile-sync.json",
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
  ["machine-specific path", /(?:\b[A-Z]:[\\/]|file:\/\/|\/(?:Users|home)\/[^\s/]+)/i],
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

function markupOnly(value) {
  return value.replace(/<!--[\s\S]*?-->/g, "").replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, "");
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
  for (const match of markupOnly(text).matchAll(/<\s*(\/?)\s*(details|summary)\b[^>]*>/gi)) {
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

function checkMarkdown(value, file) {
  const text = markupOnly(value);
  checkDetails(value, file);
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
  }
  if (/<\s*(?:script|iframe|object|embed|source)\b|\bsrcset\s*=|\bon[a-z]+\s*=/i.test(text)) {
    fail(file, "Active or alternate-source HTML is not permitted.");
  }
  if (/url\(\s*["']?(?!#)|(?:readme-typing-svg|github-readme-stats|komarev\.com|shields\.io)/i.test(text)) {
    fail(file, "Remote image, badge or tracking service reference requires removal.");
  }
}

function checkSvg(value, file) {
  if (/<\s*(?:script|foreignObject)\b|\bon[a-z]+\s*=|<!ENTITY|<!DOCTYPE|@import/i.test(value)) {
    fail(file, "SVG contains active or externally resolved content.");
  }
  for (const match of value.matchAll(/\b(?:href|src)\s*=\s*["']([^"']*)["']|url\(\s*["']?([^\s)'"\s]+)/gi)) {
    if (!(match[1] ?? match[2]).startsWith("#")) fail(file, "SVG references a nonlocal resource.");
  }
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
        const signature = readFileSync(target).subarray(0, 8).toString("hex");
        if (signature !== "89504e470d0a1a0a") fail(file, "Image does not have a valid PNG signature.");
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
    if (file.endsWith(".svg")) checkSvg(text, file);
  }
  const readmeAnchors = anchors(readable.get("README.md") ?? "", "README.md");
  for (const anchor of requiredAnchors) {
    if (!readmeAnchors.has(anchor)) fail("README.md", `Required section anchor is missing: ${anchor}.`);
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
