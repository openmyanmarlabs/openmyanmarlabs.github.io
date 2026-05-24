# Spec — Electrobun + React 19 Template (2026-05-24)

One-line: A reusable desktop-app starter — Electrobun + React 19 + TypeScript + Vite + React Router — that boots to a bilingual "Hello World".
Source: `workflow/ideas/make-a-electronbun-template-file.md` (idea says "ElectronBun"; means **Electrobun** — blackboardsh/electrobun)

## Goal

Scaffold a copy-to-start desktop template: Electrobun shell (Bun main process), React 19 UI built by Vite, HashRouter navigation, bilingual (Burmese-first) i18n. Running it opens a native window showing "Hello World" / "မင်္ဂလာပါ" with a language toggle and a second route. Produces a runnable production `.app` — no signing.

## Users / context

- OML developers starting a new **desktop** app. Copy `apps/electrobun-template/` → rename → build.
- Burmese-first by default (matches `landing` house pattern); EN via toggle.
- Runs on-device (desktop). No network needed to display Hello World.

## Scope

**In:**

- App at `apps/electrobun-template/` — drop-zone convention (own git init, parent monorepo ignores `apps/*`).
- Electrobun main process (`src/bun/index.ts`): opens one `BrowserWindow`; basic `ApplicationMenu` (Quit + Edit roles so copy/paste/select-all work).
- React 19 + TypeScript UI under `src/main-ui/`, bundled by **Vite**.
- **Vite builds, Electrobun copies**: dev → window loads Vite dev server (`http://localhost:5173`, HMR); prod → `vite build` → `dist/` copied into `views/main/` → window loads `views://main/index.html`.
- **HashRouter**, 2 demo routes: `/` (Hello page + link) and `/about` (proves nav). Works identically in dev and prod.
- **i18n** mirroring `landing/src/i18n.tsx`: custom React context (`useI18n()` + `content.ts`), `Lang = "my" | "en"`, **Myanmar-first default**, `toggleLang`, syncs `<html lang>`. Hello copy in both languages. A language toggle button in the UI.
- Bundled Burmese webfont (Khithaungg woff2, matching landing) + `@font-face` so မြန်မာ renders on any machine.
- Scripts: `bun start` (dev: Vite server + Electrobun window) and `bun run build` (prod: `vite build` → `electrobun build` → runnable `.app`).
- `electrobun.config.ts`, `vite.config.ts` (with `base: "./"`), `tsconfig.json`, `package.json`, and a short `README.md` (how to run/build/rename).

**Out (non-goals):**

- Code-signing, notarization, installers, auto-update (Electrobun supports these — teams add per-app).
- RPC between bun ↔ webview (no Hello World need).
- JSON locale files / `react-i18next` / `useTranslation` — superseded by the house `content.ts` + `useI18n` pattern.
- Real app features, state mgmt, design-system import, tests beyond a smoke check.
- CEF renderer config (default `native` renderer is fine).
- Committing the app to the parent monorepo (it lives in the ignored drop-zone).

## Requirements

- [ ] `apps/electrobun-template/` exists, self-contained, with its own `git init`.
- [ ] Versions mirror `landing`: React `^19.2`, `@vitejs/plugin-react` `^5`, Vite `^7`, TypeScript `^6`; plus `electrobun` and `react-router` (v7).
- [ ] `bun install && bun start` opens a native window showing "Hello World" (Burmese-first → "မင်္ဂလာပါ" shown, toggle reveals English).
- [ ] Dev window loads the Vite dev server with working HMR (edit React → window updates without rebuild).
- [ ] Dev script runs **both** the Vite dev server and Electrobun together; bun entry picks `http://localhost:5173` in dev vs `views://main/index.html` in prod (env-detected).
- [ ] HashRouter: `/` Hello page links to `/about`; navigating works in both dev and prod.
- [ ] Language toggle switches my ⇄ en across both routes; default load is Burmese.
- [ ] Burmese text renders via the bundled woff2 (not system font).
- [ ] `bun run build` produces a runnable production `.app` that shows the same UI loaded from `views://`.
- [ ] All files/folders kebab-case (`hello-page.tsx`, `language-toggle.tsx`) per `apps/CLAUDE.md`, even when exporting PascalCase.

## Constraints

- Runtime **Bun**; Electrobun installs its own pinned Bun in `node_modules`.
- Vite `base: "./"` — assets must load via relative paths under the `views://` custom protocol (absolute `/assets/...` paths break in prod).
- Electrobun's `copy` config maps Vite's `dist/` → `views/main/`; `electrobun.config.ts` `build.bun.entrypoint` = `src/bun/index.ts`.
- Prettier auto-formats on Write/Edit (`.claude/settings.json`).
- Docs concise/clipped per root `CLAUDE.md`.
- Default `native` renderer (no CEF) — keep the app tiny.

## Acceptance — done when

- Fresh `bun install && bun start` → native window, Burmese "မင်္ဂလာပါ" visible, toggle flips to "Hello World", link navigates to `/about` and back.
- Editing a React component live-updates the running dev window (HMR).
- `bun run build` yields a `.app` that launches and shows the same bilingual Hello World from the bundled `views://`.
- Burmese glyphs render correctly on a machine with no system Myanmar font.
- Repo tree matches the drop-zone layout; nothing leaks into the parent monorepo's tracked files.

## Open questions

- **Dev orchestration mechanism** — how to run Vite dev server + `electrobun dev` together from one `bun start` (e.g. a small concurrent runner, Bun's `$`-based script, or `concurrently`). Decide at plan time; affects the `start` script + dev-mode env flag.
- **Vite dev server lifecycle** — Electrobun window must wait for Vite to be listening before loading `localhost:5173` (race on cold start). Plan-time: readiness check vs. fixed retry.
- **Burmese font source** — reuse landing's exact Khithaungg woff2 files, or a lighter single-weight subset for the template. Plan-time.
