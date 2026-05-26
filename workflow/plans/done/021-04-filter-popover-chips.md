# 021-04 — Filters popover + chips + empty-match

Plan: `021-root-invoice-filter-and-ux-fixes.md` · Blocked by: 03 · Parallel-safe with: 05, 06

## Goal

Add the "Filters" popover (created-date + due-date from/to ranges), removable active-filter chips with Clear-all, and the empty-match state — all wired to the store setters phase 03 added.

## Context

- UI, not unit-tested — verify by running. The one pure bit (`startOfDay`/`endOfDay`) gets a tiny co-located test (see `.claude/skills/tdd/SKILL.md`).
- **Store (from phase 03, already present):** `status`, `createdFrom/createdTo`, `dueFrom/dueTo` (epoch-ms day bounds), `setCreatedRange(from?, to?)`, `setDueRange(from?, to?)`, `clearFilters()`. This phase does NOT edit the store — only `invoice-list.tsx`, a new popover component, and the date-bounds lib.
- **Date math — extract to share:** `startOfDay`/`endOfDay` currently live in `src/features/reports/components/date-range-modal.tsx` (~lines 121–145). Move them to `src/lib/date-bounds.ts` and update `date-range-modal.tsx` to import them (confirm reports export still typechecks/runs). `startOfDay(d)` → `new Date(y,m,d,0,0,0,0).getTime()`; `endOfDay(d)` → `…23,59,59,999`.
- **Day-picker popover pattern:** reuse `date-range-modal.tsx`'s `RangeDayField` (~lines 65–119) — a labeled trigger button + an `absolute` panel holding `<DayPicker mode="single" …>`, closed on outside-click via a `wrapperRef` + `mousedown` listener (same pattern as `due-date-picker.tsx`). `dayPickerClassNames` is defined locally there; copying it into the new popover is acceptable (it's already duplicated across due-date-picker + date-range-modal) — or extract to a shared module if you prefer.
- **Filters button + popover anchor:** add a "Filters" button (`t.invoiceList.filters.button`) in the toolbar row next to the status pills; clicking opens an `absolute` popover (mirror `due-date-picker.tsx`'s wrapperRef/outside-click/`absolute right-0 z-50 mt-1 rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg`). Inside: two labeled sections — Created (`filters.createdRange`) and Due (`filters.dueRange`), each with From (`filters.from`) / To (`filters.to`) RangeDayField pickers, plus `filters.apply` (Done) and `filters.clear`.
- **Apply model:** hold local from/to `Date` state per range in the popover; on **Done**, call `setCreatedRange(startOfDay(from), endOfDay(to))` and `setDueRange(...)` (pass `undefined` for an unset side) then close — one fetch, page resets via the store. `filters.clear` resets the popover's local state.
- **Chips:** below the toolbar, render a removable chip for the created range and one for the due range when set — e.g. `t.invoiceList.filters.createdRange` + formatted bounds via `formatDate` (`src/features/invoices/lib/invoice-row.ts`). Each chip `×` clears that range (`setCreatedRange(undefined, undefined)` / `setDueRange(...)`). Show **Clear all** (`filters.clearAll`) whenever ANY filter is active (`status !== undefined || createdFrom || dueFrom || query`); it calls `clearFilters()` AND resets the component's local `search` state to `""`.
- **Empty-match:** when `initialized && !loading && rows.length === 0`: if any filter is active show `t.invoiceList.filters.noMatch` + a Clear-all action; else keep the existing empty/`noResults` copy. Reuse `src/components/common/empty-state.tsx` if it fits.
- **Tailwind v4:** consult the **`tailwind-docs-reader`** subagent before writing CSS; reuse the popover/picker classes verbatim from `due-date-picker.tsx` / `date-range-modal.tsx`.

## Steps

- [ ] Create `src/lib/date-bounds.ts` with `startOfDay`/`endOfDay`; **Red→Green** a small `date-bounds.test.ts` (start = 00:00:00.000, end = 23:59:59.999 of the same local day). Update `date-range-modal.tsx` to import from it (drop its local copies).
- [ ] Build `invoice-filters-popover.tsx`: Filters button + outside-click popover with Created (From/To) + Due (From/To) day pickers; Done applies via `setCreatedRange`/`setDueRange`; Clear resets local state.
- [ ] Wire the popover into the toolbar in `invoice-list.tsx` (next to the status pills).
- [ ] Render active-range chips + per-chip clear, and a Clear-all (calls `clearFilters()` + local `setSearch("")`) shown when any filter is active.
- [ ] Update the empty state to show `filters.noMatch` + Clear-all when filters are active.

## Done when

- Filters popover sets created/due ranges; the list narrows server-side (AND with status + search), page resets to 1.
- A due range excludes invoices with no due date (already enforced by phase 02 — confirm in the running app).
- Active ranges show as chips; each `×` clears just that range; Clear-all resets status + both ranges + search.
- Empty match shows the no-match copy + Clear-all.
- `bun test` green for `date-bounds`; reports export still works; typecheck clean.

## Touches

- `apps/open-myanmar-invoice/src/lib/date-bounds.ts` (new) + `date-bounds.test.ts` (new).
- `apps/open-myanmar-invoice/src/features/reports/components/date-range-modal.tsx` — import `startOfDay`/`endOfDay` from the new lib.
- `apps/open-myanmar-invoice/src/features/invoices/components/invoice-filters-popover.tsx` (new).
- `apps/open-myanmar-invoice/src/features/invoices/components/invoice-list.tsx` — Filters button + chips + Clear-all + empty-match.
