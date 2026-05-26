# 018-03 — Dashboard period switcher (UI)

Plan: `018-root-invoice-ux-fixes-5.md` · Blocked by: 02 · Parallel-safe with: —

## Goal

Add a "This Month / 3 Months / 6 Months" group-button switcher to the dashboard that
re-fetches time-scoped stats and recent invoices for the selected period.

## Context

Blocked by phase 02 — needs the updated `dashboardStats` and `listInvoices` RPC params
(`fromDate`/`toDate`) to be in place before wiring the frontend.

Key files:

- `apps/open-myanmar-invoice/src/features/dashboard/stores/dashboard-store.ts` — Zustand store;
  `load()` currently calls `invoiceApi.dashboardStats()` and `invoiceApi.list()` without date
  params. Client/product counts must remain all-time (no date filter on those calls).
- `apps/open-myanmar-invoice/src/features/dashboard/pages/dashboard-page.tsx` — renders the
  dashboard; calls `store.load()` on mount. The stats tiles + recent-invoice panel are the
  two sections to scope; the hero, quick-actions, and client/product counts are unaffected.

Period → date range mapping (compute at call time, not stored as epoch-ms):

- `"month"` → `fromDate = start of current calendar month (midnight local), toDate = Date.now()`
- `"3months"` → `fromDate = start of the month 3 calendar months ago, toDate = Date.now()`
- `"6months"` → `fromDate = start of the month 6 calendar months ago, toDate = Date.now()`

Use `new Date()`, set day=1 + hour/min/sec/ms=0, then subtract months via `setMonth(d.getMonth() - N)`.

Zustand pattern in this codebase: store actions are inline functions in `create<State>(set =>
({ ... }))`. The existing `load` action calls `set({ loading: true })` at the start and
`set({ loading: false, initialized: true })` in finally. Follow the same shape.

No Tailwind v4 custom directives needed — standard utility classes only.

## Steps

- [ ] **Store: add period state** — In `dashboard-store.ts`:
  1. Add `export type DashboardPeriod = "month" | "3months" | "6months"` near the top.
  2. Add `period: DashboardPeriod` to `DashboardState` (default `"month"`).
  3. Add `setPeriod: (p: DashboardPeriod) => Promise<void>` to `DashboardState`.

- [ ] **Store: date range helper** — Add a pure module-level function (not exported):

  ```ts
  function periodRange(period: DashboardPeriod): {
    fromDate: number;
    toDate: number;
  } {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    if (period === "3months") from.setMonth(from.getMonth() - 2);
    if (period === "6months") from.setMonth(from.getMonth() - 5);
    return { fromDate: from.getTime(), toDate: Date.now() };
  }
  ```

  (For "3months" we go back 2 more months so the range spans 3 calendar months including the
  current one; same logic for "6months" → 5 additional months back.)

- [ ] **Store: update `load()`** — Modify `load` to read `get().period`, compute the range, and
      pass it to the two date-sensitive calls:

  ```ts
  load: async () => {
    const { fromDate, toDate } = periodRange(get().period);
    set({ loading: true });
    try {
      const [stats, company, clients, products, recent] = await Promise.all([
        invoiceApi.dashboardStats({ fromDate, toDate }),   // scoped
        companyApi.get(),
        clientApi.list({ limit: 1, offset: 0 }),           // all-time
        productApi.list({ limit: 1, offset: 0 }),          // all-time
        invoiceApi.list({ limit: RECENT_INVOICES_LIMIT, offset: 0, fromDate, toDate }), // scoped
      ]);
      set({ stats: stats ?? EMPTY_STATS, clientCount: ..., ... });
    } finally {
      set({ loading: false, initialized: true });
    }
  },
  ```

  The `get` function is available via the second argument of `create`: change the creator
  signature to `create<DashboardState>((set, get) => ({ ... }))`.

- [ ] **Store: implement `setPeriod`**:

  ```ts
  setPeriod: async (p) => {
    set({ period: p });
    await get().load();
  },
  ```

- [ ] **Page: period switcher UI** — In `dashboard-page.tsx`, above the stats tiles section:
  1. Read `period`, `setPeriod`, and `loading` from `useDashboardStore`.
  2. Render a group-button bar with three buttons: "This Month", "3 Months", "6 Months".
     - Active button: filled/brand style (e.g. `bg-brand-500 text-white`).
     - Inactive: ghost/outline (e.g. `bg-white border border-neutral-200 text-neutral-600`).
     - On click: call `void setPeriod(period)`.
     - The three buttons share a `rounded-lg overflow-hidden inline-flex` wrapper to form a
       segmented control (no gap between them; use border-right on first two to divide).
  3. While `loading` is true, add a subtle visual signal on the stats tiles and recent-invoice
     panel — e.g. `opacity-60 pointer-events-none` wrapper or a thin skeleton shimmer. Keep it
     lightweight; no full-page spinner.

- [ ] **Verify date math** — Manually confirm period boundaries in browser DevTools console
      before calling done:
  - "This Month" fromDate should be the 1st of the current month at midnight.
  - "3 Months" fromDate should be the 1st of the month 2 months ago.
  - "6 Months" fromDate should be the 1st of the month 5 months ago.

## Done when

- Dashboard loads "This Month" data by default on first mount.
- Clicking "3 Months" or "6 Months" re-fetches stats + recent invoices for that window; active
  button is visually distinct.
- Client count and product count tiles do not change on period switch.
- A subtle loading indicator appears on the stats + recent panel during the re-fetch.
- No full-page spinner; the hero and quick-actions remain visible during period switch.

## Touches

- `apps/open-myanmar-invoice/src/features/dashboard/stores/dashboard-store.ts`
- `apps/open-myanmar-invoice/src/features/dashboard/pages/dashboard-page.tsx`
