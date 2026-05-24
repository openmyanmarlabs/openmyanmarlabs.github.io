# Plan 009 — Data Migration & Seeding Consistency

Source: `workflow/specs/2026-05-24-data-migration-and-seeding.md`

## Summary

Make the on-disk SQLite DB reach the new schema + seed state safely when an Electrobun build jumps versions. Ordered migration is already Drizzle's job; this plan adds the pieces around it: file-level **backup → restore → block** on migration failure, a hybrid **seeding** mechanism (static-in-migration + idempotent code seeds + first-install seeds), **upgrade detection** via an `app_meta` table, and a testable **startup orchestrator** wired into `index.ts` behind a native bilingual error dialog. Pure logic is built test-first; the only electrobun-coupled code is the `index.ts` glue, verified by running the app.

## Phases

| #   | Phase                          | File                                         | Blocked by | Parallel-safe with |
| --- | ------------------------------ | -------------------------------------------- | ---------- | ------------------ |
| 01  | Backup / restore / prune       | `plans/todo/009-01-backup-restore.md`        | —          | 02                 |
| 02  | Schema: app_meta + seed tables | `plans/todo/009-02-schema-app-meta-seeds.md` | —          | 01                 |
| 03  | Upgrade detection              | `plans/todo/009-03-upgrade-detection.md`     | 02         | —                  |
| 04  | Seeding (hybrid)               | `plans/todo/009-04-seeding.md`               | 02, 03     | —                  |
| 05  | Startup orchestrator           | `plans/todo/009-05-startup-orchestrator.md`  | 01, 03, 04 | —                  |
| 06  | Wire index.ts + native dialog  | `plans/todo/009-06-wire-index-dialog.md`     | 05         | 07                 |
| 07  | Developer docs                 | `plans/todo/009-07-docs.md`                  | 05         | 06                 |

Critical path: **02 → 03 → 04 → 05 → 06**. Wave 1 runs 01 ∥ 02; final wave runs 06 ∥ 07.

## Notes / risks

- **`hasPendingMigrations` heuristic** — phase 01 compares journal-entry count vs row count in `__drizzle_migrations`. Verify that table's actual shape against drizzle-orm 0.45 during build. Fallback if unreliable: "back up whenever `app.db` pre-exists" (the spec's open question explicitly allows this) — simpler, slightly wasteful.
- **Demo tables are illustrative.** `settings` + `categories` and the default-admin seed exist to demonstrate the three seed kinds for the _template_. Default admin with a known password is a security smell — flag to prune/replace before any real app ships. (spec open Q)
- **`Utils.showMessageBox` with zero windows ever open** — KB strongly implies it works pre-window but doesn't guarantee it (`workflow/learning/electron-bun/apis/utils.md`). Phase 06 confirms on-device; fallback = a minimal bundled `error.html` BrowserWindow. (spec open Q)
- **No new RPC surface.** This is startup glue, not a renderer feature — so there's **no backend-e2e L1 RPC gate**. The assembled-stack coverage lives in phase 05's real-file-DB integration tests (backup + real drizzle migrate + seeds + upgrade-state across a simulated version jump and a failing migration). The native-GUI walk (dialog shows pre-window, app quits, normal relaunch persists data) can't be automated — it's a manual `verify`-skill step in phase 06.
- **`startup.ts` must stay electrobun-free** (no `electrobun/bun` import) so it's unit-testable; all effects (version, `showError`, `quit`, paths, `hashPassword`) are injected. `index.ts` is the sole place that supplies the real Electrobun implementations.
- **Backup retention N = 3**, filenames use `Date.now()` so lexicographic sort = chronological (clean pruning). (spec open Q)
- **Dev mode** — `Updater.getLocalInfo()` throws in dev → version `"0.0.0"`, so upgrade detection reads `first-install` once then `same`. Fine for the template. (spec open Q)
- All `*.test.ts` use `bun test`. Backup/restore/startup tests need **temp file DBs** (`fs.mkdtempSync`), not `:memory:` (can't copy a file). Upgrade/seed logic tests reuse `createTestDb()` (in-memory). Never import `migrate.ts` in tests (boots Electrobun) — see `.claude/skills/tdd/SKILL.md`.
