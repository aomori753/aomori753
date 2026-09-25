import assert from "node:assert/strict";
import test from "node:test";
import { checkPublicFiles, PUBLIC_FILES } from "./check-profile.mjs";

// Synthetic one-pixel RGBA PNG: no dependency on profile artwork or metadata.
const image = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAX+XDSwAAAABJRU5ErkJggg==", "base64");
const artwork = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet"><title>Sample</title><desc>Accessible test artwork.</desc><rect width="48" height="48"/></svg>';
const profile = `# Profile
<a id="profile"></a>
<a id="fieldops"></a>
<a id="projects"></a>
<a id="toolkit"></a>
<a id="development"></a>
<a id="design"></a>
<a id="vision"></a>
<a id="integrity"></a>
<a id="connect"></a>

Sentrivela is a personal cybersecurity study.

## FieldOps AI
**ACTIVE DEVELOPMENT — Architecture & Workflow Design**
**PRIVATE SOURCE · CASE STUDY IN DEVELOPMENT**
Architecture illustration: **CONCEPT**.
Provider integrations remain planned.
`;

function fixture() {
  const files = new Map(PUBLIC_FILES.map((file) => [file,
    file.endsWith(".png") ? image : file.endsWith(".svg") ? artwork : "",
  ]));
  files.set("README.md", profile);
  files.set("docs/ASSET_LICENSES.md", "# Licenses\n");
  return files;
}

function withProfile(extra) {
  const files = fixture();
  files.set("README.md", profile + "\n" + extra);
  return checkPublicFiles(files);
}

function hasProblem(problems, expression) {
  assert.ok(problems.some((problem) => expression.test(problem)), problems.join("\n"));
}

test("a complete self-contained public snapshot passes", () => {
  assert.deepEqual(checkPublicFiles(fixture()), []);
});

test("unexpected paths and missing required files fail", () => {
  const files = fixture();
  files.set("review-notes.txt", "");
  files.delete("docs/ASSET_LICENSES.md");
  const problems = checkPublicFiles(files);
  hasProblem(problems, /Unexpected publication path/);
  hasProblem(problems, /Required public file is missing/);
});

test("internal maintenance files are rejected as publication paths", () => {
  for (const file of ["AGENTS.md", "docs/rebrand/review.md", ".rebrand-local/report.json"]) {
    const files = fixture();
    files.set(file, "Local-only review material.");
    hasProblem(checkPublicFiles(files), /Internal maintenance files must remain untracked/);
  }
});

test("published README navigation anchors are required", () => {
  for (const anchor of ["connect", "fieldops"]) {
    const files = fixture();
    files.set("README.md", profile.replace(`<a id="${anchor}"></a>`, ""));
    hasProblem(checkPublicFiles(files), new RegExp(`Required section anchor is missing: ${anchor}`));
  }
});

test("local Markdown links resolve to public files and real anchors", () => {
  assert.deepEqual(withProfile("[Licenses](docs/ASSET_LICENSES.md#licenses)"), []);
  hasProblem(withProfile("[Missing](docs/ASSET_LICENSES.md#absent)"), /missing anchor/);
  hasProblem(withProfile("[Missing](docs/unknown.md)"), /missing file/);
});

test("encoded traversal and non-HTTPS destinations fail", () => {
  hasProblem(withProfile("[Outside](%2e%2e/%2e%2e/outside.md)"), /outside the approved public files/);
  hasProblem(withProfile("[Unsafe](http://example.com)"), /must use HTTPS/);
  hasProblem(withProfile("[Malformed](bad%ZZ.md)"), /Malformed link encoding/);
  hasProblem(withProfile("[Malformed](https://)"), /Malformed HTTPS/);
  hasProblem(withProfile("[Windows path](assets%5cbrand%5cheader-dark.svg)"), /URL forward slashes/);
});

