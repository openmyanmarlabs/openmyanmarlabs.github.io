# 005-03 — React UI · i18n · routing

Plan: `005-root-electrobun-react-template.md` · Blocked by: 01 · Parallel-safe with: 02

## Goal

The React 19 UI: Vite entry, HashRouter with 2 routes (`/` Hello + `/about`), bilingual Burmese-first i18n mirroring `landing/`, language toggle, bundled Khithaungg font + `@font-face`. `vite build` produces a `dist/` whose assets load via relative paths.

## Context

- Bundled by **Vite**, output consumed by phase 02's postBuild hook. `vite.config.ts` must set **`base: "./"`** (relative asset URLs for the `views://` protocol) + `@vitejs/plugin-react`.
- **i18n mirrors `landing/src/i18n.tsx` + `landing/src/content.ts`** (read them): custom React context, `useI18n()`, `Lang = "my" | "en"`, **default `"my"`**, `toggleLang`, syncs `document.documentElement.lang`. `content.ts` = `my` source-of-truth, `Content = typeof my`, `en: Content` (key-symmetry enforced by type). Keep content tiny: `{ hello: { greeting }, about: { title, body }, nav: { toHome, toAbout, langToggle } }`.
- Burmese rendering: copy landing's `khithaungg-400.woff2` + `khithaungg-600.woff2` into `public/fonts/`. Mirror the `@font-face` blocks + `[lang="my"]` font-family rule from `landing/src/styles/global.css` (font-family `"KhitHaungg"`). With `base: "./"`, reference fonts so they resolve relatively.
- **`react-router` v7**: `import { createHashRouter, RouterProvider, Link } from "react-router"`. HashRouter works identically in dev (localhost) and prod (`views://`).
- Greeting copy: `my` → `"မင်္ဂလာပါ ကမ္ဘာ"`, `en` → `"Hello World"`.
- Kebab-case files (`hello-page.tsx` → `HelloPage`), per `apps/CLAUDE.md`.

## Steps

- [ ] `vite.config.ts`: `defineConfig({ base: "./", plugins: [react()] })`.
- [ ] `index.html` at app root (Vite entry): `<div id="root">` + `<script type="module" src="/src/main-ui/main.tsx">`. `<html lang="my">` default.
- [ ] `src/main-ui/main.tsx`: mount `<RouterProvider router={...} />` inside `<I18nProvider>`. `createHashRouter([{ path: "/", element: <HelloPage/> }, { path: "/about", element: <AboutPage/> }])`.
- [ ] `src/main-ui/i18n.tsx` + `src/main-ui/content.ts`: port the landing pattern, trimmed to the keys above.
- [ ] `src/main-ui/hello-page.tsx`: shows `t.hello.greeting`, a `<LanguageToggle/>`, and `<Link to="/about">`.
- [ ] `src/main-ui/about-page.tsx`: shows `t.about.*`, toggle, `<Link to="/">`.
- [ ] `src/main-ui/language-toggle.tsx`: button calling `toggleLang()`, label `t.nav.langToggle`.
- [ ] `src/main-ui/styles/global.css`: reset + `@font-face` (KhitHaungg 400/600) + `[lang="my"]`/`:lang(my)` font-family rule; import in `main.tsx`.
- [ ] Copy `landing/public/fonts/khithaungg-400.woff2` + `-600.woff2` → `apps/electrobun-template/public/fonts/`.
- [ ] `bun run vite build` (or `bunx vite build`) → confirm `dist/index.html` + assets emitted; spot-check asset URLs are relative (`./assets/...`).

## Done when

- `vite build` succeeds → `dist/` with `index.html`, JS/CSS assets, and the woff2 fonts.
- Asset references in `dist/index.html` are relative (start `./`), not absolute `/`.
- `bun run typecheck` passes; `content.ts` key-symmetry holds (en typed `Content`).
- All UI files kebab-case.

## Touches

- `apps/electrobun-template/vite.config.ts` — new.
- `apps/electrobun-template/index.html` — new (Vite entry).
- `apps/electrobun-template/src/main-ui/{main.tsx,i18n.tsx,content.ts,hello-page.tsx,about-page.tsx,language-toggle.tsx}` — new.
- `apps/electrobun-template/src/main-ui/styles/global.css` — new.
- `apps/electrobun-template/public/fonts/khithaungg-{400,600}.woff2` — copied from landing.
