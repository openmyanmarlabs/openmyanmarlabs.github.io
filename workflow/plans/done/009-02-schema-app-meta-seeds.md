# 009-02 — Schema: app_meta + seed-target tables + generated migrations

Plan: `009-root-data-migration-seeding.md` · Blocked by: — · Parallel-safe with: 01

## Goal

Add the tables the rest of the plan needs and generate their migrations — including a **static bilingual seed delivered inside a migration** (the seeds-as-migration pattern).

## Context

- Schema lives in `src/bun/db/schema.ts` (Drizzle `sqliteTable`, exported via `export const schema = { … }`). drizzle-kit config: `drizzle.config.ts` (out → `src/bun/db/migrations`). Generate with `bun run db:generate`. Existing migration: `0000_wonderful_morbius.sql`.
- `post-build.ts` already copies the whole migrations folder into the bundle — no change needed.
- `createTestDb()` (`src/bun/db/test-db.ts`) applies every migration in the folder to an in-memory DB — so new migrations are picked up by all unit tests automatically.
- Three tables:
  - **`app_meta(key text primary key, value text)`** — key/value store for upgrade detection (phase 03). Keys later: `last_run_version`, `first_installed_at`.
  - **`settings(key text primary key, value text)`** — target for the idempotent code seed (phase 04).
  - **`categories(id text primary key, name_en text not null, name_my text not null)`** — bilingual reference/lookup table; rows seeded **in a custom data migration** (the static seed pattern + `*_en`/`*_my` convention).
- `settings` + `categories` are **illustrative template demos** (see root Notes) — keep minimal.

## Steps

- [ ] Add `appMeta`, `settings`, `categories` `sqliteTable` definitions to `schema.ts`; add `$inferSelect`/`$inferInsert` types; include all in the exported `schema` object.
- [ ] `bun run db:generate` → produces `0001_<name>.sql` (the three CREATE TABLEs) + updates `meta/_journal.json`. Confirm the file + journal entry.
- [ ] `bunx drizzle-kit generate --custom --name seed_categories` → produces an empty `0002_seed_categories.sql`. Fill it with `INSERT` rows for `categories` (bilingual EN + MY values). This INSERT runs once, in order, via the journal — the seeds-as-migration demonstration.
- [ ] Add `schema.test.ts` (or extend an existing db test) using `createTestDb()`: assert all three tables exist and `categories` has the seeded rows (proves the in-migration seed applied).

## Done when

- `bun run db:generate` produced `0001_*.sql`; the custom `0002_seed_categories.sql` holds bilingual INSERTs; `meta/_journal.json` lists both.
- `createTestDb()` applies the full chain with no error.
- Test asserts `categories` seed rows present (in both languages).
- `bun run typecheck` passes.

## Touches

- `apps/electrobun-template/src/bun/db/schema.ts` — three new tables + types.
- `apps/electrobun-template/src/bun/db/migrations/0001_*.sql` — generated schema migration.
- `apps/electrobun-template/src/bun/db/migrations/0002_seed_categories.sql` — custom bilingual data seed.
- `apps/electrobun-template/src/bun/db/migrations/meta/*` — journal/snapshot updates.
- `apps/electrobun-template/src/bun/db/schema.test.ts` — new/extended assertion.
