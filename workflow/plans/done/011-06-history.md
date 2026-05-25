# 011-06 — History (generations DB + repo/service + UI)

Plan: `011-root-open-myanmar-speech.md` · Blocked by: 04 · Parallel-safe with: 05, 07

## Goal

Persist every generation to SQLite + an on-disk `.wav`, and a History screen to re-play, re-use the text, and delete (row + file). Newest first, paginated.

## Context

- **TDD the repo + service** — read `.claude/skills/tdd/SKILL.md`: in-memory `bun:sqlite` + DI, co-located `*.test.ts`, `bun test`. **Do NOT import `src/bun/db/migrate.ts` in tests** (boots the Electrobun runtime) — use the template's `src/bun/db/test-db.ts` (`createTestDb()` → in-memory + real migrations).
- **Handlers transport-free for e2e** — read `.claude/skills/backend-e2e/SKILL.md`. Add to / mirror `src/bun/rpc/speech-handlers.ts` (phase 04) — keep it a pure map.
- **Schema** (`src/bun/db/schema.ts`): add a `generations` table — `id` (text pk, nanoid), `text` (text), `engine_id` (text), `voice_preset_id` (text, nullable), `speed` (real), `audio_path` (text — relative, e.g. `audio/<id>.wav`, **never bytes**), `created_date` (integer, epoch ms, default `(unixepoch()*1000)`). `bun run db:generate` for the migration. (`bun add nanoid` if not present.)
- **Repo** (`src/bun/repositories/generation-repository.ts`, TDD): `insert(row)`, `list({ limit, offset })` (newest first), `getById(id)`, `delete(id)`. Single SELECT for the list (no N+1).
- **Service** (`src/bun/services/generation-service.ts`, TDD): wraps the repo; owns the audio-file lifecycle. `create({ text, engineId, voicePresetId?, speed, bytes })` → `Bun.write(join(Utils.paths.userData, "audio", \`${id}.wav\`), bytes)`→ insert row with the relative path → return the row.`delete(id)`→ delete the row **and** the file (best-effort; tolerate a missing file).`getAudioBytes(id)`→ resolve under`userData/audio`→`Bun.file(abs).arrayBuffer()`→ bytes; **path-safety check** (stays inside`userData/audio`, no traversal). Inject the base dir for testability (don't hard-call `Utils.paths` deep in logic — pass it in).
- **Persist-on-speak:** extend the `speak` handler (phase 04) so a successful synthesis also calls `generationService.create(...)` and returns the new `generationId` alongside the bytes. **Additive** — phase 05's main screen ignores the extra field, so it doesn't break.
- **getAudio RPC:** `getAudio({ id })` → `generationService.getAudioBytes(id)` → bytes → renderer `URL.createObjectURL(new Blob([bytes], { type:"audio/wav" }))` (same pattern as invoice `getImage`; revoke on unmount).
- **RPC contract:** extend `src/shared/types.ts` `AppRPC.bun.requests` with `listGenerations`, `getAudio`, `deleteGeneration` (+ the `speak` response gains `generationId`). Renderer wrappers in `src/lib/rpc.ts` / `speech-api.ts`. **Append only.**
- DI: `src/bun/index.ts` — `createGenerationRepository(db)` → `createGenerationService(repo, { audioDir })`; pass it into `createSpeechHandlers`; `mkdirSync(userData/audio, { recursive: true })` at startup.
- **History UI:** `frontend-design` + **consult `tailwind-docs-reader` before CSS** (Tailwind v4). Route `/history`; list rows (text preview, engine, speed, date), paginated (e.g. 10/page); row actions — **Re-play** (`getAudio` → blob → `<audio>`), **Re-use text** (load into the main-screen store, navigate `/`), **Delete** (confirm → `deleteGeneration` → row + file gone). Link from the navbar.

## Steps

- [ ] Add `generations` to `schema.ts`; `bun run db:generate`.
- [ ] (TDD) `generation-repository.ts` + `.test.ts` — insert / list (newest first, paginated) / getById / delete.
- [ ] (TDD) `generation-service.ts` + `.test.ts` — create (writes file + row), delete (row + file, missing-file tolerant), getAudioBytes (round-trip + traversal rejected) — inject `audioDir`.
- [ ] Extend `speak` handler to persist + return `generationId`; add `listGenerations`/`getAudio`/`deleteGeneration` handlers.
- [ ] Extend `AppRPC` + renderer wrappers; DI + `mkdirSync(userData/audio)` in `index.ts`.
- [ ] (UI) `tailwind-docs-reader`; build `/history` list + re-play / re-use / delete; navbar link; append `history.*` i18n (en + my).
- [ ] `run`/`verify`: speak → row appears; re-play from disk; re-use loads text; delete removes row + `.wav`.

## Done when

- `bun test` green: generation repo + service (create writes file+row, delete removes both, getAudio round-trips + blocks traversal, list newest-first paginated).
- Speaking persists a generation (file under `userData/audio`, row with the path, not bytes) and returns `generationId`.
- History screen lists newest-first with working re-play (from file), re-use text, and delete (removes row + file).
- `bun run typecheck` clean.

## Touches

- `src/bun/db/schema.ts`, `src/bun/db/migrations/**` — `generations`.
- `src/bun/repositories/generation-repository.ts`, `src/bun/services/generation-service.ts` (+ `.test.ts`).
- `src/bun/rpc/speech-handlers.ts` — persist-on-speak + list/getAudio/delete.
- `src/bun/index.ts` — DI + `userData/audio`.
- `src/shared/types.ts`, `src/lib/rpc.ts` / `speech-api.ts` — append.
- `src/features/history/**`, `src/routes/index.tsx`, `src/components/common/navbar.tsx`, `src/lib/i18n/content.ts` — history UI + `history.*` (append).
- `package.json` — `nanoid` (if absent).
