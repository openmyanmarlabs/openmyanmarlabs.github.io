# 019-04 — Report page: stats + charts

Plan: `019-root-report-page.md` · Blocked by: 01, 02, 03 · Parallel-safe with: —

## Goal

Build the `/reports` route: a zustand store with a 4-option period switcher (incl. 1 Year),
three stat cards (Total Balance, Paid Amount, Invoice Count), a monthly bar chart, and a
paid/unpaid doughnut. Wire the route + a sidebar nav link. (Export UI lands in phase 05.)

## Context

UI phase — not unit-tested (charts + Electrobun transport). Verified by running the app
(phase 05 + the root's manual `verify` step). Mirror the existing dashboard closely.

**Patterns to follow (read first):**

- `features/dashboard/stores/dashboard-store.ts` — store shape + `periodRange()` + load
  pattern. **Do NOT edit it** — define an independent `ReportPeriod` so the dashboard's
  3-option switcher is untouched (spec open question resolved: separate type).
- `features/dashboard/pages/dashboard-page.tsx` — page layout (`max-w-5xl`, `rise-in`
  stagger), the **period switcher** markup (a `grid-cols-3` pill with a sliding thumb) —
  adapt to **4 segments**, and how `StatCard` + `formatMoney` + `loading` dimming are used.
- `features/dashboard/components/stat-card.tsx` — **reuse `StatCard`** as-is (label, value,
  icon, `accent`, `countUp`).
- `lib/rpc.ts` → `reportApi.stats()` (from phase 02). `lib/money.ts` → `formatMoney`.
- `stores/i18n-store.ts` → `useT()`; copy under `t.reports.*` + `t.nav.toReports` (phase 03).
- `components/layout/sidebar.tsx` — nav item array + `@remixicon/react` icons.
- `routes/index.tsx` — append a route to the existing `AppLayout` children array
  (the file's header says: add only your own entry, never rewrite the array).
- `features/reports/lib/register-charts.ts` (phase 01) — chart components import it for the
  registration side-effect.
- Light-only: no `dark:` needed; mirror existing class patterns. Only consult
  `tailwind-docs-reader` if a _new_ v4 directive/`@theme` token is required (not expected).

**`ReportPeriod` + ranges** (define in the store):
`"month" | "3months" | "6months" | "year"`. `periodRange(period)` → `{ fromDate, toDate }`:

- `month`: from = first day of **this** month 00:00 local; to = now.
- `3months` / `6months`: from = first day of the month 2 / 5 ago (mirror dashboard).
- `year`: from = first day of the month **11** ago (→ 12 month buckets); to = now.

## Steps

- [ ] **`features/reports/stores/reports-store.ts`** — `ReportPeriod` type + `periodRange()`
      (above). State: `stats: ReportStatsDTO | null`, `currency: string`, `loading`,
      `initialized`, `period` (default `"month"`), `load()`, `setPeriod(p)`. `load()`:
      `reportApi.stats(periodRange(period))` + `companyApi.get()` for currency (default
      `"MMK"`). `setPeriod` sets period then re-`load()`. Mirror dashboard-store.
- [ ] **`features/reports/components/report-bar-chart.tsx`** — `import "@/features/reports/lib/register-charts"`;
      render `<Bar>` from `react-chartjs-2`. `labels` = `stats.monthly.map(m => m.month)`
      (optionally prettify `YYYY-MM` → `MMM` via date-fns); two datasets:
      `t.reports.charts.total` (all monthly `total`) and `t.reports.charts.paid` (monthly
      `paid`). Options: `responsive`, `maintainAspectRatio: false`, legend on, tooltip
      callback formatting values with `formatMoney(v, currency)`. Brand accent for "paid",
      a neutral/lighter shade for "total". Wrap in a fixed-height container (e.g. `h-72`).
- [ ] **`features/reports/components/report-doughnut-chart.tsx`** — `<Doughnut>` with labels
      `[t.reports.charts.paid, t.reports.charts.unpaid]` and data
      `[stats.paidCount, stats.unpaidCount]`. Two-segment palette (brand = paid, neutral =
      unpaid). Same responsive options + fixed-height container.
- [ ] **`features/reports/pages/reports-page.tsx`** — layout like dashboard-page:
  - `useEffect(load)` on mount.
  - **Period switcher**: adapt the dashboard's sliding-pill to `grid-cols-4`; thumb
    `w-1/4`; translate `0 / full / 200% / 300%` for month/3months/6months/year; labels from
    `t.reports.period.*`; `onClick` → `setPeriod`.
  - **Stat cards** (reuse `StatCard`, `grid` 1/2/3 cols): Total Balance
    (`formatMoney(stats.totalBalance, currency)`, `accent`), Paid Amount
    (`formatMoney(stats.paidAmount, currency)`), Invoice Count (`stats.invoiceCount`,
    `countUp`). Icons: reuse small inline SVGs or `@remixicon/react`.
  - **Charts**: a responsive row/grid — bar chart (wider) + doughnut. Empty state: when
    `stats.invoiceCount === 0`, show `t.reports.charts.empty` instead of charts (don't
    render an all-zero chart that looks broken).
  - **Export-bar mount point**: leave a clearly-marked slot (a comment + an empty section)
    where phase 05 inserts `<ReportExportBar />`. Don't build the export UI here.
  - Dim the scoped section while `loading` (mirror dashboard).
- [ ] **`routes/index.tsx`** — import `ReportsPage`; append
      `{ path: "/reports", element: <ReportsPage /> }` to the `AppLayout` children.
- [ ] **`components/layout/sidebar.tsx`** — add a nav item after Invoices:
      `{ to: "/reports", label: t.nav.toReports, Icon: RiBarChartBoxLine }` (import the icon
      from `@remixicon/react`; pick a chart/report glyph).

## Done when

- Navigating to `/reports` (via the sidebar link) renders the page inside `AppLayout`.
- Period switcher shows 4 options (1M/3M/6M/1Y), default 1 Month; switching refetches and
  updates stat cards + both charts.
- Stat cards show Total Balance + Paid Amount (money-formatted) + Invoice Count (counts up).
- Bar chart renders monthly total vs paid; doughnut renders paid vs unpaid.
- Empty period shows the empty-state copy, not a broken chart.
- Labels render in both EN and MY on language toggle. No TypeScript errors.

## Touches

- `apps/open-myanmar-invoice/src/features/reports/stores/reports-store.ts` — new.
- `apps/open-myanmar-invoice/src/features/reports/pages/reports-page.tsx` — new.
- `apps/open-myanmar-invoice/src/features/reports/components/report-bar-chart.tsx` — new.
- `apps/open-myanmar-invoice/src/features/reports/components/report-doughnut-chart.tsx` — new.
- `apps/open-myanmar-invoice/src/routes/index.tsx` — add `/reports` route.
- `apps/open-myanmar-invoice/src/components/layout/sidebar.tsx` — add nav link.
