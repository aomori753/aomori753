# Profile maintenance

This repository publishes Jericho Ong's GitHub profile. The README is the public entry point; supporting files keep its presentation, privacy checks and relationship to the bilingual portfolio maintainable.

## Repository layout

```text
README.md                         Public English/Japanese profile
README_REBRAND_V2.md               Retained owner-approved V2 candidate
AGENTS.md                         Content, scope and release instructions
SECURITY.md                       Private reporting and publication boundaries
assets/
  brand/                          Theme-aware header and PNG fallback
  icons/                          Minimal attributed marks/category icons
  project-cards/                  V2 light/dark conceptual project cards
  projects/                       Original conceptual project illustrations
  profile-header.svg              Preserved earlier profile banner
  patent-publication.png          Preserved IPOPHL publication image
docs/
  profile-maintenance.md          Editorial and synchronization workflow
  profile-sync.json               Reviewed portfolio source fingerprints
  rebrand/                        Presentation decisions and verification
scripts/
  check-profile.mjs              Local content, asset and publication checks
  check-rebrand.py                Frozen rendered-copy comparison
.github/workflows/
  profile-check.yml              Automated public-file checks
.gitattributes                    Consistent text and binary handling
.gitignore                        Excluded local files and credentials
REBRAND_CHANGE_RECORD_*.txt        Public-safe local review change record
REBRAND_V2_CHANGE_RECORD.txt       V2 decisions, checks and release gates
```

Keep public supporting material small. Private evidence, raw identity documents, employer records, original personal photographs and unpublished research do not belong in the tracked tree. Local editorial snapshots and preview output are excluded from Git; exclusion is not encryption or access control.

The 25 September 2026 presentation candidate is documented in [rebrand/design.md](rebrand/design.md) and [rebrand/verification.md](rebrand/verification.md). Its exact README baseline and local preview stay under ignored `.rebrand-local/`. The root change record records the local candidate, not a remote release. The professional-copy review date remains unchanged.

The **V2 recovery candidate** is retained in [README_REBRAND_V2.md](../README_REBRAND_V2.md), with its [design system](rebrand/DESIGN_SYSTEM.md), [content map](rebrand/CONTENT_MAP.md) and [release control](rebrand/PUBLICATION_CHECKLIST.md). It recovers the stronger historical visual structure while retaining current facts and recording four bounded SITEARM evidence corrections. On 25 September 2026, the owner accepted V2 and authorized commit/push; the root README now contains the accepted candidate. The complete V1 snapshot remains recoverable. The older lowercase design/verification documents describe V1, not V2 acceptance.

The subsequent [Main Concept V2 continuation](rebrand/MAIN_CONCEPT.md) and Sentrivela rename were prepared locally, then accepted with fresh commit/push approval on 25 September 2026. The root README now matches the retained accepted candidate. Its undated professional direction, owner-specified FieldOps design stage and cybersecurity pillar are not another repository synchronization. The [bio proposal](rebrand/PROFILE_SETTINGS_PROPOSED.md) does not change account settings. This release uses the new explicit approval, not authorization carried over from earlier work.

## Relationship to JerichoOng-Portfolio

The portfolio supplies the shared professional narrative. Its `PROFILE_MASTER.md`, content provenance and current English/Japanese content establish identity, project scope and learning status. The GitHub profile emphasizes public research and technical evidence. Owner-confirmed corrections take precedence over older copy.

The review dated **24 September 2026** used the portfolio's working content, including the 23 September updates. It includes the PHP-first toolkit, SITEARM's latest conceptual-geometry scope, the numerical research pathway, professional-development goals and the illustrative Decision Systems Lab. Earlier SITEARM presentation notes are superseded by the latest content and provenance.

On 25 September, V2's [public-source review](rebrand/CONTENT_REVIEW.md) found SITEARM's published numerical implementation and generated research records. The candidate updates that evidence while explicitly retaining the absence of physical validation. The sibling portfolio was not read or changed for this V2 task, and its source fingerprints were not refreshed. These candidate corrections must be reconciled with approved portfolio content in a separately authorized synchronization review; do not claim both repositories were synchronized by this local rebrand.

GitHub retains the earlier profile's additional subjects: advanced examination interests, JLPT goals, Sentrivela, industrial design and research ethics. Their wording distinguishes experience, ongoing work, published research, learning and future goals. A publication image establishes the facts visible in that document; stronger legal or credential claims require supporting records.

### Update workflow

1. Review the changed portfolio content and its provenance. Confirm which facts are approved for public disclosure.
2. Obtain owner approval before changing professional wording. For approved factual updates, update the corresponding English and Japanese README sections together. Keep degree progress, course records, examination goals and project status consistent. Presentation-only work must retain the exact copy and pass the rendered-content comparison.
3. Inspect new assets and links. Add a live portfolio or project link only after the destination is available and approved for publication.
4. Run the profile check with Node.js 22 or later and Git:

   ```sh
   node scripts/check-profile.mjs
   node scripts/check-profile.mjs --portfolio ../JerichoOng-Portfolio
   ```

5. If the portfolio comparison reports changed source files, review the differences before updating `profile-sync.json`. Fingerprints use SHA-256 over UTF-8 text after normalizing CRLF to LF. Matching fingerprints identify the reviewed source snapshot; they do not prove factual accuracy or translation quality.
6. Preview the README at desktop and narrow widths, expand the disclosures, inspect both languages and review the exact staged diff before publication.

The local comparison is read-only. Run the broader `--portfolio` comparison only when that source-reading scope is authorized; it was not rerun for the presentation-only rebrand, whose reference scope is limited to approved public content and brand assets. CI checks this public repository independently; it does not require access to the portfolio, private files or credentials. Neither check rewrites professional claims, publishes the profile, or changes another repository. The portfolio's existing GitHub cache refresh remains a separate read-only evidence import.

## Visual and editorial conventions

- Use clear research questions, methods, evidence and limitations. Academic titles and earned credentials require an established basis.
- Keep PHP/MySQL/SQL visible as the core systems toolkit. Label the portfolio's frontend technologies by their actual context.
- Keep existing subjects represented when editing; move lengthy supporting text into native disclosures where useful. Do not rewrite wording during a presentation-only task.
- Preserve both languages and their current claims. Any substantive translation or wording improvement needs owner approval. Use stable section anchors for navigation.
- Host profile images locally. The banner uses the portfolio's graphite and blue palette and contains no external fonts, scripts or network references.
- Preserve the industrial-design publication as supplied. The existing filename is retained so earlier links continue to work.
- Use LinkedIn and GitHub as the public contact routes. Publish personal contact details only when specifically intended for that purpose.

## Public references

The following destinations were checked during this review. Institutional sources support terminology and research context, not personal achievements or endorsement.

- [Construction & Logistics DX Japan](https://github.com/aomori753/construction-logistics-dx-japan)
- [Embodied Anticipatory Personal Assistant](https://github.com/aomori753/Embodied-Anticipatory-Personal-Assistant)
- [IPA examination categories](https://www.ipa.go.jp/shiken/kubun/list.html)
- [MLIT i-Construction](https://www.mlit.go.jp/tec/i-construction/index.html)
- [Japan Institute of Logistics Systems](https://www1.logistics.or.jp/)
- [PPC laws and policies, including APPI](https://www.ppc.go.jp/en/legal/)
- [NVIDIA Isaac Sim](https://developer.nvidia.com/isaac/sim)
- [NVIDIA Isaac Lab](https://developer.nvidia.com/isaac/lab)

See [SECURITY.md](../SECURITY.md) for private reporting and the limits of repository checks.
