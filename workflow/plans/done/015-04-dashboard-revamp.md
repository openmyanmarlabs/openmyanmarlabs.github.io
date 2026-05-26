# 015-04 — Dashboard revamp + i18n + English title

Plan: `015-root-invoice-ux-fixes-2.md` · Blocked by: — · Parallel-safe with: 01, 02, 03

## Goal

Revamp the home screen: a bilingual greeting hero (company + today's date) and a quick-actions
row above the (restyled) existing widgets, with CSS-only micro-animations that respect reduced
motion. This phase also owns ALL `content.ts` edits — new dashboard copy + the English-title flip.

## Context

- **Owns the shared-edit files.** This is the SOLE editor of `lib/i18n/content.ts` and
  `styles/global.css` in this plan (that's why phases 02/03 stay out of them) — so it's free to
  add keys + keyframes without conflict.
- **Keep + restyle** the current widgets in `dashboard-page.tsx`: stat tiles (`stat-card.tsx`),
  status breakdown, recent invoices. Don't drop data; all values stay correct (`formatMoney`,
  `formatDate`, `InvoiceStatusPill`).
- **Greeting (time-based):** morning / afternoon / evening by local hour, + company name
  (graceful when empty), + today's date via `formatDate(Date.now())` (reuse
  `@/features/invoices/lib/invoice-row`). The company name is available from
  `dashboard-store` (it already fetches `companyApi.get()` for the currency) — expose `name`
  alongside `currency`.
- **Quick actions → existing routes:** New Invoice `/invoices/new`, New Client `/clients`,
  New Product `/products`. Bilingual labels. (No new routes / deep-links.)
- **i18n (this phase owns `content.ts`):** keep `en`/`my` key trees symmetric (`my` is the
  source of truth, `en: Content`). Add under `dashboard`: `greeting: { morning, afternoon,
evening }`, any hero label needed, and `quickActions: { newInvoice, newClient, newProduct }`
  — in BOTH languages. ALSO flip `my.nav.appTitle` → `"Open Myanmar Invoice"` (English-only
  title requirement; `en.nav.appTitle` is already English; the HTML `<title>` is already English).
- **Animations — match the repo's existing pattern.** `global.css:32–52` already defines
  top-level `@keyframes` (`fade-in`, `modal-in`) consumed via arbitrary `animate-[name_dur_ease]`
  utilities (the Modal). Follow that: add e.g.
  `@keyframes rise-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }`
  and use `animate-[rise-in_0.4s_ease-out_both]` (the `both` fill-mode prevents a pre-delay
  flash). Stagger with inline `style={{ animationDelay: "..." }}`. Hover lift:
  `transition hover:-translate-y-0.5 hover:shadow-md` (+ duration/ease).
- **Reduced motion — robust global guard.** Add to `global.css`:
  `@media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important } }`.
  This is the reliable kill-switch; per-utility `motion-reduce:` variants are optional on top.
- **Tailwind v4 — consult the docs before writing CSS.** Spawn / read via the
  `tailwind-docs-reader` KB for `@theme`/`@keyframes`/`animate-*` syntax
  (`workflow/learning/tailwind/apis/theme.md`, `guides/custom-styles.md`). The KB confirms the
  `@theme { --animate-<name>: <name> <dur> <ease>; @keyframes <name> {…} }` token form; the
  repo's top-level-`@keyframes` + `animate-[…]` arbitrary form (above) is equivalent and already
  in use — match it for consistency. `animate-pulse` / `motion-reduce:` are core utilities not
  enumerated in the condensed KB; the global media-query guard avoids depending on the variant name.
- **Optional count-up:** a tiny RAF hook `useCountUp(target)` (no lib) for the number tiles;
  guard `window.matchMedia("(prefers-reduced-motion: reduce)")` → return `target` immediately.
- **frontend-design** (executor can't invoke the skill — bake it in): light, airy, brand-tinted
  hero (subtle `brand-50 → white` gradient, soft ring), `rounded-2xl` cards matching the existing
  tiles, quick-action cards as icon + label with hover lift (remix icons: `RiFileAddLine`,
  `RiUserAddLine`, `RiPriceTag3Line`), number tiles with `tabular-nums` + optional count-up.
  Subtle decoration only — no heavy gradients.
- Renderer-only; i18n is data; RAF hook is DOM → no unit tests. Verify by running both languages
  - reduced motion.

## Steps

- [ ] `content.ts`: flip `my.nav.appTitle` → `"Open Myanmar Invoice"`; add symmetric
      `dashboard.greeting` + `dashboard.quickActions` (+ any hero label) to `my` and `en`.
- [ ] `global.css`: add the entrance `@keyframes` (top-level, repo pattern) + the
      `prefers-reduced-motion` guard.
- [ ] `dashboard-store.ts`: expose company `name` (alongside `currency`) for the hero.
- [ ] New `dashboard-hero.tsx`: time-based greeting + company name (graceful empty) +
      `formatDate(Date.now())`; brand-tinted, animated entrance.
- [ ] New `quick-actions.tsx`: 3 cards linking to `/invoices/new`, `/clients`, `/products`;
      bilingual labels; hover lift; staggered entrance.
- [ ] Restyle stat tiles (optional count-up + hover lift), status breakdown, recent invoices;
      staggered entrance via `animationDelay`; keep all data + formatting correct.
- [ ] (Optional) `use-count-up.ts` RAF hook with the reduced-motion guard.
- [ ] Verify: hero shows company + date across all three greeting windows; quick actions
      navigate; widgets correct; EN + MY; app-bar title reads English in both; motion suppressed
      under `prefers-reduced-motion`; `bun run typecheck` (+ `bun test`) pass.

## Done when

- Greeting hero (company + date) + quick-actions row sit above the restyled widgets; bilingual;
  all values correct.
- Subtle staggered entrance + hover lift (+ optional count-up); reduced motion respected.
- App-bar title reads `Open Myanmar Invoice` in EN and MY; light-only.
- `bun run typecheck` (+ `bun test`) pass.

## Touches

- `src/lib/i18n/content.ts` — title flip + dashboard greeting/quick-action keys (en + my).
- `src/styles/global.css` — entrance keyframes + reduced-motion guard.
- `src/features/dashboard/pages/dashboard-page.tsx` — hero + quick actions + restyle.
- `src/features/dashboard/components/stat-card.tsx` — restyle (+ optional count-up).
- `src/features/dashboard/components/dashboard-hero.tsx` — new.
- `src/features/dashboard/components/quick-actions.tsx` — new.
- `src/features/dashboard/stores/dashboard-store.ts` — expose company name.
- `src/features/dashboard/lib/use-count-up.ts` — new (optional).
