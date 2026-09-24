# Profile maintenance

This repository publishes Jericho Ong's GitHub profile. The README is the public entry point; supporting files keep its presentation, privacy checks and relationship to the bilingual portfolio maintainable.

## Repository layout

```text
README.md                         Public English/Japanese profile
SECURITY.md                       Private reporting and publication boundaries
assets/
  profile-header.svg              Original, self-contained profile banner
  patent-publication.png          Preserved IPOPHL publication image
docs/
  profile-maintenance.md          Editorial and synchronization workflow
  profile-sync.json               Reviewed portfolio source fingerprints
scripts/
  check-profile.mjs              Local content, asset and publication checks
.github/workflows/
  profile-check.yml              Automated public-file checks
.gitattributes                    Consistent text and binary handling
.gitignore                        Excluded local files and credentials
```

Keep public supporting material small. Private evidence, raw identity documents, employer records, original personal photographs and unpublished research do not belong in the tracked tree. Local editorial snapshots and preview output are excluded from Git; exclusion is not encryption or access control.

## Relationship to JerichoOng-Portfolio

The portfolio supplies the shared professional narrative. Its `PROFILE_MASTER.md`, content provenance and current English/Japanese content establish identity, project scope and learning status. The GitHub profile emphasizes public research and technical evidence. Owner-confirmed corrections take precedence over older copy.

The review dated **24 September 2026** used the portfolio's working content, including the 23 September updates. It includes the PHP-first toolkit, SITEARM's latest conceptual-geometry scope, the numerical research pathway, professional-development goals and the illustrative Decision Systems Lab. Earlier SITEARM presentation notes are superseded by the latest content and provenance.

GitHub retains the earlier profile's additional subjects: advanced examination interests, JLPT goals, CyberGuard-Anywhere, industrial design and research ethics. Their wording distinguishes experience, ongoing work, published research, learning and future goals. A publication image establishes the facts visible in that document; stronger legal or credential claims require supporting records.

### Update workflow

1. Review the changed portfolio content and its provenance. Confirm which facts are approved for public disclosure.
2. Update the corresponding English and Japanese README sections together. Keep degree progress, course records, examination goals and project status consistent.
3. Inspect new assets and links. Add a live portfolio or project link only after the destination is available and approved for publication.
4. Run the profile check with Node.js 22 or later and Git:

   ```sh
   node scripts/check-profile.mjs
   node scripts/check-profile.mjs --portfolio ../JerichoOng-Portfolio
   ```

5. If the portfolio comparison reports changed source files, review the differences before updating `profile-sync.json`. Fingerprints use SHA-256 over UTF-8 text after normalizing CRLF to LF. Matching fingerprints identify the reviewed source snapshot; they do not prove factual accuracy or translation quality.
6. Preview the README at desktop and narrow widths, expand the disclosures, inspect both languages and review the exact staged diff before publication.

The local comparison is read-only. CI checks this public repository independently; it does not require access to the portfolio, private files or credentials. Neither check rewrites professional claims, publishes the profile, or changes another repository. The portfolio's existing GitHub cache refresh remains a separate read-only evidence import.

## Visual and editorial conventions

- Use clear research questions, methods, evidence and limitations. Academic titles and earned credentials require an established basis.
- Keep PHP/MySQL/SQL visible as the core systems toolkit. Label the portfolio's frontend technologies by their actual context.
- Keep existing subjects represented when editing; improve wording and move lengthy supporting text into native disclosures where useful.
- Use natural English and Japanese with equivalent meaning. Use stable section anchors for navigation.
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
