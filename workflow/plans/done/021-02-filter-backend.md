# 021-02 — Filter backend (DTO + repo + tests)

Plan: `021-root-invoice-filter-and-ux-fixes.md` · Blocked by: — · Parallel-safe with: 01, 05

## Goal

Extend the list params + repo where-clause so the list can filter by `status` and a due-date range server-side (created range already works), all AND-combined, with the count reflecting the same filters. Test-first.

## Context

- This is testable main-process logic → follow **`.claude/skills/tdd/SKILL.md`** (red→green→refactor, one behavior at a time, `bun test`, co-located `*.test.ts`, in-memory SQLite + DI; do NOT import `migrate.ts` in tests). The assembled-stack check follows **`.claude/skills/backend-e2e/SKILL.md`**.
- **Two param types, identical shape, both need the new fields:**
  - `ListParamsDTO` — `src/shared/types.ts` (~lines 68–76): currently `{ limit; offset; query?; fromDate?; toDate? }`.
  - `ListParams` — `src/bun/repositories/pagination.ts` (~lines 4–10): same shape, used by repo/service.
  - Add to BOTH: `status?: number; dueFromDate?: number; dueToDate?: number;` (`fromDate`/`toDate` already = created range).
- **Repo `list()`** — `src/bun/repositories/invoice-repository.ts` (~lines 102–133). Today it builds `queryFilter` (LIKE on `invoiceNo`) + `dateFilter` (`gte`/`lte` on `createdDate`) and `and()`s them for both the rows query and the count. Add `statusFilter` (`eq(invoices.status, status)`) and `dueFilter` (`gte`/`lte` on `invoices.dueDate`). Ensure `eq` is imported from `drizzle-orm` (other ops `and, gte, lte, like, desc, sql` already are).
- Schema (`src/bun/db/schema.ts`): `invoices.status` integer (1 Draft/2 Unpaid/3 Paid), `invoices.createdDate` integer notNull, `invoices.dueDate` integer **nullable**.
- **Null-due rows:** `gte`/`lte` on `dueDate` excludes NULLs by SQL semantics — no explicit `IS NOT NULL` needed; cover it with a test.
- Service (`invoice-service.ts` ~255) + handler (`invoice-handlers.ts` `listInvoices` ~line 24) + renderer client (`src/lib/rpc.ts` `invoiceApi.list` ~87) just pass the params object through — they need **no change** once both types carry the fields (structural typing flows it).
- Existing tests to extend: `src/bun/repositories/invoice-repository.test.ts` (has `list({ fromDate, toDate })` + combined tests around lines 278–322; `createTestDb()` + `createInvoiceRepository(db)` + `sample()` header fixture with `status`, `createdDate`, `dueDate`). Handler stack test: `src/bun/rpc/invoice-handlers.test.ts` (`createInvoiceHandlers(createInvoiceService({ invoiceRepo, clientRepo, companyRepo }))`).

## Steps

- [ ] Add `status?`, `dueFromDate?`, `dueToDate?` to `ListParams` (`pagination.ts`) and `ListParamsDTO` (`shared/types.ts`).
- [ ] **Red:** in `invoice-repository.test.ts`, add a test: `list({ status: 1 })` returns only draft rows (seed mixed statuses). Run `bun test` → fails.
- [ ] **Green:** add `statusFilter = status !== undefined ? eq(invoices.status, status) : undefined` and include it in the `and(...)` for rows + count.
- [ ] **Red→Green:** test `list({ dueFromDate, dueToDate })` returns only rows whose `dueDate` is in range; implement `dueFilter = and(dueFromDate !== undefined ? gte(invoices.dueDate, dueFromDate) : undefined, dueToDate !== undefined ? lte(invoices.dueDate, dueToDate) : undefined)`; add to the `and(...)`.
- [ ] **Red→Green:** test that a row with `dueDate: null` is excluded when `dueFromDate`/`dueToDate` is set (and included when no due filter). Should pass with the gte/lte already in place — assert it.
- [ ] **Red→Green:** test combined `list({ status, fromDate, toDate, dueFromDate, dueToDate, query })` — only the row matching ALL narrows through; `total` matches.
- [ ] **L1 stack test** (`invoice-handlers.test.ts`): seed mixed invoices, call `rpc.listInvoices({ limit, offset, status })` (and a due-range variant) → assert the filtered rows + total come back through handler→service→repo→SQLite (proves the DTO fields flow without service/handler edits).
- [ ] Refactor the where-clause for readability if needed; keep all tests green.

## Done when

- `bun test` green, including: status filter, due range, null-due excluded under a due filter (and included without), and the combined all-filters case — at the repo level and via the `listInvoices` handler.
- `ListParams` + `ListParamsDTO` both carry `status?`, `dueFromDate?`, `dueToDate?`.
- Typecheck clean; existing list/search/created-range tests still pass.

## Touches

- `apps/open-myanmar-invoice/src/shared/types.ts` — extend `ListParamsDTO`.
- `apps/open-myanmar-invoice/src/bun/repositories/pagination.ts` — extend `ListParams`.
- `apps/open-myanmar-invoice/src/bun/repositories/invoice-repository.ts` — `statusFilter` + `dueFilter` in `list()` (rows + count); import `eq`.
- `apps/open-myanmar-invoice/src/bun/repositories/invoice-repository.test.ts` — new filter tests.
- `apps/open-myanmar-invoice/src/bun/rpc/invoice-handlers.test.ts` — L1 status/due pass-through test.