test("inline, reference and HTML remote images fail", () => {
  for (const markdown of [
    "![Image](https://example.com/image.png)",
    "![Image][sample]\n\n[sample]: https://example.com/image.png",
    '<img src="https://example.com/image.png" alt="Image">',
  ]) hasProblem(withProfile(markdown), /External image sources/);
});

test("active markup is rejected while code examples remain readable", () => {
  hasProblem(withProfile('<script>alert("test")</script>'), /Active HTML/);
  hasProblem(withProfile('<p onclick="example()">Test</p>'), /Event handlers/);
  assert.deepEqual(withProfile('```html\n<script>example()</script>\n```\n'), []);
});

test("public prose uses default or explicit left alignment", () => {
  for (const markup of ['<p align="center">Text</p>', "<div align='RIGHT'>Text</div>", "<h2 align=justify>Text</h2>"]) {
    hasProblem(withProfile(markup), /native left alignment/);
  }
  assert.deepEqual(withProfile("Native English and Japanese prose / 日本語の本文。"), []);
  assert.deepEqual(withProfile('<p align="left">Text</p>'), []);
  assert.deepEqual(withProfile('```html\n<p align="center">Example markup</p>\n```\n'), []);
});

test("deprecated layout and font tags cannot hide or restyle prose", () => {
  for (const markup of ['<center>Text</center>', '<font size="1">Text</font>', '<small>Text</small>', '<sub>Text</sub>']) {
    hasProblem(withProfile(markup), /custom layout or reduced-size prose/);
  }
  assert.deepEqual(withProfile('`<font size="1">Example markup</font>`'), []);
});

test("disclosures need one summary and cannot be nested", () => {
  assert.deepEqual(withProfile("<details><summary>Details</summary>Text</details>"), []);
  hasProblem(withProfile("<details>Text</details>"), /needs one summary/);
  hasProblem(withProfile("<details><summary>Outer</summary><details><summary>Inner</summary>Text</details></details>"), /Nested details/);
  hasProblem(withProfile("<details><summary>Open</summary>"), /Unclosed details/);
});

test("the published README retains the current project stage and concept label", () => {
  const files = fixture();
  files.set("README.md", profile.replace("ACTIVE DEVELOPMENT — Architecture & Workflow Design", "PLANNED"));
  hasProblem(checkPublicFiles(files), /FieldOps project status/);
  files.set("README.md", profile.replace("Architecture illustration: **CONCEPT**.", ""));
  hasProblem(checkPublicFiles(files), /separate native CONCEPT label/);
});

test("FieldOps private-source and case-study labels must remain native project text", () => {
  for (const label of ["PRIVATE SOURCE", "CASE STUDY IN DEVELOPMENT"]) {
    const files = fixture();
    files.set("README.md", profile.replace(label, ""));
    hasProblem(checkPublicFiles(files), new RegExp(`native ${label} label`));
    files.set("README.md", profile.replace(label, `\`${label}\``));
    hasProblem(checkPublicFiles(files), new RegExp(`native ${label} label`));
  }
});

test("FieldOps rejects repository links while provider documentation and other projects remain valid", () => {
  hasProblem(withProfile("[Source](https://github.com/example/fieldops-ai)"), /private source; remove repository links/);
  hasProblem(withProfile("[Source][repository]\n\n## References\n[repository]: https://github.com/example/fieldops-ai"), /private source; remove repository links/);
  assert.deepEqual(withProfile("[Provider documentation](https://platform.openai.com/docs)"), []);
  assert.deepEqual(withProfile("## Other project\n[Repository](https://github.com/example/public-project)"), []);
});

test("the cybersecurity project retains its current name and rejects obsolete branding", () => {
  const files = fixture();
  files.set("README.md", profile.replace("Sentrivela", "CyberGuard"));
  const problems = checkPublicFiles(files);
  hasProblem(problems, /superseded cybersecurity project name/);
  hasProblem(problems, /retain the Sentrivela project name/);
});

