# 009-01 — Backup / restore / prune + pending-migration detection

Plan: `009-root-data-migration-seeding.md` · Blocked by: — · Parallel-safe with: 02

## Goal

Net-new `src/bun/db/backup.ts`: pure, injectable functions to snapshot, restore, and prune the SQLite file, plus detect whether migrations are pending. Built test-first.

## Context

- Foundation for the startup orchestrator (phase 05). No dependency on the new schema — can run alongside phase 02.
- **TDD** — follow `.claude/skills/tdd/SKILL.md`. One behavior at a time, red→green→refactor, co-located `backup.test.ts`, `bun test`.
- Backup/restore/prune act on **files**, so tests need **temp file DBs** via `fs.mkdtempSync(join(tmpdir(), …))` — `:memory:` can't be copied. Do NOT import `migrate.ts` (it boots Electrobun).
- `createDb(path)` (`src/bun/db/connector.ts`) opens a real file DB; `migrate` from `drizzle-orm/bun-sqlite/migrator` applies a folder. Use these to build a DB with applied migrations in tests.
- Pending detection: Drizzle records one row per applied migration in the `__drizzle_migrations` table; `src/bun/db/migrations/meta/_journal.json` lists all migration entries. Pending = `journalEntries > appliedRows`. **Verify the `__drizzle_migrations` shape** against drizzle-orm 0.45 (table may live in `main`); if the count signal proves unreliable, note it for phase 05's fallback (back up whenever the DB pre-exists).
- All paths are **arguments** (no electrobun import) — keeps this unit-testable and reusable.

## Steps

- [ ] `backupDb(dbPath, backupsDir): string` — `mkdirSync` the dir, copy `dbPath` → `<backupsDir>/app.db.<Date.now()>.bak`, return the new path. Test: file exists, byte-equal to source; `Date.now()` name sorts chronologically.
- [ ] `restoreDb(backupPath, dbPath): void` — copy backup over the live file. Test: after restore, `dbPath` byte-equals the backup (overwrites a mutated file).
- [ ] `pruneBackups(backupsDir, keep): void` — keep the newest `keep` `*.bak` (lexicographic = chronological), delete the rest. Test: 5 backups, `keep=3` → 3 newest remain.
- [ ] `hasPendingMigrations(db, migrationsFolder): boolean` — count `_journal.json` entries vs `__drizzle_migrations` rows. Tests: fully-migrated DB → `false`; a folder/journal with one extra entry → `true`; DB with no `__drizzle_migrations` table → `true` (all pending).

## Done when

- `bun test` green for backup, restore, prune, and all three pending-detection cases.
- Every function takes paths/db as args — zero `electrobun/bun` import in `backup.ts`.
- `bun run typecheck` passes.

## Touches

- `apps/electrobun-template/src/bun/db/backup.ts` — new module.
- `apps/electrobun-template/src/bun/db/backup.test.ts` — new tests (temp file DBs).
