# 005-04 — Integration + verify

Plan: `005-root-electrobun-react-template.md` · Blocked by: 02, 03 · Parallel-safe with: —

## Goal

Prove the two halves work together: `bun start` opens a native window with HMR loading the Vite dev server; `bun run build` produces a runnable unsigned `.app` serving the same UI from `views://`. Finalize the README.

## Context

- Phase 02 = shell (bun entry, config, `dev.ts`, `post-build.ts`); phase 03 = UI (Vite app, i18n, fonts). This phase wires + verifies.
- Dev path: `dev.ts` starts Vite → polls ready → `electrobun dev --watch` with `OML_DEV=true` → window loads `http://localhost:5173`.
- Prod path: `vite build` → `dist/` → `electrobun build` → `post-build.ts` copies `dist/` into the bundle's `app/views/main/` → window loads `views://main/index.html`.
- **Risk to resolve here**: exact `app/views` path inside `ELECTROBUN_BUILD_DIR`, and whether `OML_DEV` propagates through `electrobun dev` to the bun process. Verify both empirically.

## Steps

- [ ] `bun start` → window opens showing Burmese-first greeting `"မင်္ဂလာပါ ကမ္ဘာ"` (default `my`). If it shows English, `OML_DEV` didn't propagate → switch `src/bun/index.ts` to a localhost-reachability probe (fetch with short timeout → fallback `views://`) and re-test.
- [ ] Edit a string in `hello-page.tsx` while running → window live-updates (HMR), no manual rebuild.
- [ ] Click toggle → flips to `"Hello World"`; `<html lang>` flips my⇄en. Navigate `/` → `/about` → back; works both directions.
- [ ] Confirm Burmese renders via bundled KhitHaungg (not system font) — e.g. temporarily rename the woff2 / check computed font-family.
- [ ] `bun run build` → inspect `build/` to confirm `post-build.ts` resolved the `app/views/main/` target and copied `dist/`. Adjust the hook's discovery if the path differs from expectation; record the actual path.
- [ ] Launch the built `.app` (from `build/`) → shows the same bilingual Hello World loaded from `views://` (with Vite dev server stopped, to prove it's not hitting localhost).
- [ ] Finalize `README.md`: what it is, `bun install`, `bun start` (dev + HMR), `bun run build` (→ `.app`), how to rename for a new app (app name/identifier in `electrobun.config.ts`, package name). Concise/clipped per root `CLAUDE.md`.

## Done when

- `bun start` → native window, Burmese greeting, HMR works, toggle + routing work.
- `bun run build` → runnable unsigned `.app` showing the UI from `views://` with the Vite server off.
- Burmese glyphs render from the bundled font on this machine.
- README documents run/build/rename. Nothing leaked into the parent monorepo's tracked files.
- Actual `app/views` build path recorded in the README or a code comment for future reference.

## Touches

- `apps/electrobun-template/src/bun/index.ts` — possible URL-switch fallback (probe) if env doesn't propagate.
- `apps/electrobun-template/scripts/post-build.ts` — possible path-discovery tweak after inspecting `build/`.
- `apps/electrobun-template/README.md` — finalized.
