# 012-04 — Renderer stores + generationUpdated fan-out

Plan: `012-root-speak-history-ux.md` · Blocked by: 02 · Parallel-safe with: 03

## Goal

Make the renderer reactive to the job model: a `generationUpdated` subscription seam fed from `rpc.ts`, a single-flight `speech-store` (pending → complete autoplay / failed + retry), and a live `history-store` (per-row status patch, retry, complete-gated replay).

## Context

- Needs Phase 02's wire shapes: `speak` → `{ generationId }`, `retryGeneration(id)`, `generationUpdated { id, status }` message, `GenerationSummary.status`.
- **Fan-out seam (no store import cycle):** mirror `src/features/speech/services/omnivoice-setup-progress.ts` exactly — create `src/features/speech/services/generation-updates.ts` exporting `onGenerationUpdated(cb): () => void` + `emitGenerationUpdated(msg)`. In `src/lib/rpc.ts`, register the `generationUpdated` webview message handler to call `emitGenerationUpdated(...)` (thin forward — no store import there, same as `omniVoiceSetupProgress`).
- **Where stores subscribe:** call `onGenerationUpdated(handler)` once at store-module init (inside the zustand creator), so updates land even while a screen is unmounted (spec: History stays live "across navigating away and back"). zustand stores are module singletons; the speech-store loads with the initial route, history-store loads on first History import (its `fetch()` on mount backfills anything missed before subscription).
- **Testing posture:** these stores touch `URL.createObjectURL`/RPC and have **no existing unit tests** (`speech-store.ts`/`history-store.ts` aren't in the suite) — follow that convention; the behavior is covered by Phase 02's L1 + Phase 05's app walk. **Exception:** extract the history list→rows reducer as a pure function and unit-test it (cheap, per `.claude/skills/tdd/SKILL.md`): `applyGenerationUpdate(rows, { id, status }) → rows'` (patch a matching row's status; return unchanged if absent). Co-locate `history-store.test.ts` for just that pure fn.
- Current `speech-store.ts`: `SpeechStatus = idle|synthesizing|playing|error`; `speak()` awaits bytes, wraps a blob URL, keeps `lastBytes` for Save; blob-URL hygiene already handled. Current `history-store.ts`: paginated `rows`, single `replay()` blob URL, `deleteOne()`; over-fetch-by-one paging.
- P1: keep a **≥300 ms visible floor** on the kick-off acknowledgement — the "generating…" state must stay rendered ≥300 ms from the Speak click even if the synth settles fast (rare, but guards a flicker).

## Steps

- [ ] **`generation-updates.ts`:** new seam (`onGenerationUpdated`/`emitGenerationUpdated`) — copy `omnivoice-setup-progress.ts` shape.
- [ ] **`rpc.ts`:** add `generationUpdated: (msg) => emitGenerationUpdated(msg)` to the webview `messages` handlers (import only the emitter).
- [ ] **`speech-store.ts`:**
  - Track the in-flight job: add `pendingId?: string` and a `kickoffAt` timestamp; add a `failedId?: string` for Retry. Reframe status to include the pending/generating state (reuse `synthesizing` label or add `pending` — keep the screen's "generating…" copy).
  - `speak()`: guard empty text + single-flight (`pendingId` set → return). Set the pending/generating state + `kickoffAt = Date.now()`; call `speechApi.speak(params)` → set `pendingId = generationId`. Do NOT await bytes.
  - `retry()`: if `failedId`, single-flight-guard, `speechApi.retryGeneration(failedId)`, set `pendingId = failedId`, clear error.
  - Subscribe (`onGenerationUpdated`) at store init: when `id === pendingId` →
    - `complete`: `getAudio(id)` → rebuild Uint8Array → revoke prior `audioUrl`, set new `audioUrl` + `lastBytes`, status idle, clear `pendingId`/`failedId`. Enforce the **≥300 ms floor**: if `Date.now() - kickoffAt < 300`, defer this transition with a short `setTimeout`.
    - `failed`: status error (generic `SYNTH_FAILED` copy), set `failedId = id`, drop any stale `audioUrl`/`lastBytes`, clear `pendingId`.
    - `pending`: ignore (self-initiated).
  - Keep `save()`/`reset()` (reset also clears `pendingId`/`failedId`).
- [ ] **`history-store.ts`:**
  - `rows` now carry `status` (from the summary). Extract + use the pure `applyGenerationUpdate(rows, msg)` reducer.
  - Subscribe (`onGenerationUpdated`) at store init: if the `id` is in `rows` → patch its status in place (a `complete` row becomes replay-able; a `failed` row shows Retry). If the `id` is absent **and** `page === 1` → `fetch()` (a brand-new `pending` row surfaces at top); if absent and `page > 1` → ignore.
  - Add `retry(id)`: `speechApi.retryGeneration(id)`; optimistically patch that row → `pending` (the push will confirm). Single-flight per row (guard if already `pending`).
  - `replay(id)`: only meaningful for `complete` rows — the screen gates this, but keep the existing `getAudio` error handling (`getAudio` now rejects non-complete with `GENERATION_NOT_COMPLETE`).
  - Keep paging/`deleteOne`/blob-URL hygiene; `deleteOne` still works for `failed`/`pending` rows.
- [ ] **`history-store.test.ts`:** unit-test `applyGenerationUpdate` (patch match, no-op on absent, status values).

## Done when

- `bun test` green incl. the `applyGenerationUpdate` reducer test.
- `bun run typecheck` passes.
- `rpc.ts` forwards `generationUpdated` via the seam (no store import); both stores subscribe at init.
- speech-store: single-flight `speak`/`retry`, pending state, ≥300 ms floor, complete→autoplay-fetch, failed→error+retry. history-store: live row-status patch / page-1 refetch, per-row `retry`.

## Touches

- `src/features/speech/services/generation-updates.ts` — new seam.
- `src/lib/rpc.ts` — `generationUpdated` forward.
- `src/features/speech/stores/speech-store.ts` — job-model state + subscription + ≥300 ms floor + retry.
- `src/features/history/stores/history-store.ts` (+ `.test.ts`) — status rows, `applyGenerationUpdate`, subscription, `retry`.
