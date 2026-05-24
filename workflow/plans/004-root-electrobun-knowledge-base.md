# Plan 004 — Electrobun Knowledge Base

Source: `workflow/specs/2026-05-24-electrobun-knowledge-base.md`

## Summary

Mirror Electrobun's official docs into `workflow/learning/electron-bun/` as a local KB for AI agents. Fetch `.mdx` from `blackboardsh/electrobun` (branch `main`), clean MDX/Astro syntax to plain `.md`. APIs kept verbatim (full fidelity); guides condensed to clipped notes; a concise README indexes + links everything. One-time fetch, no sync script, no changelog.

## Phases

| #   | Phase                    | File                                 | Blocked by | Parallel-safe with |
| --- | ------------------------ | ------------------------------------ | ---------- | ------------------ |
| 01  | API reference (verbatim) | `plans/todo/004-01-api-reference.md` | —          | 02                 |
| 02  | Guides (condensed)       | `plans/todo/004-02-guides.md`        | —          | 01                 |
| 03  | README index             | `plans/todo/004-03-readme-index.md`  | 01, 02     | —                  |

## Notes / risks

- **Source paths verified** (GitHub API, 2026-05-24): 22 API `.mdx`, 11 guide `.mdx` (excl. changelog), root `index.mdx`. If upstream adds/renames files later, re-fetch the dir listing first.
- **Raw URL base:** `https://raw.githubusercontent.com/blackboardsh/electrobun/main/docs/src/content/docs/electrobun/<path>`.
- **MDX cleanup is the real work:** files mix YAML frontmatter, `import { X } from "@astrojs/..."`, JSX components (`<Aside>`, `<Tabs>`, `<TabItem>`, `<p>`), and markdown. Cleanup rules defined per-phase — keep them consistent across 01/02.
- **Fidelity contract:** API phase must NOT drop signatures/params/types/examples; only strip Astro/JSX scaffolding. Guide phase may condense prose but must keep code snippets + key steps.
- 01 ∥ 02 (disjoint `apis/` vs `guides/`). 03 needs the final file list from both → blocked by 01, 02.
- Existing `workflow/learning/electron-bun/README.md` is a stub — phase 03 overwrites it.
