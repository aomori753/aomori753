# Publication control — Rebrand V2

**Status: owner-approved release. On 25 September 2026, the owner accepted V2 and explicitly requested commit/push to `aomori753/aomori753`.** The earlier local-only hold is superseded for this reviewed profile release, not for unrelated account or repository changes.

The retained candidate is [README_REBRAND_V2.md](../../README_REBRAND_V2.md), prepared on `rebrand/profile-v2-20260925`. Its accepted content has been copied into the root README without editorial changes. The release target is the verified default branch `main`. Original V1 Markdown and assets remain in the ignored baseline snapshot and Git history.

## Before any replacement or publication

1. Obtain the owner's acceptance of the actual candidate and explicit authority for any later remote publication. Earlier push requests do not override the newer local-only brief.
2. Review [content changes](CONTENT_MAP.md), [evidence limits](CONTENT_REVIEW.md), [licenses](ASSET_LICENSES.md) and [actual render results](RENDER_CHECKLIST.md). Review the complete candidate-versus-V1 diff, not only the banner.
3. Resolve any new factual/link decisions without treating missing public evidence as proof that a repository is private. Do not read private project contents or change their visibility without new authority.
4. If accepted, replace only the local root README content with the accepted candidate and retain the candidate file. Use an explicit reviewed edit; preserve both snapshots and the complete diff. Rerender after this change.
5. Run `node --check scripts/check-profile.mjs`, `node scripts/check-profile.mjs` and `git diff --check`. Recheck actual Markdown and original/candidate content accounting. The V1 frozen-copy comparison cannot certify the four V2 factual changes; use the documented V2 review.
6. Inspect `git status --short --branch`, `git diff --stat` and the complete diff. Check ignored paths and ensure local notes, snapshots, screenshots, browser profiles and credentials are excluded. The public-file checker checks a deliberately exact allowlist, not every possible privacy risk.

## Approved release sequence

1. Read `git remote -v` and `git branch --show-current`; verify the target is the owner's `aomori753/aomori753` repository. Fetch the approved remote read-only and compare the intended base with its current branch. Do not force-push or overwrite intervening work.
2. Inspect repository-local author/committer identity, using an approved GitHub noreply identity. Do not alter global configuration.
3. Stage only the explicitly reviewed V2 files listed in `REBRAND_V2_CHANGE_RECORD.txt`, plus the root README only after its separately accepted replacement. Do not use `git add .`, `git add -A` or force-add ignored material.
4. Run `git diff --cached --check`, inspect `git diff --cached --stat` and review the full `git diff --cached`. Verify exclusions using `git ls-files` and `git check-ignore` for local evidence paths. Rerun the checker against the final working tree. Stop if unrelated or private material appears.
5. Commit using a descriptive message such as `feat: recover visual profile identity in rebrand v2`. Review `git show --stat --oneline HEAD` and its full diff.
6. Push only to the destination branch explicitly approved by the owner, using a normal non-force push. Approval to publish the profile must include the intended merge/update of the profile's default branch; a local candidate branch alone does not change the profile.
7. Verify the resulting remote commit, CI and actual GitHub profile. Complete live dark/light/mobile/200% zoom and link checks before reporting publication as complete. Account bio, pins, sidebar, visibility and portfolio deployment remain separate tasks.

Approval covers this sequence for the accepted V2 release. Verify the actual remote commit and CI after the push; authorization alone is not evidence of successful publication. Full live browser/theme verification must be reported honestly if the environment cannot perform it.

## Recovery without destructive cleanup

The published baseline remains `19e9febd78f4d6e7fc892256c9a4e75a50ca37ba`. A byte-for-byte copy of its 24 tracked files is retained under `.rebrand-local/v2-20260925-013852/baseline/`; the README checksum is recorded in the render checklist.

For local rejection, first preserve the V2 candidate/diff and inspect current changes. Restore only explicitly chosen V1 text/asset files from that snapshot through reviewed file operations; do not reset the repository or delete the candidate wholesale. Newly created V2 files can remain on the local branch or be removed individually only on instruction. Check exact paths and preserve unrelated edits.

After a future approved public commit, use a reviewed revert commit on the approved branch, rerun checks and obtain authority for its normal push. Do not rewrite public history. A reverted commit remains in history: it is not a reliable remedy for publishing a secret; exposed credentials require revocation and an incident-specific response.
