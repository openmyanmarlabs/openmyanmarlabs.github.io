# 015-01 — Newest-first data layer

Plan: `015-root-invoice-ux-fixes-2.md` · Blocked by: — · Parallel-safe with: 02, 03, 04

## Goal

Clients + products list (and search) newest-first via a new `created_at` column: repo stamps
on create; the migration adds the column + backfills existing rows in insertion order on upgrade.

## Context

- **TDD phase.** Read `.claude/skills/tdd/SKILL.md` first (in-memory SQLite + DI; co-located
  `*.test.ts`; `bun test`; do NOT import `db/migrate.ts` — it boots the Electrobun runtime).
  Also `.claude/skills/backend-e2e/SKILL.md` for the L1 gate (extend `src/bun/app.e2e.test.ts`).
- **Convention to mirror:** `invoices.createdDate` (`schema.ts:84`) — an epoch-ms integer:

  ```ts
  createdDate: integer("created_date").notNull().default(sql`(unixepoch() * 1000)`),
  ```

- **SQLite ADD COLUMN rule:** `ALTER TABLE … ADD COLUMN` forbids a non-constant default.
  `drizzle-kit generate` will emit `DEFAULT (unixepoch()*1000)` → runtime `migrate()` throws.
  Hand-edit the generated SQL: add with a constant default, then backfill by `rowid`. These
  tables have a TEXT primary key `id`, so SQLite keeps an implicit integer `rowid` (accessible
  in SQL) — `rowid` is monotonic with insertion, so `created_at DESC` reverses today's order.
- **Repo stamps explicitly** (the ALTER-added column's default is a constant `0`, not usable
  for new rows): stamp `input.createdAt ?? Date.now()`. Keep `ClientCreate = Omit<NewClientRow,
"id">` (createdAt optional via `$inferInsert`) so tests can inject an explicit `createdAt`
  for deterministic ordering.
- **Ordering + tiebreak:** order `created_at DESC, rowid DESC`. The rowid tiebreak is
  load-bearing for tests — rows created in a tight loop collide on the same `Date.now()` ms.
- **DTO surgery (`src/shared/types.ts`):** `created_at` is `.notNull()` → `$inferSelect`
  (`ClientRow`/`ProductRow`) now requires it → `ClientCreateDTO = Omit<ClientRow, "id">` would
  force the renderer to send `createdAt`. Change create + patch DTOs to exclude it (e.g.
  `Omit<ClientRow, "id" | "createdAt">`, and the product `Partial<Omit<…, "id" | "createdAt">>`).
  Handlers/services just forward these — `typecheck` confirms nothing else breaks.
- **Pickers inherit it:** `ClientSelectorModal` / `ProductSelectorModal` call `…Api.list`
  (not `search`), so ordering `list()` makes them newest-first automatically. Order `search()`
  too (cheap, consistent).
- **Test reach:** `createTestDb()` applies every migration on a fresh `:memory:` DB, so new
  repo/schema tests pick up `0003` automatically. The fresh DB has no pre-existing rows, so it
  does NOT exercise the upgrade backfill — that's a manual-verify item (root notes); an
  optional focused backfill test may build the pre-0003 shape by hand, but it's not required.
- Seeds don't insert clients/products → no seed change. `src/shared/dto.ts` is currently
  `export {}`; the live DTOs are in `src/shared/types.ts`.

## Steps

- [ ] `schema.ts`: add a `created_at` column to `clients` and `products`, mirroring
      `invoices.createdDate` (`sql` is already imported):

  ```ts
  createdAt: integer("created_at").notNull().default(sql`(unixepoch() * 1000)`),
  ```

- [ ] `bun run db:generate` → new `0003_*.sql`. **Hand-edit** the body to exactly the
      following (drizzle will have emitted a non-constant default — replace it). Leave the
      `meta/` snapshot + `_journal.json` as drizzle generated them:

  ```sql
  ALTER TABLE `clients` ADD `created_at` integer DEFAULT 0 NOT NULL;
  --> statement-breakpoint
  ALTER TABLE `products` ADD `created_at` integer DEFAULT 0 NOT NULL;
  --> statement-breakpoint
  UPDATE `clients` SET `created_at` = `rowid`;
  --> statement-breakpoint
  UPDATE `products` SET `created_at` = `rowid`;
  ```

- [ ] Red→green (client-repository.test): "create stamps created_at near now" → repo `create`
      stamps `createdAt: input.createdAt ?? Date.now()`.
- [ ] Red→green: "list orders newest-first (created_at DESC, rowid tiebreak)" — create rows
      with explicit out-of-order `createdAt` plus two same-ms rows → `list` orders newest-first
      with a rowid tiebreak, e.g.:

  ```ts
  .orderBy(desc(clients.createdAt), sql`rowid desc`)
  ```

  Apply the same ordering to `search`.

- [ ] Mirror both tests + impl in product-repository(.test).
- [ ] `src/shared/types.ts`: exclude `created_at` from `ClientCreateDTO`/`ClientPatchDTO` and
      `ProductCreateDTO`/`ProductPatchDTO`.
- [ ] backend-e2e: extend `src/bun/app.e2e.test.ts` — create 2 clients (and 2 products) via the
      assembled handlers, assert `list().rows[0]` is the later-created one.
- [ ] `bun test` + `bun run typecheck` green.

## Done when

- `clients` + `products` have `created_at` (epoch-ms, mirroring `invoices.created_date`).
- `0003` migration adds the column with a constant default + `rowid` backfill (no
  non-constant-default error on `migrate()`).
- Repo `create` stamps `created_at`; `list` + `search` order newest-first with a `rowid`
  tiebreak — client + product tests green.
- Create/patch DTOs compile without `created_at`; the assembled stack L1 test asserts
  newest-first ordering.
- Full `bun test` + `bun run typecheck` pass.

## Touches

- `src/bun/db/schema.ts` — `created_at` on clients + products.
- `src/bun/db/migrations/0003_*.sql` (+ `meta/`) — hand-edited ALTER + backfill.
- `src/bun/repositories/client-repository.ts` (+ `.test.ts`) — stamp + ordering.
- `src/bun/repositories/product-repository.ts` (+ `.test.ts`) — stamp + ordering.
- `src/shared/types.ts` — create/patch DTOs exclude `created_at`.
- `src/bun/app.e2e.test.ts` — L1 newest-first assertion.