test("professional-direction headings and timelines remain undated", () => {
  hasProblem(withProfile("## Direction 2030"), /headings must be undated/);
  hasProblem(withProfile("- 2030: future work"), /dated timeline rows/);
});

test("SVG artwork needs accessible descriptions and local resources", () => {
  const files = fixture();
  files.set("assets/icons/code.svg", artwork.replace("<desc>Accessible test artwork.</desc>", ""));
  hasProblem(checkPublicFiles(files), /nonempty title and description/);
  files.set("assets/icons/code.svg", artwork.replace('<rect width="48"', '<rect fill="url(https://example.com/fill)" width="48"'));
  hasProblem(checkPublicFiles(files), /SVG references a nonlocal resource/);
});

test("SVG aspect-ratio declarations and picture fallbacks are checked", () => {
  const files = fixture();
  files.set("assets/icons/code.svg", artwork.replace('preserveAspectRatio="xMidYMid meet"', ""));
  hasProblem(checkPublicFiles(files), /explicitly preserve its aspect ratio/);
  hasProblem(withProfile('<picture><source media="(prefers-color-scheme: dark)" srcset="assets/brand/header-dark.svg"><img src="assets/brand/header-fallback.png" alt="Profile"></picture>'), /Each picture needs dark\/light sources/);
});

test("PNG files reject appended data and incomplete chunks", () => {
  const files = fixture();
  files.set("assets/brand/header-fallback.png", Buffer.concat([image, Buffer.from("unexpected")]));
  hasProblem(checkPublicFiles(files), /PNG is incomplete or has trailing data/);
  files.set("assets/brand/header-fallback.png", image.subarray(0, image.length - 4));
  hasProblem(checkPublicFiles(files), /PNG is incomplete|PNG chunk exceeds/);
});

test("sensitive patterns are detected without exposing the matched value", () => {
  // Deliberately synthetic; no credential is stored in this test suite.
  const token = ["ghp", "x".repeat(40)].join("_");
  const files = fixture();
  files.set("scripts/README.md", token);
  const problems = checkPublicFiles(files);
  hasProblem(problems, /Possible access token/);
  assert.ok(problems.every((problem) => !problem.includes(token)));
  files.set("scripts/README.md", ["Q:", "local", "notes"].join("\\"));
  hasProblem(checkPublicFiles(files), /machine-specific path/);
});

test("public prose excludes audit fingerprints but permits immutable source URLs", () => {
  const fingerprint = "a".repeat(40);
  hasProblem(withProfile(`Reviewed commit: ${fingerprint}`), /audit fingerprints/);
  hasProblem(withProfile(`Checksum: ${"b".repeat(64)}`), /audit fingerprints/);
  assert.deepEqual(withProfile(`## References\n[Source](https://github.com/example/project/blob/${fingerprint}/README.md)`), []);
});

test("labelled abbreviated audit identifiers are excluded from public prose", () => {
  const abbreviated = ["6a", "0ddd", "15"].join("");
  for (const prose of [
    `Reviewed commit: \`${abbreviated}\``,
    `**Commit**: \`${abbreviated}\``,
    `Baseline ${abbreviated}`,
    `SHA-256: ${abbreviated}`,
    `Commit hash: ${abbreviated.slice(0, 6)}...`,
    `Revision: ${abbreviated.slice(0, 6)}…`,
  ]) hasProblem(withProfile(prose), /audit fingerprints/);
  assert.deepEqual(withProfile(`## References\n[Source](https://github.com/example/project/blob/${abbreviated}/README.md)`), []);
});

test("publication identifiers and colors are not mistaken for audit records", () => {
  assert.deepEqual(withProfile("Publication JP 1234567; research identifier 20260926; color #aabbcc and #12345678."), []);
});

test("concrete local snapshot paths stay out of public documentation", () => {
  hasProblem(withProfile("Saved under `.private/review/snapshot.md`."), /local snapshot and preview paths/);
  assert.deepEqual(withProfile("Keep private notes in ignored directories."), []);
});
