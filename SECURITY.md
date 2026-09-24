# Security and privacy

This is a public professional-profile repository. Everything committed to it, including earlier revisions and commit metadata, should be treated as public.

## Report an exposure privately

For an accidental disclosure or security concern, contact Jericho through the [LinkedIn profile](https://www.linkedin.com/in/jericho-o-52b9b434a/) linked from the README. Start with the affected repository path or commit reference and a brief description. Do not copy credentials, identity documents, personal records or exploit details into a public issue or pull request.

## Publication boundaries

Keep authentication material, identity and immigration documents, home addresses, private contact details, employment evidence, client records and confidential research outside the public repository. The published industrial-design image is an existing public-document reference; additional evidence requires its own disclosure review.

The ignore rules exclude local notes, previews, common credential files and development artifacts from ordinary Git additions. Ignored directories remain ordinary local folders: they are neither encrypted nor protected from forced additions, backups, cloud synchronization or filesystem access. Store sensitive originals in a separately protected location.

Removing a file or adding it to `.gitignore` does not remove it from Git history or existing copies. If a credential is exposed, revoke or rotate it through its issuer. Any history cleanup must be planned against the exact affected data and coordinated with repository users. See [GitHub's guidance on removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

## Maintainer checks

Run `node scripts/check-profile.mjs` and inspect the exact staged diff before publication. The check restricts the public file set, validates local references and detects selected sensitive-data patterns without printing matched values. It is a guard against common mistakes, not a comprehensive security audit. Review images, newly added text and commit metadata separately.

Use the account's verified GitHub no-reply email for public commits. Git supports a repository-local email setting; global configuration does not need to change. Confirm both author and committer identity before committing. See [GitHub's commit-email guidance](https://docs.github.com/en/account-and-profile/how-tos/email-preferences/setting-your-commit-email-address).
