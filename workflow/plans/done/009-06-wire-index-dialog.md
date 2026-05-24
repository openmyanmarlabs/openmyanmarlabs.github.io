# 009-06 — Wire into index.ts + native bilingual error dialog + GUI verify

Plan: `009-root-data-migration-seeding.md` · Blocked by: 05 · Parallel-safe with: 07

## Goal

Replace the bare `runMigrations(db)` call in `index.ts` with `prepareDatabase(...)` wired to real Electrobun effects, surface failures via a native EN+MY dialog, and verify on-device. This is glue — verified by running the app, not unit tests.

## Context

- Current startup (`src/bun/index.ts:53-61`): `mkdirSync(userData)` → `createDb(join(userData,"app.db"))` → `runMigrations(db)`. Replace the migrate line with the orchestrator, **before** the `BrowserWindow` is created (line ~98).
- Real injected deps for `prepareDatabase`:
  - `version` — `Updater.getLocalInfo().version` inside try/catch → `"0.0.0"` fallback (dev). Import `Updater` from `electrobun/bun` (see `app-rpc.ts` for the existing usage).
  - `dbPath` = `join(Utils.paths.userData, "app.db")`; `backupsDir` = `join(Utils.paths.userData, "backups")`; `dbPreExisted` = `existsSync(dbPath)` captured **before** `createDb`.
  - `migrationsFolder` = `resolveMigrationsFolder()` (`src/bun/db/migrate.ts`).
  - `hashPassword` = the same hashing `auth-service.ts` uses.
  - `showError({ backupPath })` = `Utils.showMessageBox({ type:"error", title, message, detail, buttons:["Quit"] })` — **bilingual** (EN + MY in message/detail, since no window/locale exists yet) stating data is safe + restored and where the backup lives.
  - `quit` = `Utils.quit()`.
- Electrobun KB for the dialog/quit signatures: `workflow/learning/electron-bun/apis/utils.md` (`showMessageBox`, `quit`). `showMessageBox` returns `Promise<{response}>` — await it before `quit()`.
- **Open question to resolve here:** confirm `Utils.showMessageBox` renders with **no window ever opened**. If it doesn't, fall back to opening the `BrowserWindow` on a minimal bundled `error.html` instead (note the outcome in the phase result).
- `runMigrations` in `migrate.ts` may now be unused by `index.ts` (the orchestrator calls drizzle `migrate` directly via `resolveMigrationsFolder`) — keep `resolveMigrationsFolder` exported; remove/retain `runMigrations` as appropriate.

## Steps

- [ ] In `index.ts`: capture `dbPreExisted`, ensure `backups` dir, compute `version` (try/catch), open DB, then `await prepareDatabase(db, { … })` before constructing `BrowserWindow`.
- [ ] Implement the bilingual `showError` copy (EN + MY) including the backup path; wire `quit`.
- [ ] **Verify — normal launch** (`verify`/`run` skill): app boots, DB prepared, window opens; create data, relaunch → data persists.
- [ ] **Verify — failure path**: temporarily introduce a broken migration → launch → native dialog shows EN+MY copy + backup path **before** any window, app quits, DB intact on next normal launch. Revert the broken migration.

## Done when

- App launches normally with the orchestrator in place (no regression).
- Deliberate migration failure shows the bilingual native dialog pre-window and quits with the DB restored.
- The `showMessageBox`-pre-window question is answered (works, or fallback applied).
- `bun run typecheck` passes.

## Touches

- `apps/electrobun-template/src/bun/index.ts` — orchestrator wiring + dialog/quit.
- `apps/electrobun-template/src/bun/db/migrate.ts` — possibly trim `runMigrations` (keep `resolveMigrationsFolder`).
