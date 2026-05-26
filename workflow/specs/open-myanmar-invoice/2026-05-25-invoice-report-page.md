# Spec — Invoice Report Page (2026-05-25)

New `/reports` route: period-scoped stats, bar + doughnut charts, yearly + date-range JSON export.
Source: `workflow/ideas/open-myanmar-invoice/report-idea.md`

## Goal

Add a Report page to the invoice app that visualises billing performance over
selectable periods (1 month / 3 months / 6 months / 1 year) via Chart.js charts,
and lets the user export paid/unpaid invoice data as JSON — either for a chosen
calendar year or an arbitrary date range.

## Users / context

Single-user, offline, Myanmar-first desktop app. User opens Reports to review
revenue trends and export records for accounting. No auth, no network.

## Scope

**In:**

- New route `/reports` under the existing `AppLayout` shell.
- Sidebar nav link "Reports" (EN) / "အစီရင်ခံစာ" (MY), between Invoices and Clients (or after Invoices).
- Period toggler: 1 Month / 3 Months / 6 Months / 1 Year (extends current `DashboardPeriod` union with `"year"`).
- Three stat cards: Total Balance, Paid Amount, Invoice Count — scoped to the selected period, excluding drafts.
- **Bar chart**: monthly totals (total amount + paid amount) over the selected period using `chart.js` + `react-chartjs-2` (TypeScript).
- **Doughnut chart**: paid vs unpaid split for the selected period.
- Both charts use the app's accent/brand colours; light-mode only (app is light-only).
- **Yearly JSON export**: button opens a modal/popup listing years from current year back 9 years (e.g. 2026 … 2018). User picks year → download JSON of all paid + unpaid (status 2 or 3) invoices in that year.
- **Date-range JSON export**: button opens a modal with two date pickers (from/to). User picks range → download JSON of matching paid + unpaid invoices.
- JSON export fields per invoice row: `invoiceNo`, `status` (string: `"paid"` | `"unpaid"`), `totalAmount`, `createdDate` (ISO string), `dueDate` (ISO string | null), `clientName`, `clientEmail`, `clientMobile`, `clientAddress` (last four from `clientSnapshot`; fallback to `""` if snapshot absent).
- Draft invoices excluded from all exports.
- Bilingual EN + MY copy added to `content.ts` (symmetric keys, Myanmar-first).
- New backend: `reportStats` RPC (period-scoped bar-chart data per month) + `exportInvoices` RPC (date-range JSON list).
- JSON download triggers native file-save via existing `saveExport`-style RPC (kind `"json"`) or a new `saveJson` handler — writes to Downloads folder, reveals file.

**Out (non-goals):**

- Products / services detail in exports.
- Company snapshot in exports.
- Chart interactivity beyond hover tooltips.
- CSV export.
- Editing or status-changing invoices from the report page.
- Modifying the existing Dashboard page.
- Dark mode (app is light-only).
- Per-client or per-product breakdown charts.

## Requirements

- [ ] `/reports` route renders inside `AppLayout`; sidebar shows the Reports link.
- [ ] Period toggler renders 4 options (1M / 3M / 6M / 1Y); default is 1 Month; matches bilingual copy.
- [ ] Stat cards show Total Balance, Paid Amount, Invoice Count scoped to period (drafts excluded from amounts; Invoice Count = paid + unpaid total).
- [ ] Bar chart: x-axis = calendar months in range, y-axis = amount (MMK); two datasets — total invoiced vs paid. Uses `chart.js` + `react-chartjs-2`.
- [ ] Doughnut chart: segments for paid / unpaid counts in period.
- [ ] Yearly export button: opens year-picker popup with years `currentYear` down to `currentYear - 9`; choosing a year triggers export and closes popup.
- [ ] Date-range export button: opens modal with from/to date pickers (reuse `react-day-picker`); Submit triggers export.
- [ ] Both exports write a `.json` file to the Downloads folder (via bun main-process handler), then reveal it. Filename pattern: `invoices-{year}.json` / `invoices-{from}-to-{to}.json`.
- [ ] Export JSON is an array of invoice objects with fields listed in Scope.
- [ ] All copy bilingual (EN/MY) and added to `content.ts` under a `reports` key.
- [ ] New RPC handlers covered by tests (same pattern as existing `invoice-handlers.test.ts`).

## Constraints

- `chart.js` + `react-chartjs-2` — TypeScript-compatible; install via Bun.
- Extend `DashboardPeriod` union (currently `"month" | "3months" | "6months"`) with `"year"` — or define a separate `ReportPeriod` type to avoid coupling if the dashboard period switcher must not change.
- Offline SQLite; all queries via Drizzle ORM in the bun process.
- `clientSnapshot` is a JSON string on the invoice row; parse defensively (may be null or malformed for old rows).
- Light-mode only; no dark-mode CSS needed.
- Dates stored as epoch-ms integers; convert to ISO strings at the export layer.
- Follow existing file-naming (`kebab-case`, even for PascalCase exports) and feature-folder conventions (`src/features/reports/`).

## Acceptance — done when

- Navigating to `/reports` via the sidebar shows the page with period toggler, three stat cards, bar chart, doughnut chart.
- Switching periods refreshes all three widgets and both charts.
- Yearly export: choosing 2025 downloads `invoices-2025.json` with the correct rows and fields; draft rows absent.
- Date-range export: picking a range downloads the correctly named file with matching rows.
- All labels render in both EN and MY when the language is toggled.
- No TypeScript compile errors; existing tests still pass.

## Open questions

- `saveExport` RPC currently types `kind` as `"pdf" | "image"`. Options: (a) extend the union to add `"json"` with `text/plain` write path, or (b) add a separate `saveJson` handler. Recommend (a) — simpler, one handler.
- `ReportPeriod` vs extending `DashboardPeriod`: adding `"year"` to the dashboard union is safe only if `periodRange()` in `dashboard-store.ts` handles `"year"`. If that utility is shared, extend it. If not, define `ReportPeriod` independently.
