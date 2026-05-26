# 021-05 — Builder draft gating

Plan: `021-root-invoice-filter-and-ux-fixes.md` · Blocked by: — · Parallel-safe with: 01, 02, 03, 04, 06

## Goal

For an EXISTING DRAFT invoice (status 1), gate the save buttons on `isViewMode`: edit mode shows only **Update Draft**; view mode shows **Change to Unpaid/Paid**. Update Draft drops back to view mode on save. New / unpaid / paid flows unchanged.

## Context

- UI logic, not unit-tested — verify by running. Uses only existing i18n keys (`b.updateDraft`, `b.updateAsUnpaid`, `b.updateAsPaid`, `b.saveAsDraft`, …) — independent of phase 01.
- **Toolbar:** `src/features/invoices/components/builder-toolbar.tsx`. Props include `mode: "new"|"existing"`, `status`, `isViewMode`, `onSaveAs(status)`, `onUpdateDraft`. Today: `isNew = mode === "new"`, `isPaid = status === 3` (whole save side hidden when paid). View/Edit toggle renders when `!isNew && status === 1`. Current button conditions: Update Draft = `!isNew && status === 1`; Unpaid = `status !== 2`; Paid = always (within `!isPaid`).
- **Target gating** — introduce `const canChangeStatus = isNew || isViewMode;` then:
  - **Save as Draft:** `isNew` (unchanged).
  - **Update Draft:** `!isNew && status === 1 && !isViewMode`.
  - **Change/Save Unpaid:** `status !== 2 && canChangeStatus`.
  - **Change/Save Paid:** `canChangeStatus`.
  - View/Edit toggle: `!isNew && status === 1` (unchanged). Design (palette) button gating unchanged.
- **Why it's correct (5 cases):**
  - New (isNew, status 1, edit): Save as Draft + Unpaid + Paid. ✓
  - Existing draft EDIT (¬isNew, status 1, ¬view): Update Draft only. ✓
  - Existing draft VIEW (¬isNew, status 1, view): Unpaid + Paid (no Update Draft). ✓
  - Existing UNPAID (status 2, view): Paid only ("Update as Paid") — `status!==2` hides Unpaid, `canChangeStatus` true via view. ✓ (no regression)
  - Existing PAID (status 3): whole bar hidden via `isPaid`. ✓
- **Flip to view on save:** `src/features/invoices/pages/invoice-builder-page.tsx` — `onUpdateDraft` (~lines 173–186) currently does NOT change view mode. Add `store.setViewMode(true)` (or `useBuilderStore.getState().setViewMode(true)`) in the success path after `toast.success(b.saved)`, mirroring `onConfirmSave` which already calls `store.setStatus(...)` + `store.setViewMode(true)` (~line 204). `setViewMode` exists on the builder store (`builder-store.ts` ~line 132).

## Steps

- [ ] In `builder-toolbar.tsx`, add `canChangeStatus = isNew || isViewMode` and rewrite the three save-button conditions per the target gating above; gate Update Draft on `!isViewMode`.
- [ ] In `invoice-builder-page.tsx` `onUpdateDraft`, after a successful update + `toast.success`, call `setViewMode(true)`.
- [ ] Sanity-check the toggle + design button conditions are untouched.

## Done when

- Existing draft: edit mode shows only Update Draft (no Unpaid/Paid); view mode shows Unpaid + Paid (no Update Draft); saving Update Draft returns to view mode.
- New invoice still offers Save as Draft / Unpaid / Paid; existing unpaid still offers Update as Paid; paid still hides the save bar.
- Typecheck clean; app runs; all five cases above behave as listed.

## Touches

- `apps/open-myanmar-invoice/src/features/invoices/components/builder-toolbar.tsx` — `canChangeStatus` + button gating.
- `apps/open-myanmar-invoice/src/features/invoices/pages/invoice-builder-page.tsx` — `onUpdateDraft` flips to view mode on save.
