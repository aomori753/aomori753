# Local verification and release gates

Review date: 25 September 2026. Review branch: `rebrand/profile-20260925`. The owner approved committing and publishing this candidate on 25 September 2026. The results below record pre-publication verification; repository history, CI and the live profile establish the release outcome.

## Baseline and copy integrity

The repository root and initial clean worktree were confirmed before editing. Initial branch: `main`. Baseline commit: `3237601592ddd1db00b682f2da9397e2858cafea`.

The byte-for-byte README baseline has SHA-256 `147e867ad1cf6c1af5db3336daf3bd99cf572d9606040308bb2e47d0540ab917`. All ten initial tracked files were copied, with paths preserved, under ignored `.rebrand-local/20260925-004105/baseline/` before changes. Original artwork and publication image are unchanged.

The inventory was created before candidate composition: 166 rendered text blocks, 15 link-label/target occurrences, two images and three visible old-banner strings. It covers 64 paragraphs, 49 table cells, 13 table headers, 16 list entries, 17 headings and seven disclosure summaries. Footer wording is included.

Both PowerShell Markdown rendering and GitHub’s Markdown API HTML passed **169/169 preservation units**, with zero missing/changed original blocks or links. README.md was replaced only after the candidate passed. Its final SHA-256 is `d83e35298ee25411aff99454876cd617d52ec6bca7d3b2454c9512132f7e14d2`.

Normalization is whitespace only after reading rendered HTML: words, punctuation, numbers, case and qualifiers remain exact. Comments, alt attributes, hidden elements and candidate artwork cannot satisfy preservation. Twelve positive/negative checker fixtures passed, including rejection of changed qualifiers, numbers, case, links, comment-only/alt-only/hidden copy and a deleted repeated status.

The final report records 22 new/repeated visible segments. Manual review approved only: the work-index label; three repeated project names and two Read navigation labels; three Concept captions; nine Japanese disclosure labels; five separators between preserved table headers; and the Brand signature label. No substantive claim, new professional tool, qualification, status or external destination was added. Independent review confirmed that table cells and project statuses remain attached to the correct subjects.

## Actual rendering

Authenticated publication was not needed. The public baseline and public-intended candidate were sent to the unauthenticated GitHub Markdown API with `mode=gfm` and repository context `aomori753/aomori753`. Both returned HTTP 200. No private files or project data were sent. The returned HTML retains the four picture elements, their theme sources, all 17 disclosures and the native bilingual content.

Installed Microsoft Edge `153.0.4234.48` rendered local artifacts in a separate headless profile with a private debugging pipe, not an exposed network port or the owner’s browser profile. No browser or dependency was downloaded. Node `24.11.1`, Python `3.12.10` and installed PowerShell Markdown tooling were used.

The local wrapper uses approximate native GitHub CSS, not custom portfolio styling. Only preview files adapt repository-relative asset/doc paths and the API’s `user-content-` anchor prefix for local navigation. Original API fragments remain saved unmodified. This preview does not reproduce GitHub’s live stylesheet, document outline or theme-setting client behavior.

| Actual check | Result |
| --- | --- |
| Before/after at exact 360, 390, 768 and 900 px README columns; light, dark and dim | 24 actual screenshots; no page-wide overflow or broken images |
| Final candidate, disclosures expanded, all 12 width/theme combinations | No page-wide overflow; zero nested disclosures; no visible raw markup |
| Theme selection | Four correct image sources in each mode; dark artwork also used for dimmed background; one displayed image per picture |
| Eight individual SVG renders | Full-size screenshots inspected; no clipped essential geometry or embedded text/font dependency |
| Mobile compositions and Japanese text | Visually inspected; readable line wrapping, no missing Japanese glyphs observed |
| Keyboard disclosures | All 17 summaries focusable and opened with Enter; representative Space-to-close check passed |
| Local custom anchors | All internal targets found; actual SITEARM index click reached its section after the documented local prefix adaptation |
| Images-disabled reading | All 169 preserved text units present in expanded browser text; image-free screenshot saved |
| 200% reflow approximation | 450 CSS px at device scale factor 2, light/dark/dim; no page-wide overflow |
| Actual browser-menu 200% zoom | Pending owner/manual check; device emulation is not claimed as browser UI zoom |
| Final live GitHub profile and outline | Pending publication approval and actual post-publication inspection |

