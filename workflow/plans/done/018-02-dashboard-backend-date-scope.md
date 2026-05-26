# 018-02 — Dashboard backend date scope

Plan: `018-root-invoice-ux-fixes-5.md` · Blocked by: — · Parallel-safe with: 01

## Goal

Add optional `fromDate`/`toDate` params (epoch-ms) to `dashboardStats` and `listInvoices` RPC
calls so the frontend can fetch time-scoped stats and recent invoices.

## Context

Pure backend change — no renderer files touched. The stack is:
`shared/types.ts` (RPC contract) → `invoice-handlers.ts` (handler map) → `invoice-service.ts`
(business logic) → `invoice-repository.ts` (Drizzle SQL) → SQLite.

Existing patterns to follow:

- `invoice-repository.ts` — `dashboardStats()` uses a single aggregate SELECT with Drizzle
  `sql<number>` helpers; `list()` builds a WHERE clause with `like()` and `desc()`. Import
  `and`, `gte`, `lte` from `drizzle-orm` for date range filtering.
- `pagination.ts` — `ListParams` lives here; extend it (not a new type) so service + repo
  stay on one shape.
- All testable logic is pure DI: `createInvoiceRepository(db)` / `createInvoiceService(deps)`.
  Tests use in-memory SQLite — do NOT import `migrate.ts` (it boots the Electrobun runtime).
  Follow `.claude/skills/tdd/SKILL.md` for the red→green loop and test file co-location.
  The L1 backend-e2e gate tests the assembled handler→service→repo→SQLite path;
  follow `.claude/skills/backend-e2e/SKILL.md` for that setup.

Date column: **`createdDate`** (epoch-ms integer). Filter applies as:
`createdDate >= fromDate AND createdDate <= toDate` when either bound is provided.

## Steps

- [ ] **`pagination.ts`** — Add optional fields to `ListParams`:

  ```ts
  fromDate?: number;
  toDate?: number;
  ```

- [ ] **`shared/types.ts`** — Add new DTO and update RPC contract:

  ```ts
  export type DashboardParamsDTO = { fromDate?: number; toDate?: number };
  ```

  Change `dashboardStats` request params from `{}` to `DashboardParamsDTO`.
  Add `fromDate?: number; toDate?: number` to `ListParamsDTO` to match the extended `ListParams`.

- [ ] **`invoice-repository.ts`** — Update two methods:
  1. `dashboardStats(opts?: { fromDate?: number; toDate?: number })`:
     - Build an optional WHERE clause using `and(gte(invoices.createdDate, opts.fromDate), lte(invoices.createdDate, opts.toDate))` (guard each bound to only add when defined).
     - Apply the clause to the aggregate SELECT's `.where()`.
  2. `list({ limit, offset, query, fromDate, toDate })`:
     - Combine the existing `query` filter with a date range filter using `and(...)`.
     - Apply to both the rows SELECT and the count SELECT.

- [ ] **`invoice-service.ts`** — Thread date params through:
  - `dashboard(opts?: { fromDate?: number; toDate?: number })`: pass `opts` to `invoiceRepo.dashboardStats(opts)`.
  - `list(params: ListParams)`: no code change needed — `params` already carries the new optional fields and the repo reads them.

- [ ] **`invoice-handlers.ts`** — Update handler signatures:
  - `dashboardStats: (params: DashboardParamsDTO) => service.dashboard(params)`
  - `listInvoices` already forwards `params` to `service.list(params)` — no change needed beyond the type update in `shared/types.ts`.

- [ ] **Tests (TDD, red→green)** — Co-locate test files next to the modules they cover.
      Follow `.claude/skills/tdd/SKILL.md`. Use in-memory SQLite (no migrate.ts).

  Behaviors to drive green for `invoice-repository`:
  - `dashboardStats()` with no opts returns all-time totals.
  - `dashboardStats({ fromDate, toDate })` counts only invoices whose `createdDate` is within the range.
  - `list({ fromDate, toDate })` returns only invoices within the range.
  - `list({ query, fromDate, toDate })` applies both filters simultaneously.

  Behaviors to drive green for the L1 backend-e2e gate (handler→service→repo→SQLite):
  - `dashboardStats({ fromDate, toDate })` end-to-end returns correctly scoped counts.
  - Follow `.claude/skills/backend-e2e/SKILL.md` for the assembled-stack test setup.

## Done when

- `dashboardStats` and `listInvoices` RPC handlers accept `fromDate`/`toDate` params.
- Repository filters by `createdDate` range when bounds are supplied; omitting them returns all rows (existing behaviour unchanged).
- All new unit behaviors are green (`bun test`).
- L1 backend-e2e gate passes for the date-scoped `dashboardStats` path.
- Existing tests (if any) continue to pass.

## Touches

- `apps/open-myanmar-invoice/src/bun/repositories/pagination.ts`
- `apps/open-myanmar-invoice/src/shared/types.ts`
- `apps/open-myanmar-invoice/src/bun/repositories/invoice-repository.ts`
- `apps/open-myanmar-invoice/src/bun/repositories/invoice-repository.test.ts` (new)
- `apps/open-myanmar-invoice/src/bun/services/invoice-service.ts`
- `apps/open-myanmar-invoice/src/bun/rpc/invoice-handlers.ts`
- `apps/open-myanmar-invoice/src/bun/rpc/invoice-handlers.test.ts` (new, L1 gate)
