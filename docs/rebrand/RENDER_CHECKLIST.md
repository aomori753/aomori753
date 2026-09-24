# Render and integrity checklist — Rebrand V2

Review date: 25 September 2026. Candidate: [README_REBRAND_V2.md](../../README_REBRAND_V2.md). **Local rendering only; actual GitHub V2 rendering has not been verified.**

## Method and retained evidence

Actual Markdown was converted using installed PowerShell `ConvertFrom-Markdown`/Markdig, then rendered in installed Microsoft Edge 153.0.4234.48. A small ignored preview stylesheet approximates native GitHub typography; no custom CSS or JavaScript is added to the README. The local draft was not submitted to a remote Markdown API.

Headless Edge used a separate local artifact profile and private debugging pipe, not a personal browser session or network debugging listener. No dependencies or browsers were downloaded. Before views use the complete V1 file snapshot, including V1 artwork; after views use the candidate and V2 artwork.

Ignored evidence locations, relative to this repository:

- `.rebrand-local/v2-20260925-013852/baseline/`: complete original tracked-file snapshot.
- `.rebrand-local/v2-20260925-013852/preview/index.html`: before/after review entry point.
- `.rebrand-local/v2-20260925-013852/preview/browser-report.json`: viewport, image, disclosure and SVG measurements.
- `.rebrand-local/v2-20260925-013852/content-report.json`: exact rendered-content accounting.
- `.rebrand-local/v2-20260925-013852/candidate-versus-v1.diff`: complete README comparison; `v2-complete.diff` also includes all reviewed supporting text/vector changes and the binary-header delta.
- `docs/rebrand/screenshots/v2/`: local-only before/after, section, asset and zoom screenshots.

These paths are not public deliverables and must not be force-added. Their absence in a fresh clone is expected.

## Completed local checks

| Check | Actual result |
| --- | --- |
| Before/after width and theme matrix | 18 renders: both versions × 390/768/900px actual README columns × light/dark/dim |
| Horizontal page overflow | None in the matrix, including after expanding all disclosures |
| Broken image loads | None in the matrix |
| Header selection | Mobile variants selected at 390px; standard variants at 768/900px; expected light/dark sources loaded |
| New SVGs | All 23 rendered; measured display-text bounding boxes remain within viewBox |
| PNG fallback | Direct 1200 × 360 light-header rendering |
| Native disclosures | 28; no nesting; all focusable and opened by keyboard Enter; representative Space close passed |
| Navigation | All explicit local anchor destinations found; actual Projects activation reached its target |
| Raw HTML | No exposed details/summary/picture markup detected in rendered text |
| Images removed | Full native text remains available with disclosures expanded; identity, evidence, status and contact do not depend on artwork |
| 200% layout-reflow approximation | Three theme renders at doubled device scale/reduced CSS width, without overflow; this alone is not browser zoom |
| Japanese and project sections | Section screenshots saved; corresponding Japanese copy remains native and expandable near its English section |

Genuine **native 200% browser zoom also passed** in a separate isolated Edge profile. The native default-zoom preference was set to `log(2)/log(1.2)`; no device-metrics override, CSS zoom or page-scale override was used. At the same physical outer width of 947px, the 100% control measured an inner width of 923px and device-pixel ratio 1; the 200% run measured 461px and ratio 2. CSS zoom and visual-viewport scale remained 1. Light/dark/dim passed with zero broken images and no page overflow, including all 28 disclosures expanded. The mobile header correctly selected at the zoomed CSS width.

Twelve native-zoom screenshots (100%/200% × three themes × collapsed/expanded) and `preview/native-zoom-report.json` retain the evidence. This is genuine browser-engine zoom of the local document, not a claim of clicking a browser menu or verifying the live GitHub profile. Manual live GitHub zoom/theme behavior remains a release gate.

## Content accounting

Frozen content source: published V1 commit `19e9febd78f4d6e7fc892256c9a4e75a50ca37ba`; README SHA-256 `d83e35298ee25411aff99454876cd617d52ec6bca7d3b2454c9512132f7e14d2`.

The local audit accounts for **181 original rendered blocks: 162 preserved text matches, four explicitly reviewed SITEARM evidence updates and 15 individually listed presentation/navigation changes**. There are no unexpected missing blocks or missing original external link destinations. Professional copy is counted in expanded native HTML, not comments, alt text or backup files. The independent content review reaches the same result.

This is not a claim of word-for-word unchanged content: headings, repeated navigation and art captions changed, and the four dated evidence paragraphs were corrected. See [the exact content map](CONTENT_MAP.md). A frozen baseline was not rewritten to force a pass. The older V1 checker remains unchanged.

The audit itself passed nine fixtures: an unchanged positive control and eight correctly rejected mutations covering an inflated experience figure, a falsely completed degree, deleted/hidden Japanese copy, a removed publication qualifier, one removed examination-preparation status, a changed SITEARM limitation and a removed contact destination. These tests change only in-memory candidate HTML, not the actual README.

## Candidate-stage repository checks

- `node --check scripts/check-profile.mjs`: passed.
- `node scripts/check-profile.mjs`: passed for all **54 approved public files**, including candidate/root anchors, local links, safe markup, images and sensitive-pattern checks.
- `git diff --check` plus separate checks of all **30 new files**: passed. Extra trailing blank lines in newly drawn SVGs were removed without changing their rendering.
- Root README SHA-256 still equals the frozen V1 README. The original 24-file snapshot is retained; 23 V2 SVGs plus the PNG total 88,520 bytes.
- The Git index is unchanged/empty of staged changes; local HEAD and the existing origin/main tracking reference remain at V1. There is no V2 commit or remote write.
- `.private/`, `.rebrand-local/` and `docs/rebrand/screenshots/` are ignored and untracked. No screenshot, browser profile, private snapshot or local machine path is included in the approved public-file set.
- The sibling portfolio comparison was intentionally not run. V2 does not certify synchronization with another repository or claim that pattern matching guarantees absence of every possible private fact.

## Approved publication handoff

The owner accepted V2 and requested commit/push on 25 September 2026, superseding the candidate-only hold. The accepted candidate was copied to the root README with matching SHA-256; no professional content was changed during promotion. The above unchanged-root/index statements describe the completed candidate stage, not the later release. The release reruns public-file, content and whitespace checks and verifies the remote result. Local render results do not establish a full live GitHub browser/theme review.

## Visual decisions and limits

The mobile header uses its own proportions instead of shrinking all desktop lettering. A single graphic hero is followed by compact native identity, a four-area direction block and selected work; the full biography and inventory no longer lead. Project art is coherent conceptual illustration, with native reading-size labels underneath. At mobile scale the artwork's small category labels are supplementary, not the only source of status.

Local checks do not establish GitHub's sanitizer, outline, image proxy, account-specific theme selection or final profile-column layout. A passed bounds check is not a complete accessibility audit. Public project documentation was inspected, but project experiments and claimed capabilities were not independently executed in this README task. LinkedIn's automated response did not permit a full live destination inspection.

## Release gates

- Owner accepts the candidate's visual direction, planned-project wording and four SITEARM corrections.
- Confirm Sentrivela/Super Bear and capstone public evidence before adding additional cards, implementation claims or links.
- Resolve the live portfolio destination before adding its navigation link; the checked domain forms did not resolve.
- After separate publication approval, inspect the actual GitHub profile in light/dark themes, narrow width, 200% zoom, images-disabled mode and keyboard navigation.
- Do not mark these live-profile gates complete on the strength of local screenshots.
