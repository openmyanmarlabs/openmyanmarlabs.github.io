# 010-02 — Data model: schema + migrations + seed

Plan: `010-root-open-myanmar-invoice.md` · Blocked by: 01 · Parallel-safe with: 03

## Goal

Drizzle schema for the six invoice tables exists, a generated SQL migration applies cleanly on a fresh DB, and the `company` singleton is seeded.

## Context

- Schema file: `src/bun/db/schema.ts` (auth tables already removed in 01). Template conventions (confirmed this session): `text("id").primaryKey()`, dates as `integer` epoch-ms with `.default(sql\`(unixepoch() _ 1000)\`)`, bilingual `_\_en`/`\*\_my`only where copy is bilingual (most invoice fields are user data, not bilingual — keep plain`text`).
- Migrations: `drizzle.config.ts` → `out: ./src/bun/db/migrations`, `dialect: sqlite`. Generate with `bun run db:generate` (drizzle-kit). `scripts/post-build.ts` copies migrations into the bundle — don't touch that.
- DB boot: `src/bun/db/startup.ts` runs backup → migrate → detect-upgrade → seed → record. Seeds live in `src/bun/db/seed/seeds.ts` (idempotent `ON CONFLICT DO NOTHING` + first-run gating). Seed pattern reference: plan `009` (`workflow/plans/done/009-*`).
- Tables (from spec §Data model):
  - `company` (single row, fixed id e.g. `"company"`) — name, email, mobile, address, `logo_path`, `default_currency`, `invoice_prefix`.
  - `clients` — id, name, email, mobile, billing_address, `image_path`.
  - `products` — id, name, `product_id` (SKU), amount (real/int — store minor-unit or float to match calc; spec uses float), `image_path`.
  - `invoices` — id, `invoice_no`, `status` integer (1 Draft/2 Unpaid/3 Paid), `total_amount`, `color`, `background_ref` (text: `builtin:<id>`|`file:<path>`|null), `due_date` (int ms), `created_date` (int ms), `client_id` text **nullable** FK → `clients.id`, `client_snapshot` text (JSON), `company_snapshot` text (JSON).
  - `invoice_items` — id, `invoice_id` FK → `invoices.id` (cascade delete), `product_id` text nullable, name, amount, quantity (int).
  - `invoice_taxes` — id, `invoice_id` FK (cascade), title, `type` text (`percentage`|`flat`), value (real), amount (real).
- FK cascade: use Drizzle `references(() => invoices.id, { onDelete: "cascade" })`; ensure `PRAGMA foreign_keys = ON` is set by the connector (`src/bun/db/connector.ts` — verify; add if missing).

## Steps

- [ ] Add the six tables to `src/bun/db/schema.ts` with the columns above; export inferred row types (`type CompanyRow = typeof company.$inferSelect`, etc.).
- [ ] Verify `connector.ts` enables `foreign_keys`; add the pragma if absent.
- [ ] `bun run db:generate` → review the emitted SQL migration (cascades + nullable client_id present).
- [ ] Add a `company` singleton seed (fixed id, sensible defaults: empty strings, `default_currency` e.g. `"MMK"`, `invoice_prefix` e.g. `"INV"`) to `seeds.ts`, first-run gated, idempotent.
- [ ] `bun run typecheck` clean.

## Done when

- Fresh-DB boot applies the migration with no error; the six tables exist with correct FKs/cascade (spot-check via a throwaway in-memory `bun:sqlite` open + `PRAGMA foreign_key_list`).
- `company` row present after first boot; re-boot doesn't duplicate it.
- Inferred row types exported for repos (phase 04) to import.

## Touches

- `src/bun/db/schema.ts` — six tables + row types.
- `src/bun/db/migrations/*` — generated SQL.
- `src/bun/db/seed/seeds.ts` — company singleton seed.
- `src/bun/db/connector.ts` — foreign_keys pragma (if needed).
