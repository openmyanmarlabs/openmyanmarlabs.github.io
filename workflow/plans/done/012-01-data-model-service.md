# 012-01 — Data model + service (status, job-model methods)

Plan: `012-root-speak-history-ux.md` · Blocked by: — · Parallel-safe with: 03

## Goal

Add generation `status` (+ nullable `audioPath`) to the schema/migration and grow the repo + service into job-model primitives: create-pending → mark-complete / mark-failed / mark-pending, plus a boot-time orphan reconcile and a `getAudioBytes` complete-gate.

## Context

- TDD phase — drive every step red→green→refactor per `.claude/skills/tdd/SKILL.md`. Bun's `bun test`, co-located `*.test.ts`, **in-memory SQLite via `createTestDb()` (`src/bun/db/test-db.ts`) + DI**. **Do NOT import `src/bun/db/migrate.ts` in tests** — it boots the Electrobun runtime; `createTestDb()` applies the schema directly.
- `generations` table: `src/bun/db/schema.ts` (today: `audioPath: text("audio_path").notNull()`, no status). Migrations live in `src/bun/db/migrations/` (last is `0002_boring_stellaris`); journal `meta/_journal.json`. Migration how-to in `src/bun/db/README.md`.
- Repo: `src/bun/repositories/generation-repository.ts` (Drizzle over injected `Db`; `insert`/`getById`/`list`/`delete`/`count`). Test: `generation-repository.test.ts`.
- Service: `src/bun/services/generation-service.ts` (owns on-disk WAV lifecycle over injected `audioDir`; today's `create(input+bytes)` writes file + inserts; `getAudioBytes` reads back; `resolveAudioAbsPath` path-guard). Test: `generation-service.test.ts`.
- `GenerationSummary` + `toSummary` in `src/shared/types.ts` / `speech-handlers.ts` gain `status` in Phase 02 — this phase only changes the data layer (schema/repo/service). Keep the `GenerationStatus` type addition for Phase 02 OR add it here in `schema.ts`-adjacent and re-export; simplest: add `export type GenerationStatus = "pending" | "complete" | "failed";` to `shared/types.ts` now and import it in the repo/service.
- Decisions locked: orphan `pending` rows → `failed` on boot (a repo `failPending()`); existing rows backfill to `complete` (column default).

## Steps

- [ ] **Schema:** in `schema.ts`, add `status: text("status").notNull().default("complete")` to `generations`; change `audioPath` to nullable (`text("audio_path")`, drop `.notNull()`). Update the inferred types' consumers as needed.
- [ ] **Migration:** `bun run db:generate` → new `0003_*.sql` + snapshot + journal entry. Inspect it: confirm `status` is added with `DEFAULT 'complete'` (backfills existing rows) and the nullability change preserves data (drizzle emits a table-recreate). Commit the generated files. Forward-only — never edit an applied migration.
- [ ] **schema.test.ts:** add a test asserting a fresh DB has the `status` column and an inserted row without `status` defaults to `complete`, and `audioPath` accepts NULL.
- [ ] **Repo (red→green):** add `markComplete(id, audioPath)` (sets `audio_path` + `status='complete'`), `markFailed(id)` (`status='failed'`), `markPending(id)` (`status='pending'`), and `failPending()` (`UPDATE … SET status='failed' WHERE status='pending'`, returns count). `list`/`getById` already return the row incl. the new columns. Test each in `generation-repository.test.ts`.
- [ ] **Service (red→green):** replace `create(input+bytes)` with:
  - `createPending(input without bytes)` — insert a row with `status='pending'`, `audioPath=null` (no file write). Returns the row.
  - `markComplete(id, bytes)` — write `audioDir/<id>.wav`, then `repo.markComplete(id, relPathFor(id))`. Returns the row.
  - `markFailed(id)` — `repo.markFailed(id)` (no file).
  - `markPending(id)` — `repo.markPending(id)` (for Retry; leaves any stale file/path alone).
  - `failPending()` — delegate to `repo.failPending()` (boot reconcile).
  - `getAudioBytes(id)` — keep the path-guard, but **reject non-`complete` rows** (throw `"GENERATION_NOT_COMPLETE"`) before reading.
  - Keep `list`/`getById`/`count`/`delete` as-is.
- [ ] **Service tests:** `createPending` writes NO file + row is `pending`/`audioPath=null`; `markComplete` writes the WAV + flips to `complete` with the relative path + round-trips via `getAudioBytes`; `markFailed`/`markPending` flip status only; `getAudioBytes` throws `GENERATION_NOT_COMPLETE` for a pending/failed row; `failPending` flips all pending rows.

## Done when

- `bun test` green: schema default/nullable, repo `markComplete`/`markFailed`/`markPending`/`failPending`, service `createPending`/`markComplete`/`markFailed`/`markPending`/`failPending`/`getAudioBytes` gate.
- `bun run typecheck` passes (callers of the removed `create` are updated in Phase 02 — if typecheck fails only there, that's expected and handled next phase; this phase's own files typecheck).
- `0003_*.sql` generated + committed; inspected to backfill `status='complete'` and preserve existing rows.

## Touches

- `src/bun/db/schema.ts` — `status` column; `audio_path` nullable.
- `src/bun/db/migrations/0003_*.sql` (+ snapshot + `meta/_journal.json`) — generated.
- `src/bun/db/schema.test.ts` — default/nullable assertions.
- `src/bun/repositories/generation-repository.ts` (+ `.test.ts`) — `markComplete`/`markFailed`/`markPending`/`failPending`.
- `src/bun/services/generation-service.ts` (+ `.test.ts`) — `createPending`/`markComplete`/`markFailed`/`markPending`/`failPending`; `getAudioBytes` gate.
- `src/shared/types.ts` — `export type GenerationStatus`.