Two focused refinements were made: reduce opening repetition; then use bold stacked row labels instead of headings to avoid wrongly subordinating shared methodology to the last table row. The local anchor adapter and keyboard test event sequence were also corrected before the final results above.

## Assets and security

New SVGs total 33,748 bytes; the header PNG is 70,474 bytes. Including the unchanged legacy header and publication image, total public image payload is 227,737 bytes, well below the approximate 2 MB target. New SVGs are valid XML with explicit aspect ratios, accessible descriptions and no fonts, scripts, events, embedded HTML or external resource references. The PNG fallback is a direct rendering of the light header; the original publication was not edited. The publication-stage diff check caught and removed one redundant final blank line from each new SVG; geometry and rendered appearance are unchanged.

The public guard explicitly allows the 24 required public files. It scans text for common credential/private-contact/machine-path signatures, validates local links and explicit anchors, checks disclosure/picture structure, and checks SVG/PNG safety. Twenty-five focused guard cases passed, including rejection of remote/malformed picture sources, active SVG and PNG metadata/trailing payloads. These checks reduce risk; they are not a guarantee that every possible secret or privacy issue can be detected.

Final full public guard: PASS for all 24 approved public files. Node syntax, both final rendered-copy comparisons, all 12 integrity fixtures and `git diff --check`: PASS. Local baseline/preview and existing private/editorial directories are confirmed ignored. Git reported only expected platform line-ending notices for the two Git configuration text files; no whitespace errors were reported.

No global settings, credentials, repository visibility, other repository files, website content, pins or account sidebar were changed. The initial local-review handover performed no commit or publication; the subsequent owner request authorizes those actions for this profile repository. The existing portfolio synchronization fingerprints remain unchanged; their broader source comparison was intentionally not rerun outside this task’s limited public-reference scope.

## Existing external links

Unauthenticated HEAD requests with redirects enabled were checked on 25 September 2026, 00:51:53–00:51:56 JST. Seven exact destinations returned HTTP 200 with no redirects: the GitHub profile, both research repositories, IPA examinations, MLIT i-Construction, JILS and PPC legal materials. LinkedIn returned HTTP 999 and remains a manual check. Automated inaccessibility is not evidence of deletion. All original URLs remain unchanged.

## Local preview and repeatable commands

Open `.rebrand-local/20260925-004105/preview/index.html` in a browser. It links to the before/after light, dark and dim pages. Actual captures and browser metrics are in its `screenshots/` directory and `browser-report.json`. For manual preview, image theme follows the browser color-scheme preference; the automated screenshots explicitly emulate the named scheme.

Run from the repository root:

```powershell
node scripts/check-profile.mjs
python scripts/check-rebrand.py --baseline .rebrand-local/20260925-004105/baseline/README.md --candidate README.md --report .rebrand-local/20260925-004105/integrity/final-local.json
python scripts/check-rebrand.py --baseline .rebrand-local/20260925-004105/baseline/README.md --baseline-html .rebrand-local/20260925-004105/preview/before.gfm.html --candidate README.md --candidate-html .rebrand-local/20260925-004105/preview/after.gfm.html --report .rebrand-local/20260925-004105/integrity/final-github.json
git diff --check
```

To regenerate the saved local artifacts, the ignored helpers are `render-gfm.ps1` (network rendering of only the baseline/candidate) and `review.mjs` (installed Edge rendering and checks), both under the same timestamped directory. These are local review tools, not publishing dependencies. API fragments must correspond to the exact candidate being checked; do not supply stale render output after editing. Ordinary application data outside controllable cache paths cannot be ruled out or prevented by these instructions.

## Owner approval and rollback

Before publication: review the candidate and diff, verify LinkedIn and real browser 200% zoom, approve the copy/layout, rerun checks and inspect only intended staged files with a configured private-safe Git identity. Do not stage ignored baselines, previews or browser data. Commit/push only after explicit publication approval.

After approved publication: inspect the actual GitHub profile in light/dark/dim modes at narrow widths, expand both languages, test keyboard navigation, PNG fallback, document outline and section anchors. Pins/sidebar changes require separate approval.

For rollback before commit, first preserve any subsequent unrelated work in a new ignored snapshot. Compare each touched original file with its timestamped baseline and reverse only the rebrand hunks; do not overwrite later edits. New assets/docs/helpers can be moved into an ignored review archive after checking for later edits and references. Keep the ignore rule until all local review artifacts are safely excluded. After a local task commit, revert that specific commit only after reviewing intervening changes. Do not reset, clean or force-push.
