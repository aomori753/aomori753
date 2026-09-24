# GitHub profile repository

This is `aomori753/aomori753`, the public GitHub profile repository, not the portfolio website. Keep it a small Markdown-and-assets project. Do not add an application framework, backend, analytics, live widgets or publishing service.

## Content and scope

- Preserve the existing English and Japanese professional wording, qualifications, dates, links and project-status qualifiers unless the owner explicitly approves a substantive correction. A visual rebrand is not permission to rewrite claims.
- Keep substantive text readable in README.md, directly or in clearly labelled native disclosures. Comments, alt text, artwork and backups do not substitute for readable copy.
- The current presentation-only baseline is commit `3237601592ddd1db00b682f2da9397e2858cafea`. Its README SHA-256 is `147e867ad1cf6c1af5db3336daf3bd99cf572d9606040308bb2e47d0540ab917`. Do not replace a frozen baseline to make a failing test pass.
- Record disagreements between approved portfolio content and the README for owner review. Do not silently change statuses or establish another master profile.
- Work only in this repository. Reading approved public brand references from the sibling portfolio does not authorize modifying it or reading unrelated/private source material. No other-repository changes or account changes without explicit approval.

## Presentation and assets

- Use the shared jo. identity, charcoal/navy, controlled cobalt/periwinkle and restrained technical linework. Keep actual prose in native GitHub typography, left aligned and selectable.
- Prefer vertical project blocks, clearly labelled conceptual art and adjacent Japanese details. Do not imply that conceptual artwork is a screenshot, validated design or evidence of performance.
- Use native headings, links, lists, picture and details. No scripts, custom layout CSS, small/sub prose, external fonts or remote images. Avoid nested disclosures.
- New SVGs must be self-contained geometric artwork with accessible descriptions, explicit dimensions/viewBox and `preserveAspectRatio="xMidYMid meet"`. No active content, external resources or crucial font-dependent lettering. Provide a PNG fallback for the header.
- Preserve original supplied images. Inspect derived assets for private data and metadata. Do not alter the owner’s face, fabricate project screenshots or change the repository license.
- Keep private baselines, evidence, browser profiles, caches and screenshots under ignored local directories, never the public tree. Git exclusion is not encryption or access control. Never force-add them.

## Verification

Use installed Node.js 22+, Python 3.10+ and PowerShell 7 with `ConvertFrom-Markdown`. No dependency installation is needed for repository checks.

Run from the repository root:

```powershell
node --check scripts/check-profile.mjs
node scripts/check-profile.mjs
python scripts/check-rebrand.py --baseline .rebrand-local/20260925-004105/baseline/README.md --candidate README.md --report .rebrand-local/20260925-004105/integrity/final-local.json
git diff --check
git status --short --branch
```

The rebrand check intentionally requires the locally preserved baseline and is not a fresh-clone CI requirement. It compares expanded rendered text, occurrence-counted links and prior graphic wording. If the baseline is unavailable, report that limitation; do not invent a PASS or silently select a new baseline. Supply `--baseline-html` and `--candidate-html` only for authentic corresponding renderer output.

Review added labels and structural moves manually. Check actual local renders at 360, 390, 768 and 900 pixel README-column widths, light/dark/dim appearance, keyboard disclosures, anchors, images-disabled usefulness and 200% zoom. A local preview or Markdown API response does not prove the final GitHub profile rendering. See [verification.md](docs/rebrand/verification.md) for the current checks and remaining release gates.

## Release control

Inspect the exact diff, public-file allowlist, local exclusions and commit identity before staging only approved task files. Keep existing unrelated changes intact. Do not reset, clean, stash automatically, rewrite history or change global configuration.

No push, merge, deployment, website update, profile/sidebar edit, pin edit, visibility change or external message without owner approval for that action. Pinned repositories and account settings are separate from the README. After approved publication, verify the real profile in GitHub before claiming the release is complete.
