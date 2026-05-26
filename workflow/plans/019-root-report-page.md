# Plan 019 — Invoice Report Page

Source: `workflow/specs/2026-05-25-invoice-report-page.md`

## Summary

New `/reports` route: period-scoped stats (1M/3M/6M/1Y), a monthly bar chart + a
paid/unpaid doughnut (Chart.js), and two JSON exports (by calendar year, by date
range) of non-draft invoices. Backend adds one repo query (`reportInvoices`, non-draft
in range) plus two pure service functions (`buildReportStats` for the rollup+monthly
buckets, `toExportRow` for the flat export shape) and extends the existing `saveExport`
pipeline with a `"json"` kind. Renderer adds a reports feature folder, reusing the
existing `StatCard`, `Modal`, and `react-day-picker` patterns.

## Phases

| #   | Phase                           | File                                  | Blocked by | Parallel-safe with |
| --- | ------------------------------- | ------------------------------------- | ---------- | ------------------ |
| 01  | Chart.js install + registration | `plans/todo/019-01-charts-setup.md`   | —          | 02, 03             |
| 02  | Report backend data layer       | `plans/todo/019-02-report-backend.md` | —          | 01, 03             |
| 03  | i18n copy (`reports` group)     | `plans/todo/019-03-i18n-copy.md`      | —          | 01, 02             |
| 04  | Report page: stats + charts     | `plans/todo/019-04-report-page.md`    | 01, 02, 03 | —                  |
| 05  | Export UI (year + date range)   | `plans/todo/019-05-export-ui.md`      | 02, 03, 04 | —                  |

Critical path: **(01 ∥ 02 ∥ 03) → 04 → 05**. Three independent phases fan out first
(install, backend, copy — disjoint files), then the page assembles them, then the
export UI mounts onto the page.

## Cross-phase contracts (keep these names stable)

Defined in phase 02, consumed by 04/05:

- `ReportParamsDTO = { fromDate?: number; toDate?: number }`
- `ReportMonthlyDTO = { month: string; total: number; paid: number }` — `month` = `"YYYY-MM"`
- `ReportStatsDTO = { totalBalance; paidAmount; invoiceCount; paidCount; unpaidCount; monthly: ReportMonthlyDTO[] }`
- `ExportRowDTO = { invoiceNo; status: "paid"|"unpaid"; totalAmount; createdDate: string /*ISO*/; dueDate: string|null; clientName; clientEmail; clientMobile; clientAddress }`
- RPC: `reportStats(ReportParamsDTO) → ReportStatsDTO`, `exportInvoices(ReportParamsDTO) → ExportRowDTO[]`
- `saveExport.kind` union extended: `"pdf" | "image" | "json"`
- Renderer API (`lib/rpc.ts`): `reportApi.stats()`, `reportApi.exportInvoices()`

Defined in phase 03, consumed by 04/05: the `reports` content key tree + `nav.toReports`
(exact tree listed in 019-03).

## Definitions (decided here)

- **Total Balance** = Σ `total_amount` of **non-draft** invoices (paid + unpaid) in the
  period. **Paid Amount** = Σ where status = 3. **Invoice Count** = count of non-draft.
  Drafts are excluded everywhere on this page (stats, both charts, both exports).
- **Bar chart** months: the calendar months spanned by the period (1M → 1 bar, 3M → 3,
  6M → 6, 1Y → 12), zero-filled. Two datasets per month: non-draft total + paid.
- **Month bucketing is local-time** — done in JS in `buildReportStats`, not in SQL, to
  avoid SQLite `strftime('unixepoch')` UTC drift at month boundaries.
- **Year picker**: 9 buttons, `currentYear` down to `currentYear − 8` (e.g. 2026 … 2018),
  matching the spec example. Year export range = local Jan 1 00:00:00.000 → Dec 31
  23:59:59.999 of that year (epoch-ms).
- **Date-range export**: inclusive — `from` day 00:00:00.000 → `to` day 23:59:59.999.
- Filenames (base passed to `saveExport`; handler appends `.json`): `invoices-<year>` and
  `invoices-<from-YMD>-to-<to-YMD>` (YMD = `YYYY-MM-DD`). `buildExportFilename` sanitizes.

## Notes / risks

- **react-chartjs-2 + React 19**: pin `react-chartjs-2@^5.3.0` + `chart.js@^4.4.0`
  (v5 supports React 19). Verify peer deps resolve on `bun add` (phase 01). Use **explicit**
  Chart.register (not `chart.js/auto`) to keep the renderer bundle lean.
- **`maxRequestTime` is already 60000** in `app-rpc.ts` (bumped in plan 017). reportStats
  - JSON export are tiny/fast — no timeout risk, no change needed.
- **`clientAddress` mapping**: the client snapshot is a serialized `ClientRow` whose field
  is `billingAddress` — `toExportRow` maps `billingAddress → clientAddress`. Snapshot may
  be `null`/malformed (old rows) → fall back to `""` for all four client fields.
- **"Total Balance" semantics** (non-draft gross, not outstanding-only) — chosen to match
  the dashboard's existing "total balance" wording. Confirm with the user if "balance"
  should instead mean unpaid-only.
- **Empty period** (no invoices): stat cards show 0 / `0 MMK`; charts render an empty/zeroed
  state — phase 04 must handle this, not crash.
- **Light-only**: app is light-only (memory: plan 014). New components need no `dark:`
  classes; mirror existing component class patterns. Only consult `tailwind-docs-reader` if
  introducing a _new_ Tailwind v4 directive/`@theme` token (not expected here).
- **Manual verify (can't be automated)** — run the `verify` skill after 04 + 05: JSON file
  actually lands in Downloads + reveals; bar/doughnut render crisply; year picker + date-range
  modal feel; EN/MY toggle on the page; switching period refetches. Charts, modals, and the
  Electrobun transport are not unit-tested (only the bun-side logic in phase 02 is).
