# Spec — Invoice Report: Excel Export + UI Revamp (2026-05-26)

One-line: Swap the report page's JSON export for styled Excel (`.xlsx`); revamp the page into a single toolbar row + add micro-animations and cleaner charts.
Source: `workflow/ideas/open-myanmar-invoice/report-idea-2.md`

Builds on plan 019 (the `/reports` page). App: `apps/open-myanmar-invoice` (Electrobun, React 19 renderer, bun main).

## Goal

Replace the report page's JSON export with a polished Excel (`.xlsx`) export — year + date-range, detail rows — and revamp the page: merge the period switcher + export controls into one toolbar row (kill the empty space), add tasteful micro-animations, and refine the chart visuals.

## Users / context

Single-user, offline, Myanmar-first desktop app. User opens Reports to review revenue and export invoice records for accounting — **Excel is the deliverable they hand to an accountant** (JSON wasn't). Light-mode only. Bilingual EN/MY.

## Scope

**In:**

- **Excel replaces JSON entirely** — remove the JSON export path. Excel is the only format (no toggle/picker).
- Both existing flows keep working, now producing `.xlsx`:
  - Export by year → `invoices-<Y>.xlsx`
  - Export by date range → `invoices-<from YYYY-MM-DD>-to-<to YYYY-MM-DD>.xlsx`
- Excel content: **one styled "Invoices" sheet, detail rows only** (no summary/second sheet). Columns from `ExportRowDTO`: `invoiceNo`, `status`, `totalAmount`, `createdDate`, `dueDate`, `clientName`, `clientEmail`, `clientMobile`, `clientAddress`.
  - Header row: bold + fill, frozen; sensible column widths.
  - `totalAmount` → numeric cell, thousands format (`#,##0`); currency in the header label (e.g. `Total (MMK)`).
  - `createdDate` / `dueDate` → real Excel date cells (`yyyy-mm-dd`); `dueDate` blank if null.
  - `status` → localized text (Paid / ပေးပြီး, Unpaid / မပေးရသေး).
  - Column headers + sheet name + status localized to the **current UI language**.
  - Drafts excluded (unchanged — `exportInvoices` already filters).
- Library: **exceljs**. Build bytes in the renderer, then `exportApi.save(bytes, name, "xlsx")` (mirror the JSON pipeline). Extend the `kind` union + extension map with `"xlsx"`.
- **UI — one toolbar row:** merge the period switcher (left) + the two export buttons (right) into the period row's existing `justify-between` container; remove the standalone `ReportExportBar` row. Wraps on narrow widths. Export still opens the year / date-range modals; export feedback (exporting/success/error) stays visible.
- **Polish / micro-animations (all four):**
  - Count-up on the money cards (Total Balance, Paid Amount), **money-formatted during the count**.
  - Charts draw on entrance (bars grow up; doughnut rotate + scale) on load and on period change.
  - Refined chart visuals: rounded bar tops, subtle gradient fill, refined brand palette, lighter gridlines.
  - Enhanced card hover-lift + staggered rise-in reveal.
  - All animations reduced-motion-safe.
- Bilingual EN/MY copy for new strings (Excel column headers, sheet name, status labels). Reuse existing export copy (`byYear`, `byRange`, modals, `exporting`/`exported`/`exportError`); "Saved to your Downloads folder." still applies.

**Out (non-goals):**

- JSON export (removed), CSV, PDF report export.
- Summary / multi-sheet workbook (detail-only chosen).
- Format toggle / picker (Excel is the only format).
- Backend data/RPC shape changes — `exportInvoices` returns the same `ExportRowDTO[]`; only the `xlsx` kind + extension plumbing is added.
- Dashboard redesign — `StatCard` gains only a non-breaking optional prop; dashboard behavior unchanged.
- Dark mode.
- New chart types or interactivity beyond hover tooltips.
- Products/company detail in the export (unchanged).

## Requirements

- [ ] Export by year → `invoices-<Y>.xlsx`; date-range → `invoices-<from>-to-<to>.xlsx`; both saved to Downloads + revealed (existing behavior).
- [ ] `.xlsx` opens cleanly in Excel / Numbers / LibreOffice: styled header, numeric money cells, real date cells, localized status — no corruption warning.
- [ ] JSON export path removed (`export-json.ts` gone/replaced); no dead JSON code.
- [ ] `ExportKind` + `exportApi.save` union + `export-paths` extension map include `"xlsx"` → `.xlsx`; `saveExport` writes the binary bytes unchanged.
- [ ] Drafts excluded from exports (unchanged).
- [ ] Period switcher + both export buttons render on ONE row (switcher left, buttons right); no empty right-side gap; wraps on narrow widths; export feedback still visible.
- [ ] Money cards (Total Balance, Paid Amount) count up, money-formatted; Invoice Count still counts up; reduced-motion disables.
- [ ] Bar + doughnut animate in on load and on period change; reduced-motion disables.
- [ ] Bars have rounded tops + gradient/refined palette; chart styling reads "clean".
- [ ] All new copy bilingual EN/MY; headers/status follow the current language.
- [ ] No TypeScript errors; dashboard page unaffected; existing tests pass.

## Constraints

- **exceljs in the Vite renderer** is the known risk: validate it bundles (it ships a browser build `exceljs/dist/exceljs.min.js`; may need that import or a Vite polyfill for `buffer`/`stream`). If it won't bundle cleanly, fall back to generating the `.xlsx` in the **bun main process** (exceljs is node-native there) — see Open questions.
- xlsx is binary: build `Uint8Array` via `workbook.xlsx.writeBuffer()` → `Array.from(...)` for the `number[]` wire transfer to `saveExport`.
- `StatCard` (`features/dashboard/components/stat-card.tsx`) is shared with the dashboard. Its count-up currently only fires when `value` is a number and renders an **unformatted** integer. To count up money, add an OPTIONAL formatter prop (e.g. `format?: (n) => ReactNode`); default behavior unchanged so the dashboard is untouched.
- Electrobun: no native save dialog — reuse the existing `saveExport` → Downloads + reveal pipeline.
- Light-mode only; Tailwind v4 classNames; kebab-case files; `features/reports/` folder conventions.
- Chart.js animations are on by default — configure entrance timing + gate on `prefers-reduced-motion`.
- Dates stored epoch-ms; convert at the export layer (`new Date(ms)` → exceljs date cell).

## Acceptance — done when

- On `/reports`, the period switcher and both export buttons sit on a single row with no empty gap; the layout wraps cleanly when narrow.
- Choosing year 2025 downloads `invoices-2025.xlsx` (revealed) that opens in Excel with: a bold frozen header, money as right-aligned numbers, dates as dates, localized status, and only non-draft 2025 invoices.
- A valid date range downloads `invoices-<from>-to-<to>.xlsx` with matching rows; an inverted range shows `rangeInvalid` and does not export.
- Money cards count up; both charts animate in on load and when switching periods; bars are rounded with a refined palette.
- Toggling language re-renders the page AND the next exported file's headers/status in that language.
- Reduced-motion users see no count-up / chart entrance animation.
- No JSON file can be produced from the report page anymore.

## Open questions

- **Generation location** — renderer (chosen — mirrors the JSON pipeline) vs bun main process. Keep bun-main as the fallback if exceljs won't bundle in the Vite renderer. Plan-maker: spike the exceljs renderer import first; if it fails, an `exportXlsx` RPC in bun (rows fetched there, localized labels passed as params) is the fallback.
- **Money cell + currency** — numeric `#,##0` with currency in the header label (`Total (MMK)`) vs a separate currency column. Recommend header label.
- **Header/status language** — follow current UI language (recommended, resolved) vs always English for portability when sharing the file abroad. Revisit only if the user wants fixed-English output.
