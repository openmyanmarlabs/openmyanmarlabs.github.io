# 016-05 — Toolbar revamp — edit/view mode + export dropdown

Plan: `016-root-invoice-ux-fixes-3.md` · Blocked by: — · Parallel-safe with: 01, 02, 03, 04

## Goal

Replace the text-based View/Edit toggle with a segmented icon-button pair; consolidate the two export buttons into a single in-toolbar Export dropdown; remove the separate export row below the toolbar.

## Context

- App root: `apps/open-myanmar-invoice/`
- **`src/features/invoices/components/builder-toolbar.tsx`** — current left cluster: Back + text toggle (`b.edit`/`b.view`) + Design button; right cluster: save buttons. Toggle is a plain secondary `<Button>` — mode not self-evident at a glance.
- **`src/features/invoices/components/export-buttons.tsx`** — two separate "Export PDF" / "Export Image" `<Button>` elements in a standalone component. Keep the file; only remove its import from the builder page.
- **`src/features/invoices/pages/invoice-builder-page.tsx`** — renders `<BuilderToolbar>` then a separate `<div className="mb-6 flex items-center justify-end">` containing `<ExportButtons>`. The `exporting` state + `runExport` function live here.
- **`src/components/common/row-menu.tsx`** — portal pattern to follow: `createPortal` to `document.body`, `position: fixed` coords from `getBoundingClientRect()`, `useRef` for trigger + menu, `useEffect` mousedown/keydown/scroll/resize close handlers. Mirror this exactly for `ExportDropdown`.
- Stack: React, Tailwind v4, `@remixicon/react`. No dark mode (light-only).
- Available icons: `RiEditLine`, `RiEyeLine`, `RiDownloadLine`, `RiArrowDropDownLine`, `RiPaletteLine`.
- Active segmented button style: `bg-brand-500 text-white`; inactive: ghost/neutral.
- Segmented pair only rendered when `mode === "existing"` (same condition as the existing text toggle).
- Design button (`RiPaletteLine`) shown only when `!isViewMode` — keep this rule.

## Steps

- [ ] **Create `src/features/invoices/components/export-dropdown.tsx`**
  - Props: `{ exporting: boolean; onExportPdf: () => void; onExportImage: () => void }`
  - Trigger button: "Export" label + `<RiDownloadLine>` icon + `<RiArrowDropDownLine>` (or similar chevron). While `exporting`: show "Exporting…" and disable.
  - `useRef` for trigger wrapper + menu div (same dual-ref pattern as `row-menu.tsx`).
  - On trigger click: measure `getBoundingClientRect()` → store `{ top, right }` coords → `setOpen(true)`.
  - `useEffect` (runs when `open`): add `mousedown` (outside-click), `keydown` (Escape), `scroll` (capture-phase), `resize` listeners — all call `setOpen(false)`. Return cleanup. Mirror `row-menu.tsx` exactly.
  - Portal via `createPortal(…, document.body)` with `position: fixed` + stored coords.
  - Menu items (three):
    1. "Export PDF" — enabled when `!exporting`; calls `onExportPdf` then `setOpen(false)`.
    2. "Export Image" — enabled when `!exporting`; calls `onExportImage` then `setOpen(false)`.
    3. "Export Excel" — always `disabled`; label "Export Excel (Coming soon)"; distinct muted style.
  - No i18n strings required beyond what the caller passes — keep labels inline for now (or use existing `t.invoices.builder.export` keys if they exist; check `useT()` shape before deciding).

- [ ] **Update `src/features/invoices/components/builder-toolbar.tsx`**
  - Add props: `exporting: boolean`, `onExportPdf: () => void`, `onExportImage: () => void`.
  - Replace the text View/Edit `<Button>` with a segmented icon-button pair:
    - Outer wrapper: `inline-flex items-center rounded-lg border border-neutral-200 overflow-hidden` (pill container).
    - View button (`<RiEyeLine>`): active when `isViewMode` → `bg-brand-500 text-white`; inactive → `text-neutral-500 hover:bg-neutral-100`.
    - Edit button (`<RiEditLine>`): active when `!isViewMode` → `bg-brand-500 text-white`; inactive → `text-neutral-500 hover:bg-neutral-100`.
    - Both call `onToggleView`; both have `type="button"` and `aria-label`.
    - Pair still only rendered when `!isNew` (same condition as the old text toggle).
  - Design button: replace text label with `<RiPaletteLine>` icon (keep existing `onClick={onOpenDesign}` and visibility rule `!isViewMode`).
  - Right cluster: render `<ExportDropdown>` before the save buttons (inside the `!isPaid` guard or outside — export is status-agnostic, so render it unconditionally alongside the save section; check whether it makes sense to always show or only when `!isPaid`; prefer always-visible since export is a read action).
  - Import `ExportDropdown` from `./export-dropdown`.

- [ ] **Update `src/features/invoices/pages/invoice-builder-page.tsx`**
  - Pass `exporting`, `onExportPdf={() => void runExport("pdf")}`, `onExportImage={() => void runExport("image")}` to `<BuilderToolbar>`.
  - Remove the `<div className="mb-6 flex items-center justify-end">` block (and `<ExportButtons>` inside it).
  - Remove the `ExportButtons` import line. Leave `export-buttons.tsx` file untouched.

- [ ] **Verify TypeScript compiles clean** — `cd apps/open-myanmar-invoice && bunx tsc --noEmit` (or equivalent). Fix any prop-type mismatches.

## Done when

- Segmented `<RiEyeLine>` / `<RiEditLine>` icon-button pair visible in the toolbar for existing invoices; active mode button has brand-filled styling — mode self-evident without tooltip or label.
- Single "Export" button in the sticky toolbar opens a dropdown with: Export PDF (enabled), Export Image (enabled), Export Excel (disabled, "Coming soon").
- While `exporting === true`: Export button shows "Exporting…"; all dropdown items disabled.
- The standalone `<div className="mb-6 …">` export row is gone from `invoice-builder-page.tsx`.
- `ExportButtons` file untouched; its import removed from builder page.
- TypeScript compiles without errors.
- App runs: toolbar layout correct, dropdown opens/closes, exports still fire.

## Touches

- `apps/open-myanmar-invoice/src/features/invoices/components/export-dropdown.tsx` — new file
- `apps/open-myanmar-invoice/src/features/invoices/components/builder-toolbar.tsx` — add export props; segmented toggle; integrate `ExportDropdown`
- `apps/open-myanmar-invoice/src/features/invoices/pages/invoice-builder-page.tsx` — wire export props to toolbar; remove export row + `ExportButtons` import
- `apps/open-myanmar-invoice/src/features/invoices/components/export-buttons.tsx` — no changes (import removed upstream, file kept)
