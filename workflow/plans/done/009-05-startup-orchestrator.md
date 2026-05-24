# 009-05 — Startup orchestrator (backup → migrate → seed → record → prune)

Plan: `009-root-data-migration-seeding.md` · Blocked by: 01, 03, 04 · Parallel-safe with: —

## Goal

Net-new `src/bun/db/startup.ts`: a single `prepareDatabase` that composes the whole DB-readiness sequence with backup-on-failure semantics, **all effects injected** so it's fully unit-testable. This is also the feature's assembled-stack integration gate.

## Context

- Composes phase 01 (`backupDb`/`restoreDb`/`pruneBackups`/`hasPendingMigrations`), drizzle's `migrate` (`drizzle-orm/bun-sqlite/migrator`), phase 03 (`getUpgradeState`/`recordRun`), phase 04 (`runSeeds`).
- **Must NOT import `electrobun/bun`** — `version`, `showError`, `quit`, all paths, and `hashPassword` are injected. `index.ts` (phase 06) supplies the real Electrobun implementations. This keeps the failure path testable with spies + a deliberately-broken migrations folder.
- **TDD** — `.claude/skills/tdd/SKILL.md`. Tests need **temp file DBs** (`fs.mkdtempSync`) because backup/restore copy files — not `:memory:`. This phase's tests double as the **integration / e2e coverage** for the feature (real file DB + real drizzle migrate + real seeds + real `app_meta`); there is no separate RPC L1 gate (no RPC surface).
- Sequence (success): capture `dbPreExisted = existsSync(dbPath)` **before** opening the DB → if `dbPreExisted && hasPendingMigrations(db, folder)` then `backupDb` → `migrate` → `getUpgradeState` → `runSeeds` → `recordRun` → `pruneBackups(keep=3)` → return `UpgradeState`.
- Sequence (failure, anywhere in migrate/seed/record): if a backup was taken, `restoreDb`; call `showError({ backupPath })`; call `quit()`; do not return a usable state (return `null` or throw after `quit`). The backup is held until record succeeds (so a seed failure still restores).

## Steps

- [ ] Define `prepareDatabase(db, opts): Promise<UpgradeState | null>` with `opts = { dbPath, backupsDir, migrationsFolder, version, dbPreExisted, hashPassword, showError, quit, keep? }`.
- [ ] **Happy path (upgrade):** pre-existing file DB with pending migrations → backup taken, migrations applied, seeds run, `last_run_version` written, backups pruned to ≤3. Assert returned state + DB rows.
- [ ] **Skipped versions:** DB at migration `0000`, folder shipping `0000..n` → all intermediate migrations applied in order (assert resulting tables/rows). (acceptance: skipped versions)
- [ ] **Failed migration:** point at a migrations folder containing a deliberately broken `.sql` → `migrate` throws → DB byte-equals its pre-migration backup, `showError` called with the backup path, `quit` called, no `UpgradeState` returned. (acceptance: failed migration)
- [ ] **First install:** no pre-existing file (`dbPreExisted=false`) → no backup taken; `firstRun` seeds run; `first_installed_at` set.
- [ ] **Pruning:** several successful runs → at most `keep` (3) backups remain.

## Done when

- All scenarios above green under `bun test`.
- `startup.ts` has zero `electrobun/bun` imports; every side effect is injected.
- On failure the DB is provably restored and `showError`+`quit` fire before any success return.
- `bun run typecheck` passes.

## Touches

- `apps/electrobun-template/src/bun/db/startup.ts` — new orchestrator.
- `apps/electrobun-template/src/bun/db/startup.test.ts` — new integration tests (temp file DBs, broken-migration fixture).
