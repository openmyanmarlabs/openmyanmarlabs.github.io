# 017-04 — Date picker + due date fix

Plan: `017-root-invoice-ux-fixes-4.md` · Blocked by: 03 · Parallel-safe with: 05

## Goal

Replace native `<input type="date">` with a react-day-picker v9 calendar popover; fix due date not appearing in view mode for Draft/Unpaid/Paid invoices.

## Context

- App root: `apps/open-myanmar-invoice/`
- **`src/features/invoices/components/invoice-document.tsx` lines 146–159** — current due date block: read-only span (`formatDate(wc.dueDate)` or `b.noDueDate`) + edit native `<input type="date">`. Replace the input only; keep the read-only span (the bug fix makes it work).
- **`src/features/invoices/lib/working-copy.ts` — `fromDetail()`** — hydrates `WorkingCopy` from `InvoiceDetailDTO`. Maps `detail.dueDate` directly (line 323). `InvoiceDetailDTO = InvoiceRow & { items; taxes }` so the field shape depends on `InvoiceRow`.
- **`src/bun/db/schema.ts` line 84** — `dueDate: integer("due_date")` — Drizzle maps `due_date` → `dueDate` correctly. Field name is NOT the bug.
- **Actual bug to investigate**: `integer("due_date")` without `.notNull()` — SQLite returns `null` for missing rows and Drizzle may return `undefined` instead of `null` for nullable integer columns on older records. Check whether `detail.dueDate` arrives as `undefined` (falsy in the `wc.dueDate ?` guard) rather than an epoch number. If so, coerce: `dueDate: detail.dueDate ?? null` in `fromDetail()`.
- **`src/features/invoices/stores/builder-store.ts` — `initExisting()`** — calls `fromDetail(detail)`, stores result as `workingCopy`. No mapping here; fix lives in `fromDetail` or the service layer.
- **`src/bun/services/invoice-service.ts` — `buildHeader()`** — writes `dueDate: input.dueDate` to DB. Confirmed correct.
- **`src/lib/rpc.ts`** — `invoiceApi.get(id)` calls `bun().getInvoice({ id })` → `service.getDetail(id)` → `invoiceRepo.getDetail(id)`. Full chain confirmed; no intermediate mapping gap.
- **Phase 03 (color picker)** already ran `bun add react-colorful`; package.json/bun.lockb updated. Run `bun add react-day-picker date-fns` after phase 03 finishes — do not run concurrently.
- Stack: React 18, Tailwind v4, light-only (no dark mode), `@remixicon/react`.
- Existing `headerInput` class string defined in `invoice-document.tsx` — match the trigger button style to it.
- `row-menu.tsx` and `export-dropdown.tsx` (phase 016-05) — patterns for outside-click (`useRef` + `mousedown`), portal, and fixed positioning. The date picker popover can use a simpler `absolute` approach (inside a `relative` container) since it's inline in the document flow, not a table row.

## Steps

- [ ] `cd apps/open-myanmar-invoice && bun add react-day-picker date-fns`
- [ ] **Trace the due date bug**: open `src/features/invoices/lib/working-copy.ts` `fromDetail()`. Check `detail.dueDate` — if the Drizzle row can arrive as `undefined` for nullable integer columns, the existing `wc.dueDate ? formatDate(...)` guard silently shows "No due date". Add explicit coercion: `dueDate: detail.dueDate ?? null`. Verify the same pattern in `src/bun/services/invoice-service.ts` `buildHeader()` — ensure `dueDate` is written as `null` not `undefined` when absent (already looks correct but confirm).
- [ ] **Create `src/features/invoices/components/due-date-picker.tsx`**
  - Props: `{ value: number | null; onChange: (epochMs: number | null) => void }`
  - Internal state: `open: boolean`
  - Trigger `<button>` styled to match `headerInput` from `invoice-document.tsx`; shows `formatDate(value)` when set, otherwise placeholder `"ရက်စွဲ ရွေးချယ်ပါ"`.
  - Wrapper `<div className="relative">` containing trigger + popover.
  - Popover `<div className="absolute z-50 mt-1 shadow-lg rounded-2xl border border-neutral-200 bg-white p-3">` — shown when `open`.
  - `DayPicker` from `"react-day-picker"`, `mode="single"`, `selected={value ? new Date(value) : undefined}`, `onSelect={(d) => { props.onChange(d ? d.getTime() : null); setOpen(false); }}`.
  - Tailwind `classNames` prop (do NOT import `"react-day-picker/style.css"`):
    ```ts
    {
      root: "w-fit",
      month: "flex flex-col gap-4",
      month_caption: "flex justify-center items-center font-semibold text-sm py-1",
      nav: "flex items-center justify-between",
      button_previous: "p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600",
      button_next: "p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600",
      weeks: "flex flex-col gap-1",
      weekdays: "flex",
      weekday: "w-9 text-center text-xs text-neutral-400 font-medium",
      week: "flex gap-0",
      day: "p-0",
      day_button: "w-9 h-9 rounded-lg text-sm hover:bg-neutral-100 transition-colors",
      selected: "bg-brand-500 text-white hover:bg-brand-600",
      today: "font-bold text-brand-500",
      outside: "text-neutral-300",
      disabled: "opacity-30 cursor-not-allowed",
    }
    ```
  - Popover footer: `<button>` "Clear" — calls `props.onChange(null)` then `setOpen(false)`.
  - Outside-click close: `useRef` on the wrapper div; `useEffect` adds `mousedown` listener on `document` → if `!ref.current.contains(e.target)` → `setOpen(false)`. Return cleanup.
- [ ] **Edit `src/features/invoices/components/invoice-document.tsx`**
  - Import `DueDatePicker` from `./due-date-picker`.
  - Lines 150–159: remove `<input type="date" …>` block; replace with `<DueDatePicker value={wc.dueDate} onChange={props.onSetDueDate} />`.
  - Lines 146–149 (read-only span): no change — bug fix from `fromDetail()` makes `wc.dueDate` populate correctly.
- [ ] **TypeScript check**: `cd apps/open-myanmar-invoice && bunx tsc --noEmit`. Fix any prop-type errors.

## Done when

- `<input type="date">` removed from `invoice-document.tsx`
- Calendar popover opens on trigger click in edit (Draft) mode; `DayPicker` renders with Tailwind styling — no default CSS imported
- Selecting a date closes the popover and updates `wc.dueDate` (epoch ms); clearing sets it to `null`
- Read-only view (Draft viewed, Unpaid, Paid) shows the formatted date string when `dueDate` was set — no longer shows "No due date" incorrectly
- Outside click closes the popover
- TypeScript compiles clean

## Touches

- `apps/open-myanmar-invoice/src/features/invoices/components/due-date-picker.tsx` — new component
- `apps/open-myanmar-invoice/src/features/invoices/components/invoice-document.tsx` — swap native input for `DueDatePicker`
- `apps/open-myanmar-invoice/src/features/invoices/lib/working-copy.ts` — `fromDetail()`: coerce `detail.dueDate ?? null` if undefined arrives from Drizzle nullable column
- `apps/open-myanmar-invoice/package.json` + `bun.lockb` — add `react-day-picker`, `date-fns`
