# 018-01 — Builder UI fixes

Plan: `018-root-invoice-ux-fixes-5.md` · Blocked by: — · Parallel-safe with: 02

## Goal

Apply five minor UX fixes to the invoice builder: Rate column width, tax-button styles,
Update Draft button, hide View/Edit toggle on locked invoices, and Draft→Paid/Unpaid validation.

## Context

All changes are pure frontend — no RPC or schema changes.

Key files:

- `apps/open-myanmar-invoice/src/features/invoices/components/invoice-items.tsx` — grid template at line 62 (`grid-cols-[1fr_4.5rem_6rem_6.5rem_2rem]`); the same template appears again for item rows (check the file for the second occurrence).
- `apps/open-myanmar-invoice/src/features/invoices/components/invoice-summary.tsx` — `Add % tax` button at ~line 133 uses `variant="ghost"`; `Add fee` button just below keeps `ghost`.
- `apps/open-myanmar-invoice/src/features/invoices/components/builder-toolbar.tsx` — `BuilderToolbarProps`, the View/Edit segmented control (guarded by `!isNew`), and the save-button block.
- `apps/open-myanmar-invoice/src/features/invoices/pages/invoice-builder-page.tsx` — `onSaveAs()` at line 152 sets `pendingStatus`; `onConfirmSave()` at line 156 writes to DB.

Existing patterns:

- `toast.warn(b.editOnlyDraft)` shows a warning toast — use the same `toast.warn()` / `toast.error()` pattern for validation failures.
- `invoiceApi.update(id, input)` is the existing update RPC call used in `onConfirmSave`.
- The builder store exposes `id` (the persisted invoice id) via `useBuilderStore.getState().id`.

## Steps

- [ ] **Rate column** — In `invoice-items.tsx`, change both occurrences of `6rem` in the RATE column position of the `grid-cols-[...]` template string to `8rem`. There are two grid templates: the header row div and the per-item row div. Update both.

- [ ] **Tax button style** — In `invoice-summary.tsx`, change the `Add % tax` button from `variant="ghost"` to `variant="outline"`. Leave the `Add fee` button as `variant="ghost"`.

- [ ] **Toolbar: hide View/Edit toggle on non-Draft** — In `builder-toolbar.tsx`, change the condition that renders the View/Edit segmented control from `!isNew` to `!isNew && status === 1`. For status 2/3, the control is simply not rendered.

- [ ] **Toolbar: Update Draft button** — In `builder-toolbar.tsx`:
  1. Add `onUpdateDraft: () => void` to `BuilderToolbarProps`.
  2. Inside the `!isPaid` save block, when `!isNew && status === 1`, render a `variant="secondary" size="sm"` button labelled with a new i18n key (see below) that calls `onUpdateDraft`.

- [ ] **Page: wire onUpdateDraft** — In `invoice-builder-page.tsx`:
  1. Implement `async function onUpdateDraft()`: read `id` from `useBuilderStore.getState().id`; if not present return. Call `setSaving(true)`. Call `invoiceApi.update(id, toInputDTO({ ...wc, status: 1 }))`. On success call `toast.success(b.saved)` and stay in edit mode (do NOT call `store.setViewMode(true)`). On error call `toast.error(b.saveError)`. Always `setSaving(false)` in finally.
  2. Pass `onUpdateDraft` to `<BuilderToolbar>`.

- [ ] **Page: validation before state transition** — In `invoice-builder-page.tsx`, modify `onSaveAs(status: number)`:
  - When `status === 2 || status === 3`, validate before setting `pendingStatus`:
    - If `!wc.clientId` → `toast.warn(b.validationNoClient)` (new key)
    - If `wc.items.length === 0` → `toast.warn(b.validationNoItems)` (new key)
    - If `!wc.dueDate` → `toast.warn(b.validationNoDueDate)` (new key)
  - If any check fails, return early — do NOT call `setPendingStatus(status)`.
  - All three toasts may fire in sequence if multiple fields are missing.

- [ ] **i18n keys** — Locate the invoice builder i18n object (search for `editOnlyDraft` in the i18n store or translation file). Add:
  - `updateDraft` — button label, e.g. `"Update Draft"`
  - `validationNoClient` — e.g. `"Please choose a client before publishing."`
  - `validationNoItems` — e.g. `"Add at least one item before publishing."`
  - `validationNoDueDate` — e.g. `"Set a due date before publishing."`

## Done when

- Invoice items table Rate column is wide enough to display `5,000,000 MMK` without wrapping.
- `Add % tax` button renders with a visible border (outline); `Add fee` button remains borderless.
- On a Paid (status=3) or Unpaid (status=2) invoice detail page, the Eye/Pencil toggle is absent.
- On an existing Draft invoice in edit mode, an "Update Draft" button is visible; clicking it persists the current working copy at status=1 and shows a success toast without switching to view mode.
- Clicking "Save as Unpaid/Paid" on a draft missing a client, items, or due date shows a toast per missing field and does not open the confirm modal.

## Touches

- `apps/open-myanmar-invoice/src/features/invoices/components/invoice-items.tsx`
- `apps/open-myanmar-invoice/src/features/invoices/components/invoice-summary.tsx`
- `apps/open-myanmar-invoice/src/features/invoices/components/builder-toolbar.tsx`
- `apps/open-myanmar-invoice/src/features/invoices/pages/invoice-builder-page.tsx`
- i18n/translation file (wherever `editOnlyDraft` is defined)
