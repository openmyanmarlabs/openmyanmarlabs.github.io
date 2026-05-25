# 012-02 — Backend job-model (speak detach, retry, push, L1)

Plan: `012-root-speak-history-ux.md` · Blocked by: 01 · Parallel-safe with: 03

## Goal

Turn `speak` into a fire-and-forget job (insert pending → return `{ generationId }` → detached synth → flip + push), add `retryGeneration`, add the `generationUpdated { id, status }` webview push, wire the orphan reconcile on boot, and update the handler unit + L1 e2e suites for the new shapes.

## Context

- TDD + L1 phase — units red→green per `.claude/skills/tdd/SKILL.md`; the L1 backend-e2e gate per `.claude/skills/backend-e2e/SKILL.md`. **`createTestDb()` + DI; do NOT import `migrate.ts` in tests.**
- **Transport-free seam stays:** `createSpeechHandlers(deps)` in `src/bun/rpc/speech-handlers.ts` is a pure map, NO `electrobun` import. The native push effect is **injected** as a plain `notify` fn (mirrors how `onProgress` is injected into `createOmniVoiceSetup` and how `writeFile`/`reveal` are injected here). `app-rpc.ts` / `index.ts` compose the real electrobun glue.
- Push pattern to mirror: `index.ts` already pushes via `mainWindow.webview.rpc?.send.omniVoiceSetupProgress(progress)` (line ~343); the message is declared in `AppRPC.webview.messages` (`src/shared/types.ts`) and forwarded renderer-side in `src/lib/rpc.ts`.
- Detached-task pattern to mirror: `omnivoice-handlers.ts` `setupOmniVoice` does `void setup.run().catch(() => {})` then returns immediately — copy this discipline so a synth rejection never becomes an unhandled rejection / process crash.
- Current `speak` (`speech-handlers.ts`) is blocking: `await ttsService.speak()` then `generationService.create()` then returns `SpeakResponse` (bytes + generationId). `app-rpc.ts` sets `maxRequestTime: 5000` — this IS the P2 timeout (confirms the spec's open question; job model removes the dependency on it). Don't raise it.
- `ttsService.speak(params)` (`src/bun/services/tts-service.ts`) returns `SpeakResult { bytes, format, sampleRate, truncated }` and throws `ENGINE_UNAVAILABLE`/`SETUP_REQUIRED`/`SYNTH_FAILED`. In the job model these throws happen INSIDE the detached task → `markFailed` (the main screen already gates Speak on availability, so a Speak-time `SETUP_REQUIRED` is not expected; `truncated` is now dropped from the wire — handled client-side in Phase 05).
- speech-api: `src/features/speech/services/speech-api.ts` (`speak` rebuilds a Uint8Array today — that goes away).

## Steps

- [ ] **Types (`shared/types.ts`):**
  - `GenerationSummary` gains `status: GenerationStatus` (type from Phase 01). Keep `audioPath` out of the summary (renderer fetches bytes lazily).
  - Change `AppRPC.bun.requests.speak.response` to `{ generationId: string }` (drop bytes/format/sampleRate/truncated). Repurpose or remove `SpeakResponse`/the unused `SpeakResult.generationId`.
  - Add `AppRPC.bun.requests.retryGeneration: { params: { id: string }; response: { ok: true } }`.
  - Add `AppRPC.webview.messages.generationUpdated: { id: string; status: GenerationStatus }` (declare a `GenerationUpdated` interface for reuse).
- [ ] **Handler deps:** add `notify: (msg: { id: string; status: GenerationStatus }) => void` to `SpeechHandlerDeps`.
- [ ] **`speak` (job model):** `createPending({ text, engineId, voicePresetId, speed })` → `notify({ id, status: "pending" })` → kick a **detached** task: `void (async () => { try { const r = await ttsService.speak(params); await generationService.markComplete(id, r.bytes); notify({ id, status: "complete" }); } catch (e) { console.error(...); await generationService.markFailed(id).catch(() => {}); notify({ id, status: "failed" }); } })();` → `return { generationId: id }`. No WAV bytes returned. No synchronous availability gate (a bad engine surfaces as `failed`).
- [ ] **`retryGeneration`:** read the row (`generationService.getById(id)`); if missing → `{ ok: true }` no-op. Else `markPending(id)` → `notify({ id, "pending" })` → same detached synth using the row's `text`/`engineId`/`voicePresetId`/`speed` → settle + push. Returns `{ ok: true }`.
- [ ] **`toSummary`:** map `status` through.
- [ ] **Unit test (`speech-handlers.test.ts`):** with fake services/spies (no real DB) — `speak` returns `{ generationId }` synchronously, calls `createPending` (not `create`), pushes `pending`; after a microtask flush the detached task calls `markComplete` + pushes `complete`; a throwing `ttsService.speak` → `markFailed` + pushes `failed`. `retryGeneration` flips an existing row to pending + re-synths; no-ops a missing id. (Flush the detached task by awaiting the injected fake's resolution / a `setTimeout(0)`.)
- [ ] **speech-api:** `speak(params)` now returns `{ generationId }` (no Uint8Array rebuild). Add `retryGeneration(id): Promise<{ ok: true }>`.
- [ ] **index.ts wiring:** inject `notify: (msg) => mainWindow.webview.rpc?.send.generationUpdated(msg)` into `createSpeechHandlers(...)` (lazy `mainWindow` ref, like `onProgress`). After `prepareDatabase(...)` and before the window opens, run the boot reconcile: `generationService.failPending()` (orphaned in-flight synths from a previous run → `failed`).
- [ ] **L1 e2e (`speech-handlers.e2e.test.ts`):** rewrite for the job model over the REAL assembled stack (handlers → tts-service → generation-service → repo → `createTestDb()` + tmp audioDir; fake `TtsEngine` emitting real WAV via `encodeWav`; `notify`/`writeFile`/`reveal` as spies):
  - `speak` returns `{ generationId }`; a `pending` row exists immediately (no file yet, `audioPath` null); the `pending` push fired.
  - After the detached task settles, the row is `complete`, the `<id>.wav` exists, `getAudio` round-trips the bytes, and a `complete` push fired.
  - A throwing engine → row settles `failed`, no file, `failed` push fired, `getAudio` rejects `GENERATION_NOT_COMPLETE`.
  - `retryGeneration` on a failed row re-runs it to `complete`.
  - Keep the existing `listGenerations` ordering/pagination, `getAudio` traversal-reject, `deleteGeneration`, and `saveAudio` coverage (now rows carry `status`).

## Done when

- `bun test` green: handler units (pending→complete, pending→failed, retry, push fired per transition) **and** the L1 suite (assembled stack, real DB/file, both transitions + retry).
- `bun run typecheck` passes across the app (the Phase-01 `create` removal is now fully reconciled).
- `speak` returns only `{ generationId }`; `retryGeneration` + `generationUpdated` exist in `AppRPC`; `index.ts` injects `notify` and calls `failPending()` on boot.

## Touches

- `src/shared/types.ts` — `speak` response, `retryGeneration`, `generationUpdated`, `GenerationSummary.status`.
- `src/bun/rpc/speech-handlers.ts` (+ `.test.ts`) — job-model `speak`, `retryGeneration`, `notify` dep, `toSummary` status.
- `src/bun/rpc/speech-handlers.e2e.test.ts` — rewritten L1 gate.
- `src/features/speech/services/speech-api.ts` — `speak` shape; `retryGeneration`.
- `src/bun/index.ts` — inject `notify`; boot `failPending()`.
