# 020-04 — UI revamp: toolbar + card/chart polish

Plan: `020-root-report-excel-export-ui-revamp.md` · Blocked by: — · Parallel-safe with: 01, 02, 03

## Goal

Revamp the report page: period switcher + export buttons on ONE toolbar row (kill the empty right-side gap), money cards that count up, and refined + animated charts — all reduced-motion-safe.

## Context

UI phase — not unit-tested (layout, Chart.js canvas, matchMedia); verified by the root's manual `verify` walk. Files are disjoint from the Excel track, so this is parallel-safe with 01/02/03. Light-only; Tailwind v4 utilities (consult `tailwind-docs-reader` ONLY if a new v4 directive/`@theme` token is needed — not expected here).

Current state:

- `features/reports/pages/reports-page.tsx` — the period-switcher row is `flex items-center justify-between` but holds ONLY the switcher pill → the empty right half is the "unnecessary space" the spec calls out. `<ReportExportBar />` renders on its own row below. Money stat cards pass `value={formatMoney(...)}` (a STRING) so they don't animate; only Invoice Count (`countUp`, a number) does.
- `features/reports/components/report-export-bar.tsx` — outer `flex flex-col gap-2` → a `flex flex-wrap items-center gap-3` row of two `Button`s + inline busy/success/error text, then the two modals.
- `features/dashboard/components/stat-card.tsx` (SHARED) — `CountUpValue` renders `useCountUp(target)` as an UNFORMATTED number; `animated = countUp && typeof value === "number"`.
- `features/dashboard/lib/use-count-up.ts` — `useCountUp` already reduced-motion-gated; has a private `prefersReducedMotion()`.
- `report-bar-chart.tsx` — bars already `borderRadius: 6` + `maxBarThickness: 36`, solid `backgroundColor`; NO explicit `animation` config. `report-doughnut-chart.tsx` — clean palette/borders, NO explicit `animation`.

Pieces:

1. **Toolbar (one row).** Render `<ReportExportBar />` as the right-hand child of the existing `justify-between` switcher row; make that row `flex flex-wrap items-center justify-between gap-3` so it wraps gracefully when narrow. Remove the standalone export-bar slot.
2. **Inline export bar.** Change `report-export-bar.tsx`'s outer wrapper from a full-width column to inline (`flex items-center gap-3`); keep the two `Button`s + modals; reposition the busy/success/error line so it doesn't distort the toolbar height (a muted hint beside the buttons, or under the toolbar).
3. **StatCard money count-up** (non-breaking). Add an optional `format?: (n: number) => ReactNode`; thread it through `CountUpValue` so the animated number is formatted (`format ? format(n) : n`, where `n = useCountUp(target)` — call the hook unconditionally at the top, don't put it inside a branch). No `format` ⇒ unchanged ⇒ dashboard untouched. Then in `reports-page.tsx` switch Total Balance + Paid Amount to `value={s.totalBalance}` (number) + `countUp` + `format={(n) => formatMoney(n, currency)}` (same for `paidAmount`). `tabular-nums` already applied.
4. **Charts — refine + animate** (`report-bar-chart.tsx`, `report-doughnut-chart.tsx`):
   - Bars: add a vertical **gradient fill** per dataset via scriptable `backgroundColor: (ctx) => makeGradient(ctx, color)` (build a canvas linear gradient from `ctx.chart.chartArea`; return the flat color until `chartArea` exists). Refine palette: paid = brand `#2563eb`, total = slate `#cbd5e1`, each fading lighter toward the top. Keep rounded tops.
   - Entrance animation, **reduced-motion-gated**: if `prefersReducedMotion()` → `animation: false`; else bar `{ duration: 700, easing: "easeOutQuart" }`, doughnut `{ animateRotate: true, animateScale: true, duration: 700 }`. Chart.js re-runs on data change (period switch) by default.
   - Keep charts pure presentational. Optionally extract `prefersReducedMotion()` to `lib/prefers-reduced-motion.ts` and reuse in both charts (and `use-count-up.ts`); otherwise inline a local copy.
5. **Hover / reveal polish.** Stat cards already hover-lift; the page already staggers `rise-in`. Optionally strengthen subtly (slightly larger lift / ring) — keep tasteful, light-only.

## Steps

- [ ] `reports-page.tsx`: move `<ReportExportBar />` into the switcher row as its right child; make the row `flex flex-wrap items-center justify-between gap-3`; remove the old standalone export-bar slot.
- [ ] `report-export-bar.tsx`: inline the outer wrapper (`flex items-center gap-3`); reposition feedback text so it doesn't grow the toolbar.
- [ ] `stat-card.tsx`: add optional `format?: (n: number) => ReactNode`; apply it in `CountUpValue`. No change when absent.
- [ ] `reports-page.tsx`: Total Balance + Paid Amount → `value={number}` + `countUp` + `format={(n) => formatMoney(n, currency)}`.
- [ ] `report-bar-chart.tsx`: scriptable gradient backgrounds (guarded on `chartArea`), refined palette, reduced-motion-gated entrance `animation`.
- [ ] `report-doughnut-chart.tsx`: reduced-motion-gated `animateRotate`/`animateScale` entrance.
- [ ] (optional) extract `lib/prefers-reduced-motion.ts`; reuse in both charts.
- [ ] Run the app: toolbar one row + wraps; money cards count up; charts animate in on load + period switch; OS reduced-motion → no count-up / no chart animation.

## Done when

- Period switcher + both export buttons sit on a single row with no empty gap; wraps cleanly when narrow; export feedback still visible.
- Total Balance + Paid Amount count up (money-formatted); Invoice Count still counts up; dashboard cards unchanged.
- Bars render with a gradient + refined palette + rounded tops; bars + doughnut animate in on load and on period switch.
- Reduced-motion disables both the count-up and the chart entrance animations.
- No TypeScript errors; existing dashboard tests/behavior unaffected.

## Touches

- `apps/open-myanmar-invoice/src/features/reports/pages/reports-page.tsx` — toolbar row + money-card props.
- `apps/open-myanmar-invoice/src/features/reports/components/report-export-bar.tsx` — inline layout.
- `apps/open-myanmar-invoice/src/features/dashboard/components/stat-card.tsx` — optional `format` prop.
- `apps/open-myanmar-invoice/src/features/reports/components/report-bar-chart.tsx` — gradient + animation.
- `apps/open-myanmar-invoice/src/features/reports/components/report-doughnut-chart.tsx` — animation.
- `apps/open-myanmar-invoice/src/lib/prefers-reduced-motion.ts` — new (optional shared helper).
