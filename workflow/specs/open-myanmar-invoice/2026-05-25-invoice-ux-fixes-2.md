# Spec — Open Myanmar Invoice UX Fixes (round 2) (2026-05-25)

One-line: English-only app title, image skeleton loaders, newest-first client/product tables, a cleaner app-bar/sidebar (toggle moves into the rail), and a revamped dashboard (hero + quick actions + micro-animations) for the Electrobun invoice app.
Source: `workflow/ideas/open-myanmar-invoice/fix-ux-2.md`
Builds on: `workflow/specs/2026-05-25-invoice-ux-fixes-1.md` (round 1 shell, money, light-only).

## Goal

Second polish pass on `apps/open-myanmar-invoice`: stop translating the brand title, show skeletons while disk images resolve, sort Clients/Products newest-first (new `created_at` column), relocate the "weird" collapse toggle from the app bar into the sidebar rail and refine both, and revamp the dashboard into an attractive home screen with a greeting hero, quick actions, and CSS-only micro-animations. No new features or data beyond the dashboard hero content.

## Users / context

Single-machine, offline desktop (Electrobun) app for Myanmar businesses. Bilingual UI (EN + `my`), Myanmar-first — **except** the brand title, which is English by design. Light appearance only (round 1). All work is renderer/UI + one additive DB column.

## Scope

**In:**

