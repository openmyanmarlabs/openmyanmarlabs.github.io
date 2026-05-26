# Spec — Data Migration & Seeding Consistency (2026-05-24)

One-line: Make schema migrations and data seeding apply correctly and safely when an Electrobun app jumps across versions (e.g. `0.0.1 → 0.1.0`), including intermediate versions that carry their own migrations/seeds (`0.0.5`, `0.0.8`).
Source: `workflow/ideas/electron/make-consistency-data-seeding-and-migration.md`

## Goal

When a user installs a new build over an old one, the on-disk SQLite DB (`<userData>/app.db`) must reach the new schema + seed state correctly, no matter how many versions were skipped. Ordered step-by-step migration is **already** handled by Drizzle's journal; this spec adds a **seeding mechanism**, **migration failure safety** (backup → restore → block), **upgrade detection**, and **hardens + documents** the existing flow so the guarantee is explicit and tested. Target app: `apps/electrobun-template` (pattern reusable by future apps).

## Users / context

- Built into `apps/electrobun-template`; the bun **main process** runs this at startup (`src/bun/index.ts`), before the window/RPC handlers query.
- Runs fully **offline / on-device** — SQLite at `<userData>/app.db`. No network, no sync.
- Primary audience is the **developer** building on the template (the seeding/migration API). The end-user only sees output in the failure path: a native bilingual error dialog.
- Versions skipped is the norm, not the exception — a user may not launch for months and jump several releases at once.

## Key mechanism (already true — to be made explicit + tested)

Drizzle's `migrate()` records applied migrations in `__drizzle_migrations`; the new binary ships **every** migration SQL file (incl. those added in `0.0.5`, `0.0.8`). On launch it applies only the unapplied ones, **in journal order**. So `0.0.1 → 0.1.0` replays the backlog sequentially. No version arithmetic drives migration ordering — the journal does.

## Scope

**In:**

- **Seeding (hybrid model, net-new):**
  - Static reference/lookup data → plain `INSERT` statements **inside Drizzle migrations** (inherits ordered, run-once-via-journal behavior for free).
  - App-level defaults needing code (hashing, conditionals, e.g. a default admin) → **idempotent seed functions** that run after migrations.
- **Migration failure safety:** backup `app.db` before applying pending migrations; on any failure restore the backup and stop with a native bilingual error dialog — never run the new binary on a half-migrated schema.
- **Upgrade detection:** an `app_meta` table storing `last_run_version` + `first_installed_at`; at startup compute `{ first-install | upgrade | same }` + `from → to`, expose it, and let seeds read it.
- **Harden + document** the existing Drizzle step-by-step flow (explicit guarantee, tests, docs).

**Out (non-goals):**

- **Down / rollback migrations.** Forward-only; we never author `down` SQL. Recovery on failure is restore-from-backup, not schema reversal.
- **The binary update download/install mechanism.** Already exists (`evaluate-update.ts`, `versions.json`, update store). This spec only governs what happens to the DB _after_ a new binary runs.
- **Per-version `onUpgrade(from,to)` hook registry.** Rejected — seeds + idempotency cover data; non-data one-offs aren't needed yet.
- **Retry-on-failure logic.** A deterministic bug just fails twice; restore + report instead.
- **Multi-device sync, cloud backup, DB encryption.**
- **Backup-management / manual-restore UI.** Backups are automatic, on-disk; no settings screen, no in-app browser.
- **Large-dataset migration progress UI.** Assume small local DBs; migrations are fast.

## Requirements

**Migration safety (startup flow in `src/bun/index.ts`):**

- [ ] 1. Resolve current app version: `Updater.getLocalInfo().version`, fallback `"0.0.0"` (dev has no bundled `version.json`).
- [ ] 2. Detect pending migrations by comparing the migrations folder/journal against the applied set in `__drizzle_migrations`.
- [ ] 3. If ≥1 migration is pending **and** `app.db` already exists, copy it to `<userData>/backups/app.db.<timestamp>.bak` **before** migrating. (Fresh first-install → nothing to back up. No pending migrations → no backup.)
- [ ] 4. Run migrations inside a guard. On **any** throw: restore the backup over `app.db`, show the native error dialog (req. 11), then `Utils.quit()` — do **not** create the main window.
- [ ] 5. The backup is retained until migrations **and** seeds **and** the version-record write (req. 10) all succeed; only then prune.
- [ ] 6. After a fully clean startup, prune `<userData>/backups/` to the most recent **N = 3** backups.

