# 019-05 — Export UI (year + date range)

Plan: `019-root-report-page.md` · Blocked by: 02, 03, 04 · Parallel-safe with: —

## Goal

Add the two JSON exports to the report page: an "Export by year" button → year-picker
modal, and an "Export by date range" button → from/to date-picker modal. Both fetch
non-draft invoices via `reportApi.exportInvoices`, serialize to JSON, and save to Downloads
through the `saveExport` (`"json"`) pipeline, revealing the file.

## Context

UI phase — not unit-tested (modals + Electrobun transport). Verified by the root's manual
`verify` step (file actually lands in Downloads + reveals).

**Patterns to follow (read first):**

- `lib/rpc.ts` → `reportApi.exportInvoices(params)` + `exportApi.save(bytes, name, "json")`
  (both from phase 02). `ExportRowDTO` shape from `shared/types.ts`.
- `components/common/modal.tsx` — reusable `Modal` (`open`, `onClose`, `title`,
  `description`, `children`, `footer`, `size`). Use for both modals.
- `features/invoices/components/due-date-picker.tsx` — the **`react-day-picker` popover
  pattern** + `dayPickerClassNames` to copy for the from/to pickers (it does NOT import
  the library CSS — Tailwind classNames only). Outside-click + select-to-close handling.
- `components/ui/button.tsx` — button styles for the trigger buttons + modal footers.
- `features/invoices/lib/export.ts` shows how renderer bytes reach `exportApi` (the byte
  pipeline). Here the bytes are utf-8 JSON, not a raster.
- Copy under `t.reports.export.*` (phase 03). Money/feedback: inline status text is fine;
  optionally reuse the invoices `toast-store` if you want toasts (not required).
- The page's export-bar mount point was left by phase 04 in `reports-page.tsx`.

**Range math (from the root's Definitions):**

- Year `Y`: `fromDate` = `new Date(Y, 0, 1, 0, 0, 0, 0).getTime()`;
  `toDate` = `new Date(Y, 11, 31, 23, 59, 59, 999).getTime()`. Base name `invoices-<Y>`.
- Date range: `fromDate` = start-of-day(from); `toDate` = end-of-day(to) (23:59:59.999).
  Validate `fromDate <= toDate` (else show `t.reports.export.rangeInvalid`). Base name
  `invoices-<from YYYY-MM-DD>-to-<to YYYY-MM-DD>`.
- Year buttons: `currentYear` down to `currentYear − 8` (9 buttons, e.g. 2026 … 2018).

## Steps

- [ ] **`features/reports/lib/export-json.ts`** —

  ```ts
  import { exportApi } from "@/lib/rpc";
  import type { ExportRowDTO } from "@/shared/types";

  export async function downloadInvoicesJson(
    rows: ExportRowDTO[],
    baseName: string,
  ): Promise<{ path: string }> {
    const json = JSON.stringify(rows, null, 2);
    const bytes = Array.from(new TextEncoder().encode(json));
    return exportApi.save(bytes, baseName, "json");
  }
  ```

- [ ] **`features/reports/components/year-picker-modal.tsx`** — `Modal` (title
      `t.reports.export.yearTitle`, desc `yearSubtitle`) containing a grid of 9 year
      buttons (`currentYear … currentYear-8`). On click: compute year bounds → busy state
      (`t.reports.export.exporting`) → `reportApi.exportInvoices({ fromDate, toDate })` →
      `downloadInvoicesJson(rows, "invoices-"+year)` → close + success
      (`t.reports.export.exported`); catch → `t.reports.export.exportError`.
- [ ] **`features/reports/components/date-range-modal.tsx`** — `Modal` (title
      `rangeTitle`, desc `rangeSubtitle`) with two day-pickers (`from` / `to`) styled like
      `due-date-picker.tsx`. Footer: Cancel + Export (`submit`). On Export: validate
      `from <= to` (else `rangeInvalid`); compute bounds → busy → `exportInvoices` →
      `downloadInvoicesJson(rows, "invoices-"+fromYMD+"-to-"+toYMD)` → close + success;
      catch → error. Use date-fns (already a dep) to format `YYYY-MM-DD`.
- [ ] **`features/reports/components/report-export-bar.tsx`** — a small section with two
      buttons: `t.reports.export.byYear` and `t.reports.export.byRange`, each opening its
      modal (local `open` state). Surface busy / success / error feedback (inline text or
      toast). Disable buttons while a job is running.
- [ ] **`reports-page.tsx`** — replace the phase-04 export-bar mount point with
      `<ReportExportBar />` (import it). No other page changes.

## Done when

- The report page shows "Export by year" + "Export by date range" buttons.
- Year modal: choosing 2025 downloads `invoices-2025.json` to Downloads (revealed),
  containing only non-draft (paid + unpaid) invoices from 2025 with the `ExportRowDTO`
  fields; drafts absent.
- Date-range modal: a valid range downloads `invoices-<from>-to-<to>.json` with matching
  rows; an inverted range shows `rangeInvalid` and does not export.
- Success/error feedback appears; buttons disable while exporting.
- Copy renders in both EN and MY. No TypeScript errors.

## Touches

- `apps/open-myanmar-invoice/src/features/reports/lib/export-json.ts` — new.
- `apps/open-myanmar-invoice/src/features/reports/components/year-picker-modal.tsx` — new.
- `apps/open-myanmar-invoice/src/features/reports/components/date-range-modal.tsx` — new.
- `apps/open-myanmar-invoice/src/features/reports/components/report-export-bar.tsx` — new.
- `apps/open-myanmar-invoice/src/features/reports/pages/reports-page.tsx` — mount the export bar.
