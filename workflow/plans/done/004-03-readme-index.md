# 004-03 — README index

Plan: `004-root-electrobun-knowledge-base.md` · Blocked by: 01, 02 · Parallel-safe with: —

## Goal

Write a concise `workflow/learning/electron-bun/README.md` — the entry point an agent reads first — with a short intro and grouped links to every topic file.

## Context

- Blocked by 01 + 02: needs the final list of written `.md` files to link (no dead links).
- Overwrites the existing stub `README.md` (currently just `# ElectronBun Knowledge Based`).
- Intro text source: root `index.mdx` →
  `https://raw.githubusercontent.com/blackboardsh/electrobun/main/docs/src/content/docs/electrobun/index.mdx` — condense to 2–4 lines (what Electrobun is + what this KB is for).
- Style: concise/clipped (root `CLAUDE.md`). README is an index, not prose.
- Purpose reminder: agent reads README → follows ONE link to the relevant reference. Grouping + clear link labels matter.

## Steps

- [ ] `curl` root `index.mdx`, condense to a 2–4 line intro (Electrobun = …; this KB = local agent reference, fetched 2026-05-24, source link).
- [ ] List actual files written under `apis/` and `guides/` (verify against disk, not this plan, in case upstream changed).
- [ ] Build grouped link sections:
  - **APIs** — subgroup by `apis/` root, `apis/browser/`, `apis/cli/`; one bullet per file, link + 3–6 word descriptor.
  - **Guides** — subgroup `guides/` root, `guides/architecture/`; same format.
- [ ] Add a one-line provenance note (source repo URL + fetch date + "excludes changelog").
- [ ] Verify every link resolves to an existing file (no dead links).

## Done when

- `README.md` has a concise intro + grouped, labeled links to all 33 topic files.
- No dead links; no changelog references.
- Reads as a navigable index an agent can use to jump straight to one reference.

## Touches

- `workflow/learning/electron-bun/README.md` — overwrite stub with full index.
