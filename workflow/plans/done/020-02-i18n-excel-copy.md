# 020-02 — i18n: Excel column copy

Plan: `020-root-report-excel-export-ui-revamp.md` · Blocked by: — · Parallel-safe with: 01, 04

## Goal

Add the bilingual (EN + MY) strings the Excel builder needs: column headers + sheet name. Status text in the sheet reuses the existing `reports.charts.paid` / `unpaid` — no new status keys.

## Context

Copy lives in `src/lib/i18n/content.ts` as symmetric `my` + `en` trees (Myanmar-first). The report block already exists under `reports` with an `export` sub-object (keys today: `byYear`, `byRange`, `yearTitle`, `yearSubtitle`, `rangeTitle`, `rangeSubtitle`, `from`, `to`, `submit`, `cancel`, `exporting`, `exported`, `exportError`, `rangeInvalid`). Find BOTH the `my` and `en` `reports.export` objects and add to each. The i18n type is inferred from the tree, so **both trees must stay structurally identical** (same keys, same order) or the app won't type-check.

The `total` column header gets the currency appended by the builder at runtime (`${columns.total} (${currency})`), so `columns.total` is just the word "Total".

## Steps

- [ ] Under `reports.export` in BOTH trees, add `sheetName` + a `columns` object:
  - `sheetName` — EN "Invoices" / MY "ငွေတောင်းခံလွှာများ".
  - `columns.invoiceNo` — "Invoice No" / "ငွေတောင်းခံလွှာ နံပါတ်".
  - `columns.status` — "Status" / "အခြေအနေ".
  - `columns.total` — "Total" / "စုစုပေါင်း".
  - `columns.created` — "Created" / "ထုတ်သည့်ရက်".
  - `columns.due` — "Due" / "ပေးရမည့်ရက်".
  - `columns.clientName` — "Client" / "ဖောက်သည်".
  - `columns.clientEmail` — "Email" / "အီးမေးလ်".
  - `columns.clientMobile` — "Mobile" / "ဖုန်း".
  - `columns.clientAddress` — "Address" / "လိပ်စာ".
- [ ] Keep both trees symmetric. Let prettier format on save.

## Done when

- `reports.export.columns.*` + `reports.export.sheetName` exist in BOTH `my` and `en` with identical key sets.
- App type-checks (both trees match).

## Touches

- `apps/open-myanmar-invoice/src/lib/i18n/content.ts` — add `sheetName` + `columns` under `reports.export` (both trees).
