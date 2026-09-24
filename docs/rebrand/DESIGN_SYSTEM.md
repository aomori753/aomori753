# Design system — Rebrand V2

Local candidate, reviewed 25 September 2026. [Candidate](../../README_REBRAND_V2.md) · [Historical comparison](README_VERSION_COMPARISON.md) · [Content map](CONTENT_MAP.md).

## Direction

Recover the compact opening, recognizable technology marks and clear section rhythm of historical `535c997a0543de05601ccb31b7cf28e8bc15304c`. Do not recover its external widgets, badge density or unsupported claims. Projects precede the extended biography. Long supporting material remains native selectable text in nearby disclosures, with English/Japanese content kept together.

The identity connects physical operations to digital systems: precise linework, strong spacing, a restrained jo. mark and a clear typographic name. It is related to the established portfolio identity, not a website screenshot. No website code, bundled fonts, remote images, animation or tracking is required.

## Brand components

| Component | Format and purpose |
| --- | --- |
| jo. mark | Original vector paths/circles; integrated into each header and supplied separately |
| Standard header | Light/dark SVG, 1200 × 360; concise name, discipline, transition statement and five themes |
| Mobile header | Light/dark SVG, 600 × 400; larger relative lettering and shorter line lengths |
| Header fallback | 1200 × 360 PNG rendered directly from the light SVG; no external source image |
| Project cards | Five original diagrams, each in light/dark SVG at 1200 × 400 |
| Technology icons | Eight local 48 × 48 SVG tiles; three attributed product marks and five original category symbols |

The header uses Segoe UI with Arial/Helvetica/sans-serif fallbacks. No font file is loaded or distributed. The jo. mark is vector geometry. Project titles remain native text below the artwork; important facts, statuses and descriptions never depend on image text alone.

The main native identity is compact, not another large hero. The earlier tagline and brand signature remain in a small labelled disclosure for complete native-text preservation.

## Palette and hierarchy

| Role | Dark | Light |
| --- | --- | --- |
| Header surface | `#090d16` | `#f6f8fd` |
| Main lettering | `#f4f6fc` | `#142239` |
| Accent | `#93a9ff` | `#405fc8` |
| Secondary lettering | `#acb8ce` | `#4d5d78` |
| Structural linework | `#283954` | `#ced8ec` |

Body text uses GitHub's native typography and theme. Product marks retain their relevant brand colors rather than being recolored to imply ownership. Thin diagram lines are decorative; titles and native labels carry the meaning.

## Picture and mobile behavior

The header lists four picture sources in order: narrow dark, narrow light, standard dark, standard light. Narrow sources use a 600px maximum viewport query. The final image is the PNG fallback. Project cards have two theme sources and a local light SVG fallback. Artwork scales proportionally and has explicit dimensions/viewBox and accessible descriptions.

Picture media queries follow browser color-scheme preferences. A GitHub account theme that differs from the operating-system/browser preference must be checked on the actual profile before release; the local preview cannot establish that behavior. Each variant is self-contained and framed, including when its surrounding surface differs.

At a 390px README column, card titles remain visual landmarks; small category/status lettering is supplementary. Native title, category, evidence and status immediately below each card provide the reading-size version. No paragraph is embedded in a card and no diagram pretends to be a working-product screenshot.

## Reading order and truthful labels

1. Brand and compact identity/navigation.
2. Four-area current direction.
3. Selected capstone and research work, with current evidence visible.
4. Planned FieldOps AI and intended field-to-deployment process.
5. Grouped engineering stack and Agentic AI development direction.
6. Full profile, contributions and research ethics.
7. Completed publication record, current study, next goals and longer-term exploration.
8. Professional connections.

FieldOps AI is **PLANNED**. Agentic AI is **BUILDING** a practice, not a deployed system. FDE-style identifies an intended delivery approach, not employment. A publication record is not a grant claim; a course or exam target is not a qualification. Existing project evidence remains attached to its project, with the four SITEARM updates recorded explicitly.

The stack distinguishes core systems, public numerical research, portfolio implementation, workflow tools, developing foundations and future provider architecture. Icons are identification aids, not a proficiency scale. The complete previous technology inventory remains expandable.

## Asset and release boundaries

See [asset credits](ASSET_LICENSES.md) for third-party terms. Original supplied images and legacy concept artwork are retained. V2 uses the new project-card directory without deleting the earlier assets.

During candidate review the root README file was retained while shared header paths contained V2 artwork. After owner acceptance and explicit publication approval on 25 September 2026, the accepted candidate was copied to the root README for release. The separate candidate and complete V1 tracked-file snapshot remain preserved. This does not authorize other-repository or account changes.
