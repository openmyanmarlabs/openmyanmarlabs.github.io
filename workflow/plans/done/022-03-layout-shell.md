# 022-03 — Layout shell

Plan: `022-root-electrobun-template-layout-shell.md` · Blocked by: 02 · Parallel-safe with: 04

## Goal

Replace the flat horizontal navbar with a collapsible Sidebar + AppBar shell; restructure `AppLayout` to the invoice's `flex h-screen flex-col` pattern.

## Context

**Source patterns** (read these before writing):

- Invoice sidebar: `apps/open-myanmar-invoice/src/components/layout/sidebar.tsx` — collapsible rail (`w-[4.5rem]` / `w-60`), NavLink active pill, remixicon icons, `useSidebarStore`
- Invoice AppBar: `apps/open-myanmar-invoice/src/components/layout/app-bar.tsx` — `h-14 shrink-0`, logo left + LanguageToggle right
- Invoice AppLayout: `apps/open-myanmar-invoice/src/components/layout/app-layout.tsx` — `flex h-screen flex-col`

**Template differences to apply on top of the invoice pattern:**

- AppBar right side: add `ThemeToggle` + username display + logout button (these were in the old `navbar.tsx` — copy that logic; logout calls auth-store, clears token, navigates to `/login`)
- Sidebar nav items: **only** Home (`/`, `RiHomeLine`) and About (`/about`, `RiInformationLine`) — not the invoice's 7 items
- Logo: a remixicon glyph placeholder (e.g. `RiApps2Line`) — no PNG asset needed
- AppBar title: `t.nav.appTitle` (added in Phase 02)
- Sidebar uses `t.nav.collapseSidebar` / `t.nav.expandSidebar` for the toggle aria-label / tooltip

**Auth boundary:** Sidebar and AppBar mount only inside the existing `ProtectedRoute` — login/register pages must stay unaffected. The current `app-layout.tsx` already lives inside `ProtectedRoute`; keep that structure.

**Theme:** Both components must use theme-aware Tailwind classes (dark: variants) — the template's theme-store applies a `dark` class to `<html>`; use it. Mirror the neutral-900/neutral-100 pattern already in `app-layout.tsx`.

No unit tests for UI components — correctness verified by running the app.

## Steps

- [ ] In `apps/electrobun-template`, run: `bun add @remixicon/react`
- [ ] Create `src/components/layout/sidebar.tsx`:
  - Port invoice sidebar structure; keep only Home + About nav items
  - Import `useSidebarStore` from `../../stores/sidebar-store`
  - Import `useT` from i18n store; use `t.nav.toHome`, `t.nav.toAbout`, `t.nav.collapseSidebar`, `t.nav.expandSidebar`
  - Use `RiHomeLine`, `RiInformationLine`, `RiMenuFoldLine`, `RiMenuUnfoldLine` from `@remixicon/react`
  - NavLink active class: `bg-brand-50 text-brand-700` (match invoice); dark variant if needed
- [ ] Create `src/components/layout/app-bar.tsx`:
  - `h-14 shrink-0` header with `border-b`
  - Left: `RiApps2Line` glyph (size 8, `rounded-xl`) + `t.nav.appTitle` text
  - Right: `<LanguageToggle />` + `<ThemeToggle />` + username span + logout button
  - Username from `useAuthStore` (or whichever store the old navbar used); logout same logic as old navbar
- [ ] Restructure `src/components/layout/app-layout.tsx`:
  - Outer: `flex h-screen flex-col` (replace `min-h-screen`)
  - Children: `<AppBar />` then `<div className="flex flex-1 overflow-hidden">` containing `<Sidebar />` + `<main className="flex-1 overflow-y-auto">`
  - Remove `<Navbar />` import/usage
- [ ] Delete `src/components/common/navbar.tsx` — replaced by AppBar; verify nothing else imports it first (`grep -r "navbar" src/`).
- [ ] Run `bun run typecheck` — no errors.

## Done when

- Authenticated session shows sidebar (Home + About) and AppBar; layout fills viewport without scroll on the shell.
- Sidebar toggle collapses to icon-only rail and back; state persists on reload.
- Dark/light/system theme applies to sidebar and AppBar.
- LanguageToggle switches EN ↔ MY sidebar labels.
- Logout button in AppBar navigates to `/login`.
- Login/register pages render with no sidebar or AppBar.

## Touches

- `apps/electrobun-template/src/components/layout/sidebar.tsx` — new
- `apps/electrobun-template/src/components/layout/app-bar.tsx` — new
- `apps/electrobun-template/src/components/layout/app-layout.tsx` — restructure
- `apps/electrobun-template/src/components/common/navbar.tsx` — delete
- `apps/electrobun-template/package.json` — `@remixicon/react` added
