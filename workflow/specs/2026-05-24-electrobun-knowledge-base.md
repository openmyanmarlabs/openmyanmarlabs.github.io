# Spec — Electrobun Knowledge Base (2026-05-24)

One-line: Local, AI-agent-readable knowledge base of Electrobun's docs so agents skip fetching the live GitHub docs.
Source: `workflow/ideas/create-knowledge-base-electron-bun.md`

## Goal

Mirror Electrobun's official docs (APIs + guides) into `workflow/learning/electron-bun/` as a navigable local KB. A concise `README.md` index links to grouped topic files; an AI agent reads the index first, then follows links to only the relevant references — no online fetch needed.

## Users / context

- **Primary user:** AI coding agents working in this repo that need Electrobun reference (build config, browser windows, CLI, bundling, etc.).
- **Secondary:** human devs wanting quick offline reference.
- English only — technical agent/dev reference. Not bilingual (no Burmese).

## Scope

**In:**

- Source: `blackboardsh/electrobun` repo, path `docs/src/content/docs/electrobun/` (branch `main`), fetched via GitHub API.
- **22 API files** → verbatim, cleaned (strip MDX/Astro frontmatter + JSX components; keep ALL technical detail: signatures, params, types, examples). Includes `apis/browser/*` (5) and `apis/cli/*` (2).
- **11 guide files** → condensed clipped notes (repo brevity convention). Includes `guides/architecture/*` (2).
- Root `index.mdx` content → folded into the KB `README.md`.
- `README.md` index: concise, groups topics, links to every topic file. Replaces the existing stub.
- Each topic file: header note with source URL + fetch date (provenance + escape hatch to live docs).
- Mirror source folder structure: `apis/` (with `browser/`, `cli/` subfolders) and `guides/` (with `architecture/`).

**Out (non-goals):**

- **Changelog** — all 12 `guides/changelog/*` files excluded (version-history noise, low agent value).
- No re-runnable sync script — this is a one-time agent fetch. Re-sync = re-invoke later.
- No Burmese translation / i18n.
- No transformation of Electrobun docs into this repo's own app code; KB is reference only.
- No editing/correcting the upstream docs' content (faithful mirror, not a rewrite — beyond the cleanup/condense rules above).

## Requirements

- [ ] Fetch all non-changelog `.mdx` under the source path via GitHub API.
- [ ] API files: written verbatim with MDX/Astro frontmatter + JSX/components stripped, all technical content intact.
- [ ] Guide files: rewritten as concise clipped notes, preserving key facts, steps, and any code snippets.
- [ ] Folder layout under `workflow/learning/electron-bun/` mirrors source: `apis/`, `apis/browser/`, `apis/cli/`, `guides/`, `guides/architecture/`.
- [ ] `README.md` is a concise index: short intro (from root `index.mdx`) + grouped link list (APIs, Guides) covering every topic file.
- [ ] Every topic file starts with a one-line source attribution (upstream URL + `fetched 2026-05-24`).
- [ ] No `changelog/` content present.
- [ ] Output passes the repo's prettier auto-format (markdown).

## Constraints

- Tech: Bun monorepo; fetch via GitHub API (`api.github.com` contents/raw). No new runtime deps required for a one-time fetch.
- Style: docs concise/clipped per root `CLAUDE.md` — applies to README + guide files (API files keep full fidelity by exception).
- Files are `.md` (not `.mdx`) in the KB — plain markdown, no Astro/JSX.
- Provenance must be preserved so a stale KB can be spotted and re-fetched.

## Acceptance — done when

- `workflow/learning/electron-bun/README.md` is a concise grouped index linking to all 33 topic files; no dead links.
- 22 API files exist as cleaned-verbatim markdown with intact signatures/params/examples.
- 11 guide files exist as condensed notes.
- Source folder structure is mirrored; no changelog files present.
- Each topic file carries source URL + fetch date.
- An agent can answer "how do I configure an Electrobun build?" by reading README → following one link, without going online.

## Open questions

- None blocking. (Folder, fidelity, changelog scope, and fetch method all resolved during the interview.)
