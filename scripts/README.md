# Profile validation

`check-profile.mjs` checks this repository's public files without changing them or contacting external services. It runs with Node.js 22 or newer and Git; no dependency installation, credentials or private files are required.

Run from the repository root:

```sh
node --check scripts/check-profile.mjs
node --check scripts/check-profile.test.mjs
node scripts/check-profile.mjs
node --test scripts/check-profile.test.mjs
git diff --check
```

Use `node scripts/check-profile.mjs --help` for command usage. A successful check exits with code zero; invalid content or an execution failure exits with code one.

## What it checks

- The explicit public file list, including nonignored untracked files; known internal maintenance paths are rejected if tracked, and links cannot target unpublished files or leave the repository.
- Markdown navigation, disclosure structure, left-aligned native prose, local image sources and supported HTML.
- The published profile's undated professional direction, Sentrivela name and FieldOps status, concept and private-source labels. FieldOps cannot advertise a public source repository.
- SVG dimensions, accessible descriptions and local resources; PNG structure and metadata restrictions.
- Selected credential and private-data patterns, and internal audit identifiers in public prose. Matched sensitive content is withheld from diagnostics.

The checker reads the current working tree, including unstaged edits and deletions. Required files must still exist. Symbolic links and other special files cannot substitute for approved public files.

## Updating the checks

Keep scripts read-only, deterministic and limited to this repository. Document inputs, outputs, runtime requirements and limitations. Add a file to `PUBLIC_FILES` only when it serves a public purpose; review its contents before updating the list.

Use the built-in Node.js test runner for meaningful regressions. Tests exercise valid fixtures and deliberate failures such as broken links, unsafe markup and missing status labels. Construct synthetic sensitive values in tests; never copy real credentials or private records into fixtures. The same checks run on Linux and Windows in GitHub Actions.

GitHub Actions dependencies use immutable revision pins with readable version comments. Those pins and immutable source URLs identify executable dependencies or evidence; release-review fingerprints do not belong in public prose.

## Limits

The supported Markdown and SVG checks are deliberately narrow, not complete format parsers. They do not establish factual accuracy, inspect image pixels, verify external destinations or reproduce GitHub's renderer. Review English and Japanese claims, image content, layout and the exact staged diff before publication. See [Security and privacy](../SECURITY.md) for reporting and disclosure guidance.
