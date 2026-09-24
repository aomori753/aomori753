# Proposed GitHub profile bio

Status: **proposal only — account settings unchanged**. Public bio retrieved through an unauthenticated GitHub API read on 25 September 2026 (Japan time). This document does not authorize a profile-setting change, push or publication.

## Current public bio

Exact `bio` value returned by the [GitHub user API](https://api.github.com/users/aomori753), shown as a JSON string so its whitespace is unambiguous:

```json
"Construction & Logistics DX Independent Researcher  \r\n13-Year Construction PM | Python, Data, Cybersecurity, Exploring Physical AI, & Embodied Intelligence"
```

The source contains two spaces before a carriage-return/line-feed pair. The quotes and escape notation above are JSON representation, not additional characters in the bio.

## Owner-requested proposal

```text
Building Applied AI & Secure Intelligent Systems | Construction & Logistics DX | 13-Year Construction PM | Agentic AI • Cybersecurity • Physical AI
```

This is the exact requested proposal. Its opening “Building” communicates development toward the new professional direction. The topic list should be read alongside the README's explicit cybersecurity-development and Physical AI research-horizon qualifiers.

## Owner-suggested shorter alternative

```text
Applied AI & Secure Systems | Construction & Logistics DX | 13-Year Construction PM | Cybersecurity • Physical AI
```

This shorter wording is preserved as supplied. It is not required by the current character limit. It also removes “Building,” which makes the development status less explicit.

## Recommended qualification-preserving alternative

```text
Building Applied AI & secure systems | Construction & Logistics DX | ~13 years construction PM | Agentic workflows & cybersecurity | Exploring Physical AI
```

This option retains the active-building direction, construction/logistics context and Agentic AI/cybersecurity focus. “~13 years” aligns with the approved approximately-13-years wording, while “Exploring Physical AI” keeps the research horizon distinct from established robotics expertise. The README provides the fuller software/data foundation, current work and status distinctions.

## Character counts and limit

GitHub's official [profile-personalization documentation](https://docs.github.com/en/account-and-profile/tutorials/personalize-your-profile#adding-a-bio-to-your-profile) specifies a **160-character** bio limit. Checked on 25 September 2026.

| Text | Unicode code points | UTF-16 code units | Within 160 under both counts |
| --- | ---: | ---: | --- |
| Current API bio, including its whitespace | 155 | 155 | Yes |
| Owner-requested proposal | 147 | 147 | Yes |
| Owner-suggested shorter alternative | 113 | 113 | Yes |
| Recommended alternative | 154 | 154 | Yes |

Counts include spaces, punctuation and the current bio's two line-ending characters. They exclude the display code fences and their surrounding newlines. All characters used here are within Unicode's Basic Multilingual Plane, so these two counting methods agree. The official documentation states the limit without specifying its underlying Unicode-counting implementation; no account-setting submission was used to test it.

## Recommendation and publication boundary

The requested 147-character proposal fits, so shortening is optional. Prefer the 154-character qualification-preserving alternative if the bio must communicate its own development and exploration boundaries without relying on the README.

None of the options should be presented as AI, cybersecurity or Physical AI expertise, FDE employment, completed provider integrations or a deployed autonomous system. FieldOps AI's current scope belongs in the README as active architecture/workflow development, with its architecture visual labelled concept.

The sidebar bio and README are separate surfaces. Editing or publishing this repository does not change the account bio. Keep this proposal for owner review; do not update the account automatically.
