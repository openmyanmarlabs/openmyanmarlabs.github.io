# Plan 018 — Invoice UX Fixes 5

Source: `workflow/specs/2026-05-25-invoice-ux-fixes-5.md`

## Summary

Five minor builder UX fixes (Update Draft button, hide View/Edit toggle on locked invoices,
Draft→Paid/Unpaid validation, tax-button style distinction, Rate column width) plus a major
dashboard revamp: backend gains optional `fromDate`/`toDate` on stats + list queries; frontend
adds a period-switcher (This Month / 3 Months / 6 Months) that re-fetches scoped data.

Phase 01 (UI) and 02 (backend) are fully independent — run them in parallel. Phase 03
(dashboard frontend) waits on 02 for the updated RPC contract.

## Phases

| #   | Phase                          | File                                                | Blocked by | Parallel-safe with |
| --- | ------------------------------ | --------------------------------------------------- | ---------- | ------------------ |
| 01  | Builder UI fixes               | `plans/todo/018-01-builder-ui-fixes.md`             | —          | 02                 |
| 02  | Dashboard backend date scope   | `plans/todo/018-02-dashboard-backend-date-scope.md` | —          | 01                 |
| 03  | Dashboard period switcher (UI) | `plans/todo/018-03-dashboard-period-switcher.md`    | 02         | —                  |

## Notes / risks

- Open question from spec: filter by `createdDate` (recommended) or `dueDate`? Phase 02 uses
  `createdDate` — confirm before executing.
- The View/Edit toggle hide logic changes the toolbar API (`onUpdateDraft` prop added). Phase 01
  must update both `builder-toolbar.tsx` and `invoice-builder-page.tsx` atomically.
- Validation in `onSaveAs` runs before `setPendingStatus` — no modal opens, no DB write on failure.
  Keep this path cheap (pure wc reads, no RPC).
- Manual `verify`-skill step needed after all phases: relaunch the app, check draft update stays
  in edit mode, check period switcher re-fetches correctly, check paid invoice shows no toggle.
