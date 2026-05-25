# 011-02 — Main-screen shell + icon

Plan: `011-root-open-myanmar-speech.md` · Blocked by: 01 · Parallel-safe with: —

## Goal

Turn the bare de-authed app (phase 01) into a clean, branded base: an `AppLayout` shell whose `/` route shows a **main-screen placeholder**, a `main.*` i18n namespace, and the app icon. The launchable starting point every later phase builds on.

## Context

- Phase 01 left the router de-authed with a bare `/` placeholder. This phase makes `/` a proper `MainScreenPlaceholder` page under the template's `AppLayout` (which survives de-auth) — title + subtitle, EN/MM. The **real** main screen replaces this placeholder in phase 05.
- i18n: add a minimal `main.*` namespace (title/subtitle) to `src/lib/i18n/content.ts`, `en`/`my` symmetric, **Myanmar-first**. TS enforces symmetry via `en: Content = typeof my`.
- Icon: the scaffold may already set it. If not, run the **`add-icon`** skill with the Open Myanmar Labs logo (repo-root design-system) — it regenerates `icon.iconset` + wires the mac/win/linux paths in `electrobun.config.ts`. (`frontend-design`, light touch, for a tidy placeholder — the real screen is phase 05.)
- Electrobun config/build reference: `workflow/learning/electron-bun/`.

## Steps

- [ ] Add a `MainScreenPlaceholder` page; route `/` → it under `AppLayout` (replace phase 01's bare placeholder).
- [ ] Add the `main.*` i18n namespace (title/subtitle) to `content.ts` (en + my, symmetric, Myanmar-first).
- [ ] If no icon yet: run `add-icon` with the Open Myanmar Labs logo.
- [ ] Confirm launch (`run` skill / `bun run dev`): opens to the branded main-screen placeholder, no console errors; `bun run build` clean.

## Done when

- App dev-runs + builds, opening to a main-screen placeholder showing the Open Myanmar Speech name + icon + `main.*` copy (EN/MM).
- `bun run typecheck` + `bun test` stay green.

## Touches

- `src/routes/index.tsx` — `/` → `MainScreenPlaceholder` under `AppLayout`.
- `src/features/speech/pages/main-screen-placeholder.tsx` (or similar) — new placeholder page.
- `src/lib/i18n/content.ts` — add `main.*`.
- `electrobun.config.ts`, `icon.iconset/` — only if running `add-icon`.
