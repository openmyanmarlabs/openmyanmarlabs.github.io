# 009-03 — Upgrade detection (app_meta read/write)

Plan: `009-root-data-migration-seeding.md` · Blocked by: 02 · Parallel-safe with: —

## Goal

Net-new `src/bun/db/upgrade-state.ts`: compute `{ first-install | upgrade | same }` from `app_meta.last_run_version`, and record the current run. Test-first.

## Context

- Depends on the `app_meta` table from phase 02.
- **TDD** — `.claude/skills/tdd/SKILL.md`. In-memory is fine here: use `createTestDb()` (`src/bun/db/test-db.ts`). Co-located `upgrade-state.test.ts`, `bun test`. Don't import `migrate.ts`.
- Query `app_meta` directly via the `db` (Drizzle) — keys `last_run_version`, `first_installed_at`. Store `first_installed_at` as epoch-ms string.
- Types:
  ```ts
  type UpgradeKind = "first-install" | "upgrade" | "same";
  type UpgradeState = {
    kind: UpgradeKind;
    from: string | null;
    to: string;
    firstRun: boolean;
  };
  ```
- Consumed by seeds (phase 04, reads `firstRun`) and the orchestrator (phase 05). No RPC, no renderer — main-process only (spec req 11).

## Steps

- [ ] `getUpgradeState(db, currentVersion): UpgradeState` — read `last_run_version`. Tests:
  - no row → `{ kind:"first-install", from:null, to:current, firstRun:true }`.
  - `"0.0.1"` stored, current `"0.1.0"` → `{ kind:"upgrade", from:"0.0.1", to:"0.1.0", firstRun:false }`.
  - stored == current → `{ kind:"same", from:current, to:current, firstRun:false }`.
- [ ] `recordRun(db, currentVersion): void` — upsert `last_run_version = currentVersion`; set `first_installed_at` only if absent. Tests:
  - after call, `last_run_version` == current.
  - `first_installed_at` set on first call; a second call (different version) does NOT overwrite it.

## Done when

- All five behaviors green under `bun test`.
- `getUpgradeState` is a pure read; `recordRun` preserves `first_installed_at`.
- `bun run typecheck` passes.

## Touches

- `apps/electrobun-template/src/bun/db/upgrade-state.ts` — new module (+ exported types).
- `apps/electrobun-template/src/bun/db/upgrade-state.test.ts` — new tests.
