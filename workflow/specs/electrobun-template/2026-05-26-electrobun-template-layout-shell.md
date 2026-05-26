# Spec — Electrobun Template Layout Shell (2026-05-26)

Port invoice app's sidebar + AppBar + about page into electrobun-template; add devtools in dev mode.
Source: `workflow/ideas/electron/learn-from-open-myanmar-invoice.md`

## Goal

Replace the template's flat horizontal navbar with the invoice's AppBar + collapsible sidebar shell. Enrich the about page with version/links/update-check. Wire devtools to open automatically in dev mode. Result: a production-quality desktop app shell that future Electrobun apps can fork from.

## Users / context

Developers using electrobun-template as a starter. Myanmar-first default (lang defaults to "my"). Desktop-only, offline-first.

## Scope

**In:**

- `Sidebar` component — collapsible rail (icons-only ↔ icons+labels); 2 items: Home, About
- `AppBar` component — logo placeholder (glyph), LanguageToggle, ThemeToggle, username display, logout button
- `sidebar-store.ts` — Zustand + localStorage persistence (collapsed state)
- Extend `i18n/content.ts` — add nav labels (home, about, appTitle) in EN + MY
- Restructure `AppLayout` — `flex h-screen flex-col`; AppBar at top, Sidebar left, scrollable `<main>`
- Enrich `AboutPage` — version (from `getUpdateContext()`), external links (`updateApi.openExternal()`), update-check button (`useUpdateStore`)
- `bun/index.ts` — call `win.webview.openDevTools()` when `config.runtime?.isDev`
- `electrobun.config.ts` — add `runtime.isDev: process.env.ELECTROBUN_BUILD_ENV === "dev"`

**Out (non-goals):**

- New routes beyond Home + About
- Auth system changes — login/register pages unaffected, no sidebar shown there
- Database schema changes
- Full invoice i18n content set (900+ lines) — only nav/about labels needed
- Actual app icon/branding — logo stays a glyph placeholder
- Custom devtools keyboard shortcut or menu item

## Requirements

- [ ] `Sidebar` mounts only inside `ProtectedRoute` (auth-gated pages only)
- [ ] Sidebar collapses to icon-only rail (`w-[4.5rem]`), expands to `w-60` with labels
- [ ] Collapsed state persisted to localStorage; survives page reload
- [ ] `AppBar` renders: glyph logo + app title (left) | LanguageToggle + ThemeToggle + username + logout (right)
- [ ] AppBar height `h-14`, sticky/fixed at top within the shell
- [ ] All new labels bilingual: `nav.appTitle`, `nav.home`, `nav.about`, `nav.logout` in both `en` and `my` content
- [ ] `AboutPage` shows: app version string, ≥ 1 external link (repo/site), update-check button
- [ ] Update-check button uses existing `useUpdateStore.getState().check()`
- [ ] Dev mode auto-opens devtools: `electrobun dev` → inspector visible immediately
- [ ] `ELECTROBUN_BUILD_ENV !== "dev"` → devtools do NOT auto-open
- [ ] Existing tests pass (`bun test`)

## Constraints

- `@remixicon/react` already installed in invoice; must add to template's dependencies
- Sidebar icons must be from `@remixicon/react` (match invoice convention)
- Theme-aware: sidebar + AppBar must respect dark/light/system via existing `theme-store`
- Login/register routes must not render sidebar or AppBar (no visual regression)
- No new Bun ↔ renderer RPC endpoints — use only existing `updateApi`, `BuildConfig.get()`
- Bun runtime, not Node

## Acceptance — done when

- `electrobun dev` launches app with sidebar + AppBar visible (authenticated session)
- Devtools inspector window opens automatically in dev mode
- Sidebar toggle persists collapse state across reloads
- Navigating Home ↔ About via sidebar works; active item highlighted
- About page shows version number and update-check button functions
- Login page renders with no sidebar or AppBar
- `bun test` still passes (no regressions)
- Both EN and MY sidebar labels display correctly via language toggle
