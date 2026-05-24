# 009-04 — Seeding (idempotent + first-install)

Plan: `009-root-data-migration-seeding.md` · Blocked by: 02, 03 · Parallel-safe with: —

## Goal

Net-new `src/bun/db/seed/seeds.ts`: a `runSeeds` orchestrator covering the two code-seed kinds — idempotent (every launch) and first-install-only (gated on upgrade state). Test-first.

## Context

- Depends on `settings` + `users` tables (phase 02 / existing) and the `UpgradeState` type (phase 03).
- **TDD** — `.claude/skills/tdd/SKILL.md`. In-memory `createTestDb()`, co-located `seeds.test.ts`, `bun test`. Don't import `migrate.ts`.
- **Idempotent seeds run every launch** and must be no-ops on re-run — use `INSERT ... ON CONFLICT DO NOTHING` (Drizzle `.onConflictDoNothing()`) or existence checks.
- **First-install seeds run only when `upgrade.firstRun === true`.**
- Password hashing is injected (`hashPassword: (pw: string) => Promise<string>`) so seeds stay testable and reuse the app's real hashing — mirror what `src/bun/services/auth-service.ts` uses (Bun password hashing). The orchestrator (phase 05) passes the real fn; tests pass a fake.
- Default-admin seed is an illustrative demo with a security caveat (root Notes) — keep it but documented as opt-in.

## Steps

- [ ] `seedDefaultSettings(db): void` — idempotent INSERT of default `settings` rows. Tests: run twice → no duplicate rows; defaults present after first run.
- [ ] `seedAdminUser(db, { hashPassword }): Promise<void>` — if `users` is empty, insert an `admin` user with a hashed password. Tests: creates admin once; a second call when a user already exists is a no-op.
- [ ] `runSeeds(db, { upgrade, hashPassword }): Promise<void>` — always `seedDefaultSettings`; call `seedAdminUser` only when `upgrade.firstRun`. Tests:
  - `firstRun: true` → admin created, settings present.
  - `firstRun: false` → admin NOT created; settings still converge.
  - running `runSeeds` twice → no duplicates anywhere.

## Done when

- Idempotency (no dupes on re-run) and first-install gating both green under `bun test`.
- `runSeeds` takes deps by injection (no `electrobun/bun` import).
- `bun run typecheck` passes.

## Touches

- `apps/electrobun-template/src/bun/db/seed/seeds.ts` — new module.
- `apps/electrobun-template/src/bun/db/seed/seeds.test.ts` — new tests.
