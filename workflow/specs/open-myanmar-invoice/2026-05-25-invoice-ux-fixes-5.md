# Spec — Invoice UX Fixes 5 (2026-05-25)

Five minor UX fixes + one major dashboard revamp for `apps/open-myanmar-invoice`.
Source: `workflow/ideas/open-myanmar-invoice/fix-ux-5.md`

## Goal

Polish the invoice builder and dashboard:

- Let users save changes to an existing draft without promoting it.
- Remove confusing view/edit toggle for locked (paid/unpaid) invoices.
- Guard the Draft → Paid/Unpaid transition with field validation.
- Visually distinguish the two tax-add actions.
- Widen the Rate column to fit large numbers.
- Replace the always-full-history dashboard with a time-scoped view (this month / 3 months / 6 months).

## Users / context

Myanmar-based business owners using the desktop app to manage invoices. English UI only (no Burmese copy additions in this iteration).

## Scope

**In:**

- "Update Draft" save button for existing-draft invoices (status=1, mode=existing).
- Hide View/Edit toggle for Unpaid (status=2) and Paid (status=3) invoice detail pages.
- Validate before Draft → Unpaid/Paid transition: block if clientId null, items empty, or dueDate null; show toast(s).
- `Add % tax` button: switch to `outline` variant. `Add fee` button: keep `ghost`.
- Rate column min-width: increase from `6rem` → `8rem` to fit `5,000,000 MMK` at 14px tabular-nums.
- Dashboard: add animated group-button switcher (This Month / 3 Months / 6 Months), default = This Month; scope all stats + recent-invoice list to selected period.
- Backend: add optional `fromDate` / `toDate` params to `dashboardStats()` RPC; same date filter applied to recent-invoice list query.

**Out (non-goals):**

- No new Burmese i18n strings in this batch.
- No offline / cache-first behaviour for dashboard period data.
- Dashboard client-count and product-count tiles remain all-time totals (not period-scoped).
- No animated count-up re-trigger on period switch (static render is fine).
- No deep-link / URL param for dashboard period selection.

## Requirements

- [ ] **Update Draft button** — In `builder-toolbar.tsx`, when `mode === "existing"` and `status === 1`, render an "Update" (or "Save Draft") button that calls the existing `invoiceApi.update()` with `status: 1`; on success show a toast and stay in edit mode.
- [ ] **Hide View/Edit toggle** — In `builder-toolbar.tsx` (or `invoice-builder-page.tsx`), render the Eye/Pencil segmented control only when `status === 1` (Draft). For status 2/3 always render the view-only layout; no toggle shown.
- [ ] **Transition validation** — Before opening `SaveConfirmModal` for a Draft → Unpaid/Paid save, validate: `clientId != null`, `items.length > 0`, `dueDate != null`. On failure, show one toast per failing rule (or a combined toast) and abort the modal open. No DB write on failure.
- [ ] **Tax button styles** — In `invoice-summary.tsx`, `Add % tax` button → `variant="outline"`. `Add fee` button → `variant="ghost"` (unchanged).
- [ ] **Rate column width** — In `invoice-items.tsx`, change the Rate column from `6rem` to `8rem` in the grid template string (`grid-cols-[...]`); apply to both the header row and item row templates.
- [ ] **Dashboard switcher** — In `dashboard-page.tsx` + `dashboard-store.ts`, add a `period: "month" | "3months" | "6months"` field (default `"month"`); group-button UI renders "This Month" / "3 Months" / "6 Months" labels.
- [ ] **Dashboard data scoping** — On period change, `dashboardStore.load(period)` derives `fromDate` (start of calendar period) and `toDate` (today); passes to `invoiceApi.dashboardStats({ fromDate, toDate })` and `invoiceApi.list({ ..., fromDate, toDate })`. Results replace stats + recent in store.
- [ ] **Backend RPC update** — `dashboardStats` handler in `invoice-handlers.ts` + `invoice-service.ts` accepts optional `fromDate`/`toDate` (epoch-ms); applies `WHERE createdDate BETWEEN fromDate AND toDate` (or `dueDate`—see Open questions) to invoice aggregation query.
- [ ] **Recent-invoice list scoping** — `invoice-service.ts` `list()` method gains optional date range param; dashboard uses it to scope the recent-invoice panel to the selected period.

## Constraints

- Electrobun + Drizzle ORM + SQLite — date filtering via integer epoch-ms comparisons.
- Zustand store pattern: dashboard store stays the single source of truth; no prop-drilling period state.
- Period button UI must feel snappy — no full-page spinner; show a subtle loading state on the stats/recent panels only.
- `Add % tax` outline button must use the existing `Button` component's `variant="outline"` (no custom CSS).
- No new tables or migrations needed for the dashboard change.

## Acceptance — done when

- Existing Draft invoice detail shows an "Update" button; clicking it persists changes and stays in Draft.
- Opening a Paid or Unpaid invoice shows no Eye/Pencil toggle; page renders in view-only layout directly.
- Attempting to promote a Draft invoice missing a client, items, or due date shows a toast and does not open the confirm modal.
- Invoice summary with edit mode shows `Add % tax` as an outlined button and `Add fee` as a ghost button.
- Rate column in invoice items table is wide enough to display `5,000,000 MMK` without overflow or wrapping.
- Dashboard loads "This Month" data by default; switching periods re-fetches and re-renders stats + recent invoices for that window; client/product counts do not change on period switch.

## Open questions

- **Date column for period filter**: filter by `createdDate` or `dueDate`? Recommend `createdDate` (reflects when the invoice was raised, not when payment was due). Confirm before backend implementation.
