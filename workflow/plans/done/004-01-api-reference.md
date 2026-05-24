# 004-01 — API reference (verbatim, cleaned)

Plan: `004-root-electrobun-knowledge-base.md` · Blocked by: — · Parallel-safe with: 02

## Goal

Fetch all 22 Electrobun API `.mdx` files, clean MDX/Astro syntax, write as full-fidelity `.md` under `workflow/learning/electron-bun/apis/`.

## Context

- Source repo: `blackboardsh/electrobun`, branch `main`.
- Raw URL base: `https://raw.githubusercontent.com/blackboardsh/electrobun/main/docs/src/content/docs/electrobun/`
- Blob URL base (for source attribution header): `https://github.com/blackboardsh/electrobun/blob/main/docs/src/content/docs/electrobun/`
- Fetch via `curl -s <raw-url>`.
- **Fidelity contract (critical):** keep ALL technical detail — signatures, params, types, return values, code examples, tables. Do NOT summarize. Only strip Astro/JSX scaffolding.

### Files (22)

`apis/` (15): `application-icons` `application-menu` `browser-view` `browser-window` `build-config` `bun` `bundled-assets` `bundling-cef` `context-menu` `events` `paths` `tray` `updater` `utils` `webgpu`
`apis/browser/` (5): `draggable-regions` `electrobun-webview-tag` `electrobun-wgpu-tag` `electroview-class` `global-properties`
`apis/cli/` (2): `build-configuration` `cli-args`

### MDX → MD cleanup rules (apply to every file)

- Strip YAML frontmatter (`---\ntitle: "X"\n---`). Use the title as the H1 (`# X`).
- Strip `import { … } from "…";` lines.
- `<Aside>…</Aside>` → blockquote (`> **Note:** …`); keep inner text.
- `<Tabs>`/`<TabItem label="X">` → `### X` subsections (or keep code blocks sequentially with a label). Keep all tab content.
- Strip stray wrapper tags (`<p>`, `<div>`) but keep their inner content; preserve markdown/code untouched.
- Keep all code fences, tables, links as-is.
- Save as `.md` (not `.mdx`).
- First line of each file = source attribution:
  `> Source: <blob-url><relpath>.mdx · fetched 2026-05-24`
  then a blank line, then the H1.

## Steps

- [ ] Create dirs `workflow/learning/electron-bun/apis/{,browser,cli}`.
- [ ] For each of the 22 files: `curl` raw `.mdx`, apply cleanup rules, write to mirrored path as `.md`.
- [ ] Spot-check 2–3 (e.g. `build-config`, `browser/electroview-class`) that signatures/examples survived and no `import`/JSX leaked through.

## Done when

- 22 `.md` files exist under `apis/` mirroring source structure (15 root + 5 browser + 2 cli).
- No YAML frontmatter, `import` lines, or raw Astro JSX components remain.
- Signatures/params/examples intact (verbatim, not summarized).
- Each file starts with the source-attribution line.

## Touches

- `workflow/learning/electron-bun/apis/**` — 22 new `.md` files.
