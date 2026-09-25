# Agent Architecture & Contribution Guidelines

Local-only guidance for the `aomori753/aomori753` profile repository. Keep this file ignored and untracked. Stage reviewed changes for manual review; do not automatically commit or push.

## 1. Repository purpose and architecture

This repository presents Jericho Ong's bilingual professional profile and independent research in Construction & Logistics DX, software and data systems, Applied AI and cybersecurity development.

- Keep a minimal static repository: standard Markdown, self-contained SVG artwork, necessary PNG images and public-facing developer automation.
- `README.md` is the single public profile. Internal design notes, prompts, draft profiles, audit reports and approval history belong in private recovery storage.
- Do not add backend services, analytics, tracking, remote fonts, external runtime dependencies or third-party widgets.
- Work only in this repository. Other repositories, websites, account settings and private project sources require separate authority.

## 2. Public-facing code and script standards

- Use Node.js 22 or newer, built-in modules and Git. Public checks must run on a normal checkout without private baselines, sibling repositories, credentials, network access or dependency installation.
- Keep each script focused and read-only. Use descriptive functions, comments that explain non-obvious behavior, documented CLI usage, actionable diagnostics and standard exit codes.
- Do not embed machine-specific absolute paths, audit fingerprints, private data or private repository references. Resolve repository paths relative to the script and reject paths outside the repository or symbolic-link substitutions.
- Invoke subprocesses with argument arrays, without interpolated shell commands. Never print matched secret values.
- Validate the exact public file policy, local Markdown links and anchors, native disclosure structure, SVG accessibility/dimensions and selected credential/metadata patterns.
- Review every new public path before updating the file policy. Never weaken checks or replace frozen recovery evidence to manufacture a passing result.
- Add focused regression tests for changed behavior, using synthetic inputs. Keep local instructions, script documentation and CI commands consistent.
- Keep one-off migration, preview and audit helpers private. A retained public tool must have a clear purpose and useful usage documentation.

## 3. Content integrity and intellectual rigor

- Preserve approved English and Japanese facts, qualifications, dates, links and status qualifiers. Update both languages together when the owner approves a substantive correction.
- **Domain foundation:** approximately 13 years of construction project-management experience and operational constraints.
- **Engineering foundation:** software, relational data models, PHP, MySQL, SQL and operational workflows. Use stronger terms such as production-tested only when specific evidence supports them; do not promote a guideline into a new professional claim.
- **Active development:** FieldOps AI is **ACTIVE DEVELOPMENT — Architecture & Workflow Design**. Keep **PRIVATE SOURCE** and **CASE STUDY IN DEVELOPMENT** without a private repository link. Its architecture illustration remains **CONCEPT**; provider adapters, demos and runtime integrations remain **PLANNED**.
- **Research horizon:** exploratory Physical AI, cyber-physical systems, robotics and related study. Do not introduce dated capability promises, predicted job titles or unearned expertise.
- Retain cybersecurity learning and implementation limits. Use **Sentrivela** for the existing cybersecurity architecture study without changing its verified description or status.
- Keep essential professional text native, selectable and left-aligned. Label disclosures clearly; do not nest them. Artwork, alt text, comments and backups do not replace readable text.
- Keep bare Git hashes, checksums, internal change records, machine paths and prompt commentary out of public prose. Store audit evidence privately. Meaningful research/application identifiers, dates, color values, immutable attribution links and workflow security pins may remain where they serve their stated purpose.
- Record factual disagreements privately for owner review. Do not silently establish another professional narrative.

## 4. Visual assets and design standards

- Retain the jo. identity, charcoal/navy palette, controlled cobalt/periwinkle accents and restrained technical linework. Keep prose in native GitHub typography.
- SVGs require explicit dimensions, a matching `viewBox`, `preserveAspectRatio="xMidYMid meet"`, and meaningful `<title>` and `<desc>` elements. No scripts, active content, remote resources or downloaded fonts.
- Provide light/dark artwork, readable mobile headers and the PNG header fallback; verify dimmed presentation as well. Theme behavior must be checked rather than assumed.
- Label conceptual art accurately. Do not fabricate screenshots, performance evidence or inspection of an unavailable reference.
- Preserve original supplied images and inspect derived assets for private metadata. Do not alter the owner's face or repository license.
- Preserve applicable creator credits, licenses, adaptations and trademark guidance in [asset attribution](docs/ASSET_LICENSES.md). Do not imply endorsement or blanket-license every asset as CC0.

## 5. Security and privacy safeguards

- Never stage credentials, keys, session cookies, browser profiles, personal records, employer records or private project material.
- Keep drafts, benchmarks, previews, caches and recovery evidence in ignored local storage or the owner-approved private backup. Ignore rules are not encryption or access control; never force-add private paths.
- Back up valuable files and verify their copies before removing them from public tracking. Preserve older recovery snapshots unchanged.
- If an actual secret is found, stop and report only the affected file, secret type, current/historical scope and recommended rotation. Do not print its value.

## 6. Verification and contribution workflow

Run from the repository root:

```sh
node --check scripts/check-profile.mjs
node --check scripts/check-profile.test.mjs
node --test scripts/check-profile.test.mjs
node scripts/check-profile.mjs
git diff --check
git diff --cached --check
git status --short --branch
```

For presentation changes, inspect actual Markdown renders at 360, 390, 768 and 900 pixel reading widths in light/dark/dim appearances, with keyboard disclosures, anchors, images disabled and 200% browser zoom. Keep results private and distinguish actual browser zoom from reflow approximations and local previews from live GitHub.

Inspect the exact diff, public file policy, exclusions and commit identity before staging only reviewed task files. Preserve unrelated changes. Do not reset, clean, stash automatically, rewrite history or change global configuration.

When commits are explicitly authorized, use focused professional subjects and bodies with Context, Implementation, Constraints and Validation. Split changes only where each intermediate tree remains coherent and passes its checks. Historical approval is not standing authority for a new commit, push, merge, deployment, account edit or external message. After an approved publication, inspect the real GitHub profile before claiming release completion.
