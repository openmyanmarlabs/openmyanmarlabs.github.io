# Spec — Open Myanmar Invoice UX Fixes (round 1) (2026-05-25)

One-line: Currency formatting fixes, dark-mode removal, top-nav → collapsible sidebar shell, wider content, and a row-menu overflow fix for the Electrobun invoice app.
Source: `workflow/ideas/open-myanmar-invoice/fix-ux-1.md`

## Goal

Polish the `apps/open-myanmar-invoice` desktop app: make money read correctly (`1,000 MMK`, English digits), drop the broken dark mode, move route navigation into a collapsible left sidebar with a slim app bar, widen + unify page content, and stop the row action menu from being clipped by table overflow.

## Users / context

Single-machine, offline desktop (Electrobun) app for Myanmar businesses. Bilingual UI (EN + `my`); Myanmar-first. Light appearance only going forward.

## Scope

**In:**

- **Money format** — all amounts render as `<amount> <CODE>` suffix (e.g. `1,000 MMK`, `1,000 USD`), English digits `0-9`, comma grouping. Applies to every currency, app-wide (single source: `src/lib/money.ts`).
- **Remove dark mode** — delete the theme toggle UI, theme store, and FOUC head script; hard-force light appearance. Leave dormant `dark:` utility classes in components in place (no mass class removal).
- **Sidebar shell** — replace the top nav links with a **collapsible left sidebar** (icon + label ⇄ icons-only via a toggle). App bar reduced to logo + “Open Myanmar Invoice” title (+ the collapse toggle + language toggle).
- **Icons** — add `@remixicon/react`; use remix icons for sidebar nav items + app-bar logo area.
- **Content width** — unify all list/form page containers to `max-w-5xl`, centered in the content area beside the sidebar.
- **Row-menu overflow fix** — the `RowMenu` (⋮) popup must render fully (not clipped) on the invoices, clients, and products list tables.

**Out (non-goals):**

- No dark / system theme, no theme persistence — light only.
- No localized (Burmese) numerals anywhere in money; not adding a per-format digit option.
- No new routes, features, or data changes; navigation targets stay the same (Home, Invoices, Clients, Products, Settings).
- Not stripping existing `dark:` classes from components.
- Not replacing every existing inline SVG icon with remix-icon — only the new sidebar/app-bar surfaces.
- No mobile/responsive redesign beyond the sidebar collapse behavior.

## Requirements

- [ ] `formatMoney(amount, currency)` returns `"1,000 MMK"` style: grouped amount + space + currency code suffix, English digits, for all `SUPPORTED_CURRENCIES`.
- [ ] No Burmese numerals (`၀-၉`) appear in any rendered money value, in either UI language.
- [ ] Currency code is always the 3-letter code (`MMK`, `USD`, …) — never a symbol (`K`, `$`).
- [ ] Theme toggle removed from the app bar; `theme-store.ts`, `theme-toggle.tsx`, and the dark-mode FOUC script in `index.html` removed.
- [ ] App always renders in light appearance regardless of OS setting (no `.dark` ever applied).
- [ ] Left sidebar lists: Home, Invoices, Clients, Products, Settings — each with a remix icon + localized label; active route is visually indicated.
- [ ] Sidebar collapses to icons-only and expands to icon + label via a toggle control; collapsed state persists across launches (localStorage).
- [ ] Collapsed sidebar shows icons only; labels become accessible tooltips/`aria-label`.
- [ ] App bar shows logo + “Open Myanmar Invoice” title (localized), the collapse toggle, and the language toggle — no route links.
- [ ] All list/form page content containers use a single shared max width (`max-w-5xl`), centered within the content region.
- [ ] `RowMenu` popup is fully visible when opened from any row of the invoices / clients / products tables — not clipped by container `overflow-hidden`.
- [ ] `@remixicon/react` added to the invoice app's `package.json`.
- [ ] Nav/app-bar/sidebar copy exists in both `en` and `my` (`src/lib/i18n/content.ts`).

## Constraints

- Bun runtime; Tailwind v4; React 19 + react-router (hash router). Match existing file conventions (kebab-case files, PascalCase exports).
- Money formatting must stay centralized in `src/lib/money.ts` (its current contract: never throws on bad input).
- Offline / single-machine — no network; collapse state via localStorage only.
- Auto-format runs `prettier --write` on save (`.claude/settings.json`).
- Existing tests must stay green; `money.ts` change requires updating any snapshot/string assertions.

## Acceptance — done when

- Dashboard, invoice list, invoice builder/summary, product list/selector, and client list all show amounts like `1,250,000 MMK` with English digits.
- Switching UI language EN⇄MY never changes money digits to Burmese.
- No theme toggle is visible; OS dark mode has no effect on the app; PDF/invoice export renders with light colors.
- The app bar shows only logo + title (+ collapse + language toggle); all route links live in the left sidebar.
- Clicking the sidebar toggle collapses/expands it; reopening the app remembers the last state.
- Page content is noticeably wider and the same width across Invoices, Clients, Products, Settings, Dashboard.
- Opening the ⋮ menu on the last/edge row of each list shows the full menu (no cut-off).
- `bun test` and `bun run typecheck` pass.

## Open questions

- **Overflow fix mechanism** — drop `overflow-hidden` on the table card (and round corners another way) vs. render `RowMenu` in a portal with fixed positioning. Recommend the portal approach (robust regardless of ancestor clipping); final call at plan time.
- **App-bar logo asset** — reuse the existing app icon/logo PNG in `public/`, or a dedicated small mark? Confirm which asset feeds the app-bar + sidebar logo.
