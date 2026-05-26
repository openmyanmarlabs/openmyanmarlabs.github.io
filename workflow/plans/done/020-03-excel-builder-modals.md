# 020-03 — Excel builder + wire modals (replace JSON)

Plan: `020-root-report-excel-export-ui-revamp.md` · Blocked by: 01, 02 · Parallel-safe with: 04

## Goal

Replace the JSON export with a styled `.xlsx`: a pure, tested row-mapper + an exceljs workbook builder that ships bytes via `exportApi.save(…, "xlsx")`, wired into the year + date-range modals. Delete the JSON path.

## Context

Today both modals call `downloadInvoicesJson(rows, baseName)` (`features/reports/lib/export-json.ts` → `JSON.stringify` → bytes → `exportApi.save(bytes, name, "json")`). Replace that file/function with an xlsx equivalent.

Depends on:

- **01** — `exportApi.save(bytes, name, "xlsx")` exists; exceljs installed + renderer-bundling confirmed. **If 01 flagged a bundling failure, DO NOT proceed** — switch to the bun-main-process fallback first (see root Notes).
- **02** — `t.reports.export.columns.*`, `t.reports.export.sheetName`; status via `t.reports.charts.paid` / `unpaid`.

Data: `reportApi.exportInvoices({ fromDate, toDate })` returns `ExportRowDTO[]` (UNCHANGED). Fields: `invoiceNo`, `status` (`"paid" | "unpaid"`), `totalAmount` (number), `createdDate` (ISO string), `dueDate` (ISO string | null), `clientName`, `clientEmail`, `clientMobile`, `clientAddress` (strings, may be "").

Pipeline (mirror JSON): `workbook.xlsx.writeBuffer()` → `Array.from(new Uint8Array(buf))` → `exportApi.save(bytes, baseName, "xlsx")`.

Keep the builder **i18n-agnostic** (testable, no `useT` inside): it takes rows + an options bag `{ sheetName, columns, statusPaid, statusUnpaid, currency }`; the modals build that bag from `useT()` + the store currency.

TDD — the row-mapper is pure (status localization, ISO→Date, null due, money number). Test it per `.claude/skills/tdd/SKILL.md`. The exceljs workbook assembly + modal wiring are NOT unit-tested (lib + transport) — verified by the root's manual `verify` walk (open the file).

The modals currently don't read currency — add `useReportStore((s) => s.currency)` to each.

## Steps

- [ ] **`features/reports/lib/export-xlsx.ts` — pure mapper first.**
  - **(red)** `export-xlsx.test.ts`: `toSheetRow(row, { statusPaid, statusUnpaid })` →
    - `status: "paid"` → `statusPaid`; `"unpaid"` → `statusUnpaid`.
    - `createdDate` ISO → a `Date`; `dueDate` null → `null` (blank cell), ISO → `Date`.
    - `totalAmount` passes through as a number.
    - missing client fields → `""`.
  - **(green)** implement `toSheetRow` + a `SheetRow` type / fixed column order.
- [ ] **Same file — `downloadInvoicesXlsx(rows, baseName, opts)`:**
  - `new ExcelJS.Workbook()`; `addWorksheet(opts.sheetName)`.
  - Header row from `opts.columns` (Total header = `${opts.columns.total} (${opts.currency})`); **bold + fill**; freeze it (`views: [{ state: "frozen", ySplit: 1 }]`).
  - Column widths per field (e.g. invoiceNo ~14, status ~10, total ~16, dates ~14, client ~22, email ~26, mobile ~16, address ~30).
  - Map rows via `toSheetRow`; money column `numFmt = "#,##0"` + right align; date columns `numFmt = "yyyy-mm-dd"`.
  - `const buf = await wb.xlsx.writeBuffer(); return exportApi.save(Array.from(new Uint8Array(buf)), baseName, "xlsx");`
- [ ] **`year-picker-modal.tsx`** — replace the `downloadInvoicesJson` import/call with `downloadInvoicesXlsx(rows, "invoices-"+year, opts)`, building `opts` from `t.reports.export.columns`, `t.reports.export.sheetName`, `t.reports.charts.paid/unpaid`, and `useReportStore((s) => s.currency)`.
- [ ] **`date-range-modal.tsx`** — same swap; base name `invoices-<from>-to-<to>` (keep the existing date-fns formatting); add currency from the store.
- [ ] Delete `features/reports/lib/export-json.ts`; `grep downloadInvoicesJson` → no hits.
- [ ] Typecheck.

## Done when

- `bun test export-xlsx` green (status localization, date/null handling, money passthrough, empty client fields).
- Both modals export `.xlsx` via `exportApi.save(…, "xlsx")`; no JSON code path remains.
- Manual (root verify): the file opens with a bold frozen header, `#,##0` money, `yyyy-mm-dd` dates, localized status + headers, only non-draft rows; filenames `invoices-2025.xlsx` / `invoices-<from>-to-<to>.xlsx`; currency in the Total header; language toggle changes the next file's headers/status.

## Touches

- `apps/open-myanmar-invoice/src/features/reports/lib/export-xlsx.ts` — new (mapper + builder).
- `apps/open-myanmar-invoice/src/features/reports/lib/export-xlsx.test.ts` — new (mapper tests).
- `apps/open-myanmar-invoice/src/features/reports/components/year-picker-modal.tsx` — call xlsx + currency.
- `apps/open-myanmar-invoice/src/features/reports/components/date-range-modal.tsx` — call xlsx + currency.
- `apps/open-myanmar-invoice/src/features/reports/lib/export-json.ts` — delete.
