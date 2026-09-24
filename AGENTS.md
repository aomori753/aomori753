# GitHub profile repository

This is `aomori753/aomori753`, the public GitHub profile repository, not the portfolio website. Keep it a small Markdown-and-assets project. Do not add an application framework, backend, analytics, live widgets or publishing service.

## Content and scope

- Preserve the existing English and Japanese professional wording, qualifications, dates, links and project-status qualifiers unless the owner explicitly approves a substantive correction. A visual rebrand is not permission to rewrite claims.
- Keep substantive text readable in README.md, directly or in clearly labelled native disclosures. Comments, alt text, artwork and backups do not substitute for readable copy.
- The current presentation-only baseline is commit `3237601592ddd1db00b682f2da9397e2858cafea`. Its README SHA-256 is `147e867ad1cf6c1af5db3336daf3bd99cf572d9606040308bb2e47d0540ab917`. Do not replace a frozen baseline to make a failing test pass.
- V2 was prepared separately in `README_REBRAND_V2.md`, then accepted by the owner on 25 September 2026 with explicit approval to commit and push to this profile repository. The accepted candidate is retained and copied into the root README for release. Its historical visual reference is `535c997a0543de05601ccb31b7cf28e8bc15304c`; its frozen current-content source is published V1 `19e9febd78f4d6e7fc892256c9a4e75a50ca37ba`, README SHA-256 `d83e35298ee25411aff99454876cd617d52ec6bca7d3b2454c9512132f7e14d2`.
- The V2 brief permits new architecture and truthful planned FieldOps AI/Agentic AI content. Four superseded SITEARM English/Japanese evidence paragraphs are explicitly corrected from inspected public numerical-research sources in `docs/rebrand/CONTENT_MAP.md`. Preserve all other still-valid professional text and qualifiers. Do not treat the four corrections as blanket rewriting permission.
- Record disagreements between approved portfolio content and the README for owner review. Do not silently change statuses or establish another master profile.
- Work only in this repository. Reading approved public brand references from the sibling portfolio does not authorize modifying it or reading unrelated/private source material. No other-repository changes or account changes without explicit approval.

## Presentation and assets

- Use the shared jo. identity, charcoal/navy, controlled cobalt/periwinkle and restrained technical linework. Keep actual prose in native GitHub typography, left aligned and selectable.
- Prefer vertical project blocks, clearly labelled conceptual art and adjacent Japanese details. Do not imply that conceptual artwork is a screenshot, validated design or evidence of performance.
- Use native headings, links, lists, picture and details. No scripts, custom layout CSS, small/sub prose, external fonts or remote images. Avoid nested disclosures.
- New SVGs must be self-contained artwork with accessible descriptions, explicit dimensions/viewBox and `preserveAspectRatio="xMidYMid meet"`. Safe system-font display lettering is allowed by the V2 brief; keep essential facts and reading-size labels in native text too. No active content, external resources, font downloads or bundled fonts. Provide a PNG fallback for the header and readable mobile variants.
- Copy only the minimum justified product icons after inspecting their source, individual license and trademark guidance. Retain attribution in `docs/rebrand/ASSET_LICENSES.md`; do not blanket-label every asset CC0 or imply vendor endorsement. Original category symbols need not imitate vendor logos.
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

For V2, first regenerate the before/after local HTML from the matching V1 snapshot and current candidate, then run the local reviewed-delta audit:

```powershell
python .rebrand-local/v2-20260925-013852/verify-content.py
```

This local audit checks 181 baseline blocks, four exact evidence corrections, individually named presentation changes and original external destinations. Its reports and rendered HTML remain ignored local evidence. It is not a CI requirement. Do not run the V1 frozen-copy checker against V2 and suppress its legitimate differences. `node scripts/check-profile.mjs` checks both public Markdown files, the exact asset allowlist, anchors, local links, sensitive patterns and safe markup.

Review added labels and structural moves manually. Check actual local renders at 360, 390, 768 and 900 pixel README-column widths, light/dark/dim appearance, keyboard disclosures, anchors, images-disabled usefulness and 200% zoom. A local preview or Markdown API response does not prove the final GitHub profile rendering. See [verification.md](docs/rebrand/verification.md) for the current checks and remaining release gates.

The V2 required matrix is 390/768/900px in light/dark, with dim checked additionally. Use [RENDER_CHECKLIST.md](docs/rebrand/RENDER_CHECKLIST.md) for V2 results and limitations; the lowercase V1 documents are historical records. Distinguish actual native browser zoom from device-scale/reflow approximation. Do not upload a local-only draft for remote rendering without authorization.

## Release control

Inspect the exact diff, public-file allowlist, local exclusions and commit identity before staging only approved task files. Keep existing unrelated changes intact. Do not reset, clean, stash automatically, rewrite history or change global configuration.

No push, merge, deployment, website update, profile/sidebar edit, pin edit, visibility change or external message without owner approval for that action. Pinned repositories and account settings are separate from the README. After approved publication, verify the real profile in GitHub before claiming the release is complete.

The V2 candidate-only hold was lifted by the owner's subsequent acceptance and explicit commit/push request on 25 September 2026. This authorizes the reviewed profile release to this repository's default `main` branch; it does not authorize other repositories, accounts, pins, visibility or website changes. Preserve the candidate and complete V1 snapshot, and follow [PUBLICATION_CHECKLIST.md](docs/rebrand/PUBLICATION_CHECKLIST.md). Future publication still requires its own task authority.
