# 004-02 — Guides (condensed notes)

Plan: `004-root-electrobun-knowledge-base.md` · Blocked by: — · Parallel-safe with: 01

## Goal

Fetch all 11 Electrobun guide `.mdx` files, condense to clipped notes, write as `.md` under `workflow/learning/electron-bun/guides/`.

## Context

- Source repo: `blackboardsh/electrobun`, branch `main`.
- Raw URL base: `https://raw.githubusercontent.com/blackboardsh/electrobun/main/docs/src/content/docs/electrobun/`
- Blob URL base (attribution): `https://github.com/blackboardsh/electrobun/blob/main/docs/src/content/docs/electrobun/`
- Fetch via `curl -s <raw-url>`.
- **Condense contract:** clipped notes per repo brevity convention. Drop filler prose; KEEP every key fact, ordered steps, config keys, and all code snippets. A condensed guide must still be actionable without the online docs.
- **Exclude** `guides/changelog/*` entirely (non-goal per spec).

### Files (11)

`guides/` (9): `bundling-and-distribution` `code-signing` `compatability` `creating-ui` `cross-platform-development` `hello-world` `quick-start` `updates` `what-is-electrobun`
`guides/architecture/` (2): `overview` `webview-tag`

### MDX → MD cleanup (same scaffolding rules as phase 01)

- Strip YAML frontmatter; use title as H1.
- Strip `import … from …;` lines and Astro JSX wrappers; convert `<Aside>` → `> **Note:**`.
- Keep code fences verbatim (even when condensing surrounding prose).
- Save as `.md`.
- First line = attribution: `> Source: <blob-url><relpath>.mdx · fetched 2026-05-24`, blank line, then H1.

## Steps

- [ ] Create dirs `workflow/learning/electron-bun/guides/{,architecture}`.
- [ ] For each of the 11 files: `curl` raw `.mdx`, strip scaffolding, condense prose to clipped notes, write to mirrored path as `.md`.
- [ ] Spot-check `quick-start` + `architecture/overview`: steps/code preserved, prose tightened, no JSX leaked.

## Done when

- 11 `.md` files exist under `guides/` (9 root + 2 architecture). No changelog files.
- Each is condensed but retains steps, config, and code snippets.
- No frontmatter/import/JSX remains.
- Each file starts with the source-attribution line.

## Touches

- `workflow/learning/electron-bun/guides/**` — 11 new `.md` files.
