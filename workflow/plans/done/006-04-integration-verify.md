# 006-04 — Integration verify

Plan: `006-root-tailwind-v4-electrobun-template.md` · Blocked by: 03 · Parallel-safe with: —

## Goal

Prove the whole spec end-to-end: clean build → runnable `.app` under `views://`, dark toggle persists across relaunch with no flash, bilingual fonts, dev HMR.

## Context

- **Verification phase — no feature code.** Fix-only if a check fails; if a failure implies a design change, flag it back rather than redesigning here.
- App: `apps/electrobun-template/`. Built app path (per plan 005): `build/dev-macos-arm64/Electrobun Template-dev.app`.
- Acceptance source: spec §Acceptance — `workflow/specs/2026-05-24-add-tailwind-v4-electrobun-template.md`.

## Steps

- [ ] Clean build: `cd apps/electrobun-template && rm -rf node_modules build dist && bun install && bun run typecheck && bun run build`.
- [ ] Launch the built `.app`; confirm pages styled (light) — centered layout, blue links, pill toggles; Burmese in KhitHaungg, English in sans.
- [ ] Theme: cycle light ↔ dark ↔ system live; quit + relaunch → chosen mode restored, **no** white flash.
- [ ] Language: `my` renders KhitHaungg, `en` renders the sans stack; Myanmar-first intact.
- [ ] `grep` confirms no leftover `.page`/`.lang-toggle` CSS or classNames.
- [ ] `bun start`: edit a utility class → window hot-updates (HMR); revert the probe.
- [ ] Update `apps/electrobun-template/README.md` — brief note: Tailwind v4 styling + dark mode.

## Done when

- All spec acceptance criteria pass.
- `bun run typecheck` + `bun run build` green; `.app` runs; HMR works.
- README mentions Tailwind + dark mode.

## Touches

- `apps/electrobun-template/README.md` — Tailwind/dark-mode note.
- (Verification only; code fixes flagged if needed.)