- **English-only title** — the app-bar brand title always reads `Open Myanmar Invoice`, in both UI languages (drop the Burmese `ပွင့်လင်း မြန်မာ ငွေတောင်းခံလွှာ`). Single source stays `t.nav.appTitle`.
- **Image skeleton loaders** — while a stored image path is resolving to bytes, show an animated skeleton (pulsing neutral block w/ a muted image glyph). Distinguish three states: **loading** (skeleton) vs **loaded** (the `<img>`) vs **empty/no-path** (existing fallback kept). Surfaces: `ClientAvatar`, `ProductThumbnail`, and the upload-field previews (`client-image-field`, `product-image-field`, company `logo-field`).
- **Newest-first tables** — add a `created_at` column to `clients` and `products`; list pages order most-recently-added first. New rows stamped at create; existing rows backfilled on upgrade preserving current order.
- **App-bar / sidebar refinement** (frontend-design skill) — move the collapse toggle to the **top of the sidebar rail**; app bar becomes pure brand (logo mark + English title) + language toggle only. Polish both surfaces (spacing, active state, hover). Collapse + persistence behavior unchanged.
- **Dashboard revamp** (frontend-design skill) — keep existing widgets (stat tiles, status breakdown, recent invoices) and add: a **bilingual greeting hero** (company name + today's date) and a **quick-actions row** (New Invoice / New Client / New Product). CSS/Tailwind-only micro-animations (staggered entrance, hover lift, number count-up) + light UI decorations.

**Out (non-goals):**

- No skeleton on the invoice render path — `invoice-document.tsx` / `invoice-background.tsx` feed PDF/native-rasterize export and must stay untouched (no pulsing placeholder in exported output).
- No new animation library (no framer-motion / Lottie) — CSS/Tailwind + `@keyframes` only; count-up via a tiny RAF hook if needed.
- No dark/system theme — light only (round 1); do not reintroduce. Dormant `dark:` classes may remain.
- No new routes or domain features; quick actions link to existing routes/panels. No dedicated `/clients/new` etc.
- No real logo asset — app-bar mark stays the gradient + remix glyph placeholder.
- No seed change — seeds do not insert clients/products, so `created_at` needs no seed update.
- No change to invoice ordering (already newest-first) or to money formatting (round 1).
- No localized (Burmese) digits anywhere (round 1 stands).

## Requirements

**Title**

- [ ] App-bar brand title renders `Open Myanmar Invoice` under both `en` and `my` (set `my.nav.appTitle` to the English string; keep `t.nav.appTitle` as the single source). HTML `<title>` already English — no change.

**Image skeletons**

- [ ] `useImageObjectUrl` (or its callers) exposes a **loading** state distinct from "no path" — e.g. returns `{ url, loading }` / a status enum; revoke/lifecycle behavior unchanged.
- [ ] While loading: render an animated skeleton (Tailwind `animate-pulse` neutral block + muted image glyph), sized to the slot.
- [ ] Empty/no-path: keep the current fallback (client initial, product box glyph, avatar/image glyph in upload fields).
- [ ] Applied to `ClientAvatar`, `ProductThumbnail`, `client-image-field`, `product-image-field`, company `logo-field`. **Not** applied to `invoice-document` / `invoice-background`.

**Newest-first tables**

- [ ] `clients` and `products` each gain a `created_at` column — epoch-ms integer, mirroring `invoices.created_date` (`integer`, default `(unixepoch() * 1000)` for fresh installs).
- [ ] Migration adds the column on existing DBs and backfills existing rows so their current (insertion) order is preserved. (SQLite `ALTER TABLE ADD COLUMN` forbids a non-constant default → add with a constant default / nullable, then `UPDATE` backfill.)
- [ ] Repository `create()` sets `created_at` explicitly (don't rely on a DB default that the migration can't install) so both fresh and migrated DBs stamp new rows.
- [ ] `clientRepository.list()` and `productRepository.list()` order by `created_at DESC` with a stable tiebreak (e.g. `rowid DESC`).
- [ ] A newly added client/product appears at the **top** of its list page.

**App-bar / sidebar**

- [ ] Collapse toggle lives at the **top of the sidebar rail**; removed from the app bar.
- [ ] App bar shows only: logo mark + English title (left), language toggle (right). No toggle, no route links.
- [ ] Collapse-to-icons + expand still works; collapsed state still persists across launches (localStorage, round 1).
- [ ] Sidebar/app-bar visuals refined via the frontend-design skill (active pill, hover, spacing) without changing nav targets.

**Dashboard**

- [ ] Greeting hero: bilingual greeting + company name (when set) + today's date (reuse existing `formatDate`). Graceful when company name is empty.
- [ ] Quick-actions row: New Invoice, New Client, New Product — bilingual labels, linking to existing routes/panels.
- [ ] Existing widgets retained and restyled (stat tiles, status breakdown, recent invoices) with light UI decorations.
- [ ] Micro-animations are CSS/Tailwind-only: staggered entrance, hover lift, optional number count-up (RAF hook, no lib). Respect `prefers-reduced-motion`.

**i18n**

- [ ] All new copy (hero greeting, quick-action labels) exists in both `en` and `my` in `src/lib/i18n/content.ts`. (Brand title is the deliberate English-only exception.)

## Constraints

- Bun runtime; Tailwind v4; React 19 + react-router (hash router). Match conventions: kebab-case files, PascalCase exports.
- Migrations via `drizzle-kit generate` into `src/bun/db/migrations`; copied to the bundle by `scripts/post-build.ts`. The new migration may need hand-editing for the SQLite constant-default + backfill rule above.
- `created_at` follows the invoices epoch-ms convention (`unixepoch() * 1000`).
- No network (offline/single-machine). No new runtime deps for animation.
- Auto-format runs `prettier --write` on save (`.claude/settings.json`).
- Existing tests stay green; add repo tests for `created_at` stamping + newest-first ordering.
- Light-only export integrity preserved (skeleton excluded from the invoice render path).

## Acceptance — done when

- App-bar title reads `Open Myanmar Invoice` whether the UI is in English or Burmese.
- Loading a client/product/company image shows a pulsing skeleton, then the image; a record with no image still shows its initial/glyph fallback; exported invoice PDFs are visually unchanged.
- Adding a new client or product puts it at the top of the list; after upgrading an existing DB, prior rows are still present in a sensible order.
- The collapse toggle is at the top of the sidebar; the app bar shows only brand + language toggle; collapsing/expanding still works and is remembered across relaunches.
- The dashboard shows a greeting hero (company + date) and a quick-actions row above restyled widgets, with subtle entrance/hover motion and light decorations; all values correct; light colors only; motion is reduced under `prefers-reduced-motion`.
- `bun test` and `bun run typecheck` pass.

## Open questions

- **Backfill ordering** — set existing rows' `created_at` by `rowid` so `created_at DESC` exactly reverses today's order (recommend), vs. set all existing to migration-time `now()` and rely on the `rowid DESC` tiebreak. Final call at plan time.
- **Pickers/search consistency** — also order the invoice-builder client/product selector modals (and `search()`) newest-first? Recommend yes if cheap; idea only named the list pages.
- **Greeting style** — time-based (`Good morning/afternoon/evening`, 3×2 strings) vs static (`Welcome back`). Recommend time-based; minor i18n cost.
- **New Client / New Product targets** — no dedicated `/new` routes exist (creation is a panel/modal on the list page). Quick actions link to `/clients` and `/products` (recommend) vs. deep-link that auto-opens the create panel.
