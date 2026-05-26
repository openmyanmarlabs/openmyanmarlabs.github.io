# Plan 021 — Invoice Advanced Filter + UX Fixes

Source: `workflow/specs/2026-05-26-invoice-advanced-filter-and-ux-fixes.md`
App: `apps/open-myanmar-invoice` (Electrobun, React 19 renderer, bun main, SQLite/Drizzle; bilingual EN/MY, offline, light-only).

## Summary

Server-side invoice-list filtering (status pill row + created/due date ranges, alongside the existing invoice-no search) plus three smaller fixes: softer Burmese cancel wording, draft-first builder button gating, and a new bilingual About page. Backend is mostly there already (`fromDate`/`toDate` on `createdDate` exist) — net-new is `status` + due-range in the repo where-clause, the store/UI filter surface, and the About feature. All filters AND together, server-side, page resets to 1, store-only (reset on restart).

## Phases

| #   | Phase                               | File                                             | Blocked by | Parallel-safe with |
| --- | ----------------------------------- | ------------------------------------------------ | ---------- | ------------------ |
| 01  | i18n copy (cancel swap + new keys)  | `plans/todo/021-01-i18n-copy.md`                 | —          | 02, 05             |
| 02  | Filter backend (DTO + repo + tests) | `plans/todo/021-02-filter-backend.md`            | —          | 01, 05             |
| 03  | Filter store + status pills         | `plans/todo/021-03-filter-store-status-pills.md` | 01, 02     | 05, 06             |
| 04  | Filters popover + chips + empty     | `plans/todo/021-04-filter-popover-chips.md`      | 03         | 05, 06             |
| 05  | Builder draft gating                | `plans/todo/021-05-builder-draft-gating.md`      | —          | 01, 02, 03, 04, 06 |
| 06  | About page                          | `plans/todo/021-06-about-page.md`                | 01         | 02, 03, 04, 05     |

**Execution waves:** Wave 1 = `01 ∥ 02 ∥ 05`. Wave 2 = `03 ∥ 06` (after 01+02 for 03; after 01 for 06). Wave 3 = `04` (after 03). Critical path: `(01|02) → 03 → 04`.

## Notes / risks

- **content.ts symmetry (Phase 01):** `Content = typeof my`; `en` is typed `Content`. Any added key must land in BOTH `my` (lines 14–419) and `en` (428–827) trees or typecheck breaks. This is the safety net for key-drift between the i18n phase and the consuming UI phases (03/04/06) — a renamed key fails compilation.
- **Burmese substring trap (Phase 01):** the cancel string `ပယ်ဖျက်မည်` _contains_ the delete string `ဖျက်မည်`. Replace the full cancel string only (`ပယ်ဖျက်မည်` → `မလုပ်တော့ပါ`); never replace bare `ဖျက်မည်`.
- **Null-due exclusion (Phase 02):** SQL `due_date >= x` / `<= x` excludes NULL rows automatically (NULL comparisons aren't true) — so a due-range filter naturally drops invoices with no due date. Pin it with a test, don't add explicit `IS NOT NULL`.
- **Page-reset in two places (Phase 03):** the store `fetch()` calls `invoiceApi.list(...)` twice (main + the past-end reflow guard). Every new filter param must be passed in BOTH call sites, and every filter setter must reset `page: 1`.
- **date-bounds extraction (Phase 04):** moving `startOfDay`/`endOfDay` to `src/lib/date-bounds.ts` edits the reports `date-range-modal.tsx` import — confirm reports export still typechecks + runs.
- **Builder gating must not regress (Phase 05):** new / unpaid / paid flows stay as-is; only the existing-draft (status 1) case splits by `isViewMode`. The five cases are enumerated in the phase's Done-when.
- **App-version source (resolves spec open Q):** reuse the existing `updateApi.getUpdateContext()` RPC (`{ version, platform }`) — already renderer-callable, no new RPC needed.
- **Check-for-updates UX (resolves spec open Q):** inline status text on the About page via the existing `useUpdateStore().check()`; the actual install stays in the existing banner flow (About only links out via `openExternal`).
- **Manual GUI acceptance** (not automatable — run via the `verify` skill after build):
  - List: status pills filter live; Filters popover narrows by created/due range; chips appear + clear individually; Clear-all resets everything; page returns to 1 on any change; empty-match shows the no-match state + Clear-all.
  - A due-range filter excludes invoices with no due date.
  - Burmese cancel buttons read `မလုပ်တော့ပါ`; delete buttons still read `ဖျက်မည်`.
  - Existing draft: edit shows only **Update Draft**; saving drops to view mode where **Change to Unpaid/Paid** appear. A new invoice still offers Save as Draft / Unpaid / Paid.
  - `/about` reachable from the sidebar; all four links open in the system browser; version line shows the running version; Check-for-updates runs; EN/MY toggle works.
- Nothing is executed yet — phases sit in `plans/todo/`; move each to `plans/done/` as it ships.
