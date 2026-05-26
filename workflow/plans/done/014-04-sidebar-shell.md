# 014-04 — Sidebar shell + remix-icon + content width

Plan: `014-root-invoice-ux-fixes-1.md` · Blocked by: 03 · Parallel-safe with: 01, 02

## Goal

Replace the top nav with a **collapsible left sidebar** (remix-icon + label ⇄ icons-only) + a slim app bar (logo + "Open Myanmar Invoice" title + collapse toggle + language toggle). Collapsed state persists across launches. Unify all page content to `max-w-5xl`.

## Context

- Blocked by 03: theme toggle / store already removed; `navbar.tsx` currently = route links + `LanguageToggle`. This phase reshapes that into app bar + sidebar.
- Shell files:
  - `src/components/layout/app-layout.tsx` — currently `<Navbar/>` over `<main><Outlet/></main>` (column). Reshape to: app bar on top, then a row of `[sidebar | main]`. Keep the dormant `dark:` classes as-is.
  - `src/components/common/navbar.tsx` — becomes the slim **app bar** (rename in place is fine; keep file name or split into `app-bar.tsx` + `sidebar.tsx` — prefer two files: `components/layout/app-bar.tsx` + `components/layout/sidebar.tsx`, kebab-case).
- **Routes/labels** (already in `i18n` `nav`): Home (`/`, `toHome`), Invoices (`/invoices`, `toInvoices`), Clients (`/clients`, `toClients`), Products (`/products`, `toProducts`), Settings (`/settings`, `toSettings`). Active route highlight via react-router `NavLink` (`isActive`).
- **remix-icon** = `@remixicon/react` — add it (`bun add @remixicon/react` inside `apps/open-myanmar-invoice`). Import named icons, e.g. `RiHome5Line`, `RiFileList3Line` (invoices), `RiUser3Line`/`RiGroupLine` (clients), `RiBox3Line`/`RiPriceTag3Line` (products), `RiSettings3Line`, plus a collapse glyph (`RiMenuLine` / `RiSidebarFoldLine`/`RiSidebarUnfoldLine`). Pick sensible names from the set; size via `className`/`size` prop. Used ONLY here — leave existing inline SVGs elsewhere.
- **Collapse state store** (TDD'd logic): a small zustand store `src/stores/sidebar-store.ts` — `collapsed: boolean`, `toggle()`, `setCollapsed()`, initialized from `localStorage` (key e.g. `sidebar:collapsed`), persisting on change. Mirror the (now-deleted) theme-store's localStorage-read pattern for SSR-safe `typeof localStorage` guards. This is the one piece with a logic contract → unit test it.
  - Follow `.claude/skills/tdd/SKILL.md` (red→green→refactor, co-located `bun test`). The store reads/writes `localStorage`; in tests stub/clear it (jsdom-less: guard via `typeof`, or set `globalThis.localStorage`). Test: default collapsed=false when unset; reads persisted `"true"`; `toggle()` flips + writes through; `setCollapsed(true)` persists.
- **Collapsed UX**: collapsed sidebar shows icons only; labels become `title` + `aria-label` (tooltip/accessible name). Expanded shows icon + label. Collapse toggle lives in the app bar (next to logo).
- **Logo asset** (spec open-question): reuse an existing logo/icon from `apps/open-myanmar-invoice/public/` (check `public/` for a logo/png; the app icon source exists). Confirm the exact file; render at a small size in the app bar (and optionally a mark at the sidebar top). If no web-friendly logo is in `public/`, use a remix glyph + the title text and flag it.
- **Content width**: unify every page section container to `max-w-5xl` (currently mixed). With the sidebar offsetting `<main>`, `mx-auto` centers within the remaining area.
  - `clients-page.tsx` (`max-w-3xl`→`5xl`), `products-page.tsx` (`3xl`→`5xl`), `invoices-page.tsx` (`4xl`→`5xl`), `invoice-builder-page.tsx` (`max-w-3xl` ×3 → `5xl`), `settings-page.tsx` (`3xl`→`5xl`), `dashboard-page.tsx` (already `5xl` — leave).
- **Tailwind v4** utilities only (no new CSS needed — flex/grid/`w-*`/`transition` classes already used app-wide). If any custom CSS/variant is required, consult the `tailwind-docs-reader` subagent before writing it.
- App bar + sidebar are UI (not unit-tested); only `sidebar-store.ts` is unit-tested. Rest verified by the manual walk.

## Steps

- [ ] `bun add @remixicon/react` in `apps/open-myanmar-invoice`.
- [ ] TDD `src/stores/sidebar-store.ts` (+ `sidebar-store.test.ts`): default false, read persisted value, `toggle()` + `setCollapsed()` persist to `localStorage`. Read `.claude/skills/tdd/SKILL.md` first. Get green via `bun test`.
- [ ] Create `src/components/layout/sidebar.tsx`: `NavLink` items (icon + label), active highlight, collapsed = icons-only (labels → `title`/`aria-label`), width transitions on collapse. Pull labels from `useT().nav`.
- [ ] Create `src/components/layout/app-bar.tsx` (from the old navbar): logo + "Open Myanmar Invoice" title + collapse toggle (drives `sidebar-store`) + `LanguageToggle`. No route links.
- [ ] Rewrite `src/components/layout/app-layout.tsx`: app bar on top, then `[sidebar | main(Outlet)]` row; `main` is `flex-1` and scrolls.
- [ ] Delete/repurpose `src/components/common/navbar.tsx` (its links now live in the sidebar). Update any import of `Navbar`.
- [ ] Confirm/choose the app-bar logo asset in `public/`; wire it (or fall back to a glyph + title and note it).
- [ ] Add any new i18n strings (e.g. app title, collapse/expand `aria-label`) to both `en` + `my` in `content.ts`. Remove now-unused `nav.themeToggle` keys if still present.
- [ ] Unify page containers to `max-w-5xl` (clients, products, invoices, invoice-builder ×3, settings).
- [ ] `bun test` (sidebar store green) + `bun run typecheck` clean; launch + eyeball sidebar/app bar/width.

## Done when

- `sidebar-store` behaviors green via `bun test`; collapsed state persists across an app relaunch.
- App bar shows only logo + title + collapse toggle + language toggle; all route links live in the left sidebar with active-route highlight.
- Sidebar toggles between icon+label and icons-only; collapsed labels remain accessible (`aria-label`/`title`).
- All listed pages use `max-w-5xl`; content is wider + consistent.
- `@remixicon/react` in `package.json`; remix icons used for sidebar/app-bar only.
- `bun run typecheck` passes; no dangling `Navbar` import.

## Touches

- `apps/open-myanmar-invoice/package.json` — add `@remixicon/react`.
- `apps/open-myanmar-invoice/src/stores/sidebar-store.ts` (+ `.test.ts`) — new, TDD.
- `apps/open-myanmar-invoice/src/components/layout/app-bar.tsx` — new (slim app bar).
- `apps/open-myanmar-invoice/src/components/layout/sidebar.tsx` — new (collapsible nav).
- `apps/open-myanmar-invoice/src/components/layout/app-layout.tsx` — reshape to app bar + [sidebar | main].
- `apps/open-myanmar-invoice/src/components/common/navbar.tsx` — remove/repurpose.
- `apps/open-myanmar-invoice/src/lib/i18n/content.ts` — app-bar/sidebar strings (en + my); drop `nav.themeToggle`.
- `apps/open-myanmar-invoice/src/features/{clients,products,invoices,company}/pages/*.tsx` — `max-w-5xl`.
