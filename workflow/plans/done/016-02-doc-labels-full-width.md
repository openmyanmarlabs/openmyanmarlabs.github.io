# 016-02 — English document labels + full invoice width

Plan: `016-root-<slug>.md` · Blocked by: — · Parallel-safe with: 01, 03, 04, 05

## Goal

Hardcode English strings on the invoice document so exported PDF/image always shows professional English regardless of app language; remove `max-w-3xl` so the editor view spans full container.

## Context

- All four files live under `apps/open-myanmar-invoice/src/features/invoices/components/`.
- Each file calls `useT()` and holds `b = t.invoices.builder`. **Keep** `useT()` / `b` — only the specific document-visible labels listed below are hardcoded; UI-only strings (placeholders, button labels for adding items, tax title copy, etc.) stay as `{b.*}` so the app UI still localises.
- `invoice-document.tsx` line 94: width class `isExporting ? "w-[794px] max-w-none" : "w-full max-w-3xl"` — drop `max-w-3xl` from the non-exporting branch.
- `invoice-export-stage.tsx` and `invoice-builder-page.tsx` are **not** touched.
- `content.ts` (i18n) is **not** touched — labels stay there for other uses.

Labels to swap (file → JSX → hardcoded string):

| File                 | Expression                                        | Hardcoded       |
| -------------------- | ------------------------------------------------- | --------------- |
| invoice-document.tsx | `{b.invoiceNo}` (line ~128)                       | `"Invoice No"`  |
| invoice-document.tsx | `{b.dueDate}` (line ~144)                         | `"Due Date"`    |
| invoice-parties.tsx  | `{b.from}` (line ~49)                             | `"From"`        |
| invoice-parties.tsx  | `{b.billTo}` (line ~66)                           | `"Bill To"`     |
| invoice-items.tsx    | `{b.itemName}` column header `<span>` (line ~65)  | `"Description"` |
| invoice-items.tsx    | `{b.qty}` column header `<span>` (line ~66)       | `"QTY"`         |
| invoice-items.tsx    | `{b.price}` column header `<span>` (line ~67)     | `"RATE"`        |
| invoice-items.tsx    | `{b.lineTotal}` column header `<span>` (line ~68) | `"AMOUNT"`      |
| invoice-summary.tsx  | `{b.subtotal}` (line ~54)                         | `"Subtotal"`    |
| invoice-summary.tsx  | `{b.addPercentTax}` button label (line ~140)      | `"Add % tax"`   |
| invoice-summary.tsx  | `{b.addFlatTax}` button label (line ~149)         | `"Add fee"`     |
| invoice-summary.tsx  | `{b.total}` (line ~158)                           | `"Total"`       |

Note: `placeholder={b.itemName}` in `invoice-items.tsx` (~line 109) is UI — leave unchanged.

## Steps

- [ ] **invoice-document.tsx**
  - Replace `{b.invoiceNo}` → `Invoice No` (string literal, no braces).
  - Replace `{b.dueDate}` → `Due Date`.
  - Change line ~94 width class: `isExporting ? "w-[794px] max-w-none" : "w-full"` (remove `max-w-3xl`).
  - Verify `useT()` / `b` remains for other strings (`b.companyName`, `b.noDueDate`, etc.).

- [ ] **invoice-parties.tsx**
  - Replace `{b.from}` → `From`.
  - Replace `{b.billTo}` → `Bill To`.
  - Verify `useT()` / `b` remains for `b.chooseClient`, `b.noClient`, etc.

- [ ] **invoice-items.tsx**
  - In the column header block (lines ~65–68): replace the four `{b.*}` spans with `Description`, `QTY`, `RATE`, `AMOUNT`.
  - Leave `placeholder={b.itemName}` on the input (~line 109) untouched.
  - Verify `useT()` / `b` remains for `b.addItem`, `b.addFromProducts`, `b.removeItem`.

- [ ] **invoice-summary.tsx**
  - Replace `{b.subtotal}` → `Subtotal`.
  - Replace `{b.addPercentTax}` inside the button → `Add % tax`.
  - Replace `{b.addFlatTax}` inside the button → `Add fee`.
  - Replace `{b.total}` → `Total`.
  - Verify `useT()` / `b` remains for `b.taxTitle`, `b.percentSuffix`, `b.removeTax`.

- [ ] Run `bun tsc --noEmit` (or equivalent) from the app root to confirm no TS errors.

## Done when

- App language switched to Myanmar → all document labels (Invoice No, Due Date, From, Bill To, Description, QTY, RATE, AMOUNT, Subtotal, Add % tax, Add fee, Total) still render in English.
- Invoice builder view: card spans full container width with no `max-w-3xl` cap.
- TypeScript compiles without errors.

## Touches

- `apps/open-myanmar-invoice/src/features/invoices/components/invoice-document.tsx` — hardcode 2 labels, drop `max-w-3xl`.
- `apps/open-myanmar-invoice/src/features/invoices/components/invoice-parties.tsx` — hardcode 2 labels.
- `apps/open-myanmar-invoice/src/features/invoices/components/invoice-items.tsx` — hardcode 4 column-header labels.
- `apps/open-myanmar-invoice/src/features/invoices/components/invoice-summary.tsx` — hardcode 4 labels.