**Seeding (runs after migrations succeed):**

- [ ] 7. Idempotent reference/default seed functions run **every launch**, each guarded so re-running is a no-op (`INSERT OR IGNORE` / existence check) — converge, never duplicate.
- [ ] 8. First-install-only seeds (e.g. default admin) run **only** when upgrade state `firstRun === true`.
- [ ] 9. Seed display-text reference data carries both languages (`*_en` / `*_my` columns) per repo bilingual convention. A seed failure is treated like a migration failure (restore + error dialog), since the backup is still held (req. 5).

**Upgrade detection:**

- [ ] 10. Maintain `app_meta(key TEXT PRIMARY KEY, value TEXT)` (created by a migration). After clean migrations, compute `UpgradeState = { kind, from: string|null, to: string, firstRun: boolean }`: no `last_run_version` row → `first-install`; differs from current → `upgrade`; equal → `same`. Then write `last_run_version = current` and set `first_installed_at` if absent.
- [ ] 11. Expose the upgrade state to the rest of the main process (e.g. `getUpgradeState()`), available to seeds and future features.

**Failure UX (i18n):**

- [ ] 12. On migration/seed failure show `Utils.showMessageBox({ type: "error", buttons: ["Quit"], … })` with **both** EN + MY text (window/locale not up yet), stating data is safe + restored and where the backup lives. Then quit.

**Hardening / docs:**

- [ ] 13. Tests prove the step-by-step guarantee (see Acceptance), failure restore, seed idempotency, first-install gating, and upgrade-state computation.
- [ ] 14. A short README/section documents: how to add a migration, how to add each seed kind, the backup/restore behavior, and the forward-only rule.

## Constraints

- Bun + `drizzle-orm/bun-sqlite`; migrations generated by drizzle-kit into `src/bun/db/migrations`, copied into the bundle by `scripts/post-build.ts` (data-only seed migrations may need `drizzle-kit generate --custom`).
- Everything runs in the bun main process **before** the `BrowserWindow` is created; failure path must work with no window open.
- **Never write inside the app bundle** (breaks codesign). `app.db`, `backups/` all live under `Utils.paths.userData`.
- Keep testable via DI; backup/restore + failure tests use **temp file DBs** (not `:memory:`, which can't exercise file copy/restore). Existing `createTestDb()` (`:memory:`) still covers seed/upgrade logic.
- Forward-only migrations; no destructive auto-recovery beyond restoring the pre-migration backup.

## Acceptance — done when

- **Skipped versions:** a DB at migration `0000` opened by a binary shipping `0000..0003` ends with `0001, 0002, 0003` applied in order (test).
- **Failed migration:** with a deliberately failing migration, after startup the DB byte-equals its pre-migration backup, no main window opens, and the error path fired (test).
- **Seed idempotency:** running seeds twice yields no duplicate rows (test).
- **First-install gating:** first-install-only seed runs when `firstRun`, and does **not** re-run on a simulated upgrade (`firstRun=false`) (test).
- **Upgrade state:** no meta row → `first-install`; changed version → `upgrade` with correct `from→to`; unchanged → `same` (test).
- **Version record:** `last_run_version` is written only after a clean start; `first_installed_at` set once and never overwritten (test).
- **Backup pruning:** after several clean startups, at most 3 backups remain (test).
- **Failure dialog:** the error dialog shows EN + MY copy and the backup path (manual/asserted on the args).

## Open questions

- **`Utils.showMessageBox` with zero windows ever created** — docs strongly imply it works pre-window but don't guarantee it. If it can't, fall back to a minimal bundled `error.html` BrowserWindow. Verify during plan/build.
- **Backup retention N=3** — reasonable default; confirm it's enough vs. disk use.
- **Backup trigger = pending migrations only** — seeds (idempotent, additive) run without a fresh backup when no migration is pending. Acceptable? Or always back up when the DB pre-exists?
- **Dev mode** — `version` is always `"0.0.0"` in dev, so upgrade detection reads `first-install` once then `same`. Fine for the template, but confirm no dev flow needs real version simulation.
