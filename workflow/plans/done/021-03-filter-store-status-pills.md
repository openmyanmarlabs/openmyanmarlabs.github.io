# 021-03 — Filter store + status pills

Plan: `021-root-invoice-filter-and-ux-fixes.md` · Blocked by: 01, 02 · Parallel-safe with: 05, 06

## Goal

Add the full filter state to the list store (status + created + due ranges + clear-all, all wired into `fetch`), and render the always-visible status pill row (All/Draft/Unpaid/Paid) end-to-end. This phase lays all store plumbing so phase 04 is component-only.

## Context

- UI, not unit-tested — verify by running the app. (Store is plumbing for 04; keep it simple, no test phase.)
- **Store:** `src/features/invoices/stores/invoice-list-store.ts`. Today: `{ rows, total, page, query, currency, loading, initialized }`, `setQuery` (sets `query`, resets `page:1`, fetches), `setPage`, `fetch`, `refetch`. `fetch()` calls `invoiceApi.list({ limit, offset, query })` **twice** — the main call and the past-end **reflow guard** (after a delete). Both must pass the new filter params.
- **DTO mapping** (store field → `ListParamsDTO` from phase 02): `status → status`, `createdFrom → fromDate`, `createdTo → toDate`, `dueFrom → dueFromDate`, `dueTo → dueToDate`. Store dates as **epoch-ms day bounds** (start/end of day; phase 04 computes them) so they map straight to the DTO and format cleanly for chips.
- **Status pills pattern:** copy the reports period switcher — `src/features/reports/pages/reports-page.tsx` (~lines 113–151): `role="group"`, container `relative inline-grid grid-cols-4 rounded-full bg-neutral-100`, a sliding thumb `pointer-events-none absolute inset-y-0 left-0 w-1/4 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]` translated per active index (`translate-x-full`, `translate-x-[200%]`, `translate-x-[300%]`), buttons `relative z-10 … rounded-full px-3.5 py-1.5 text-[13px] font-medium`, active `text-neutral-900` vs inactive `text-neutral-400 hover:text-neutral-600`, `aria-pressed`. Light-only (no `dark:`).
- **Component:** `src/features/invoices/components/invoice-list.tsx` — holds the debounced `SearchInput` (local `search` state → `setQuery` after 250ms). Status segments: All=`undefined`, Draft=`1`, Unpaid=`2`, Paid=`3` (map index→`translate` for the thumb). Labels: `t.invoiceList.filters.statusAll`, then `t.invoiceList.status.{draft,unpaid,paid}`; group aria `t.invoiceList.filters.statusGroupLabel`.
- **Tailwind v4:** before writing CSS, consult the **`tailwind-docs-reader`** subagent for any non-trivial utility/arbitrary-value syntax; copy the period-switcher classes verbatim where possible.

## Steps

- [ ] Store: add state `status?: number`, `createdFrom?: number`, `createdTo?: number`, `dueFrom?: number`, `dueTo?: number`.
- [ ] Store: add setters — `setStatus(status?)`, `setCreatedRange(from?, to?)`, `setDueRange(from?, to?)`, `clearFilters()`. Each (and `clearFilters`) sets `page: 1` then `void get().fetch()`. `clearFilters` resets `status/createdFrom/createdTo/dueFrom/dueTo` to `undefined` AND `query: ""` (also resets search), `page: 1`, then fetch.
- [ ] Store `fetch()`: read the new fields via `get()` and pass them to `invoiceApi.list({ … status, fromDate: createdFrom, toDate: createdTo, dueFromDate: dueFrom, dueToDate: dueTo })` in **both** the main call and the reflow-guard call.
- [ ] Component: render the status pill row (4 segments) above the list, wired to `status` + `setStatus`; reuse the period-switcher markup/classes; correct thumb position per active status.
- [ ] Lay out a toolbar row holding the existing `SearchInput` + the status pills (Filters button + chips come in phase 04) — keep search debounce behavior intact.

## Done when

- Picking a status pill refetches server-side (AND with any active search), narrows the list, and resets to page 1; "All" clears the status filter.
- The active pill is highlighted (thumb tracks it); search still works + debounces.
- Store exposes `setStatus`/`setCreatedRange`/`setDueRange`/`clearFilters` and passes all filter params in both `fetch` list calls.
- Typecheck clean; app runs.

## Touches

- `apps/open-myanmar-invoice/src/features/invoices/stores/invoice-list-store.ts` — filter state + setters + `fetch` param wiring (both call sites).
- `apps/open-myanmar-invoice/src/features/invoices/components/invoice-list.tsx` — status pill row + toolbar layout.
