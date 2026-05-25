# 013-04 — RPC wiring + L1 e2e

Plan: `013-root-qwen3-tts-engine.md` · Blocked by: 02, 03 · Parallel-safe with: 05

## Goal

Wire the Qwen3-TTS engine into the main-process dependency graph and add an L1 backend-e2e gate covering both engines.

## Context

- `src/bun/rpc/omnivoice-handlers.ts` — `createOmniVoiceHandlers(deps)` pattern: pure map, no electrobun import, transport-free seam. Mirror as `createQwen3TtsHandlers(deps)`. Handlers: `setupQwen3Tts`, `cancelQwen3TtsSetup`, `listQwen3TtsVoicePresets`. Same fire-and-forget pattern for setup (kick off async, return `{ ok: true }` immediately).
- `src/bun/rpc/app-rpc.ts` — `defineRPC` + `createAppRpc` wiring file that connects RPC wire entries to handler functions. Add the three new handlers here.
- `src/bun/index.ts` — main entry point. Currently: creates `userData/omnivoice/{bin,env,model,tmp}` dirs, builds OmniVoice sidecar/setup/engine, calls `createTtsService([omniVoiceEngine])`. Needs: add `userData/qwen3-tts/{bin,env,model,tmp}` dirs, build Qwen3-TTS sidecar/setup/engine, pass both engines, register `qwen3TtsHandlers` in `createAppRpc`, register kill on quit.
- `src/bun/services/tts-service.ts` — already accepts `TtsEngine[]`; no changes needed.
- `src/bun/rpc/speech-handlers.ts` — existing speech RPC for reference on L1 test pattern.
- `.claude/skills/backend-e2e/SKILL.md` — read before writing tests. L1 = real handler map → service → engine chain via fake/in-memory deps, no electrobun import.
- `.claude/skills/tdd/SKILL.md` — read for test conventions (`createTestDb`, co-located `*.test.ts`). Do NOT import `migrate.ts` in tests.
- Phase 02 exports: `createQwen3TtsSidecar`, `createQwen3TtsSetup`, `createQwen3TtsEngine`.
- Phase 02 presets export: `setQwen3TtsPresetsDir`.

## Steps

- [ ] Create `src/bun/rpc/qwen3-tts-handlers.ts` — `createQwen3TtsHandlers({ setup })` returning a plain map with three handlers:
  - `setupQwen3Tts` — fire-and-forget: calls `setup.run()` without await, returns `{ ok: true }`. Mirror exactly how `omnivoice-handlers.ts` does it.
  - `cancelQwen3TtsSetup` — calls `setup.cancel()`, returns `{ ok: true }`.
  - `listQwen3TtsVoicePresets` — calls `setup.listPresets()` (or equivalent from phase 02), returns `VoicePresetSummary[]`.
  - No `electrobun` import anywhere in this file.
- [ ] Update `src/bun/rpc/app-rpc.ts` — import `createQwen3TtsHandlers` and wire the three handlers alongside the existing OmniVoice handlers in `createAppRpc`.
- [ ] Update `src/bun/index.ts`:
  - Create `userData/qwen3-tts/{bin,env,model,tmp}` dirs (same `fs.mkdirSync(..., { recursive: true })` pattern as OmniVoice dirs).
  - Import and instantiate `createQwen3TtsSidecar`, `createQwen3TtsSetup`, `createQwen3TtsEngine` from phase 02.
  - Call `setQwen3TtsPresetsDir(userData/qwen3-tts/model)` (or equivalent from phase 02 presets).
  - Wire `qwen3TtsSetupProgress` push event — same `setup.on("progress", …)` → `webview.send("qwen3TtsSetupProgress", …)` pattern as `omniVoiceSetupProgress`.
  - Pass `[omniVoiceEngine, qwen3TtsEngine]` to `createTtsService`.
  - Register `qwen3TtsSidecar.kill()` in both `before-quit` and `process.on("exit")` hooks alongside the OmniVoice kill.
  - Register `qwen3TtsHandlers` in `createAppRpc`.
- [ ] Read `.claude/skills/backend-e2e/SKILL.md` before writing tests.
- [ ] Write `src/bun/rpc/qwen3-tts-handlers.test.ts` — L1 e2e, instantiate real `createQwen3TtsHandlers` with a fake `setup` object (plain object with `run`, `cancel`, `listPresets` as `mock()` / spy fns). Assert:
  - `setupQwen3Tts({})` returns `{ ok: true }` and called `setup.run()`.
  - `cancelQwen3TtsSetup({})` returns `{ ok: true }` and called `setup.cancel()`.
  - `listQwen3TtsVoicePresets({})` resolves to an array.
- [ ] Edit `src/bun/services/tts-service.test.ts` — add a test: construct `createTtsService([fakeOmniVoice, fakeQwen3Tts])` where `fakeQwen3Tts` has `id: "qwen3-tts"`; call `listEngines()`; assert result has length 2 and the second entry has `id: "qwen3-tts"`.
- [ ] Run `bun test` — all tests green.
- [ ] Run `bun typecheck` — zero errors.

## Done when

- `bun test` green, including new `qwen3-tts-handlers.test.ts` suite and the widened `tts-service.test.ts` test.
- `bun typecheck` clean.
- `createTtsService` receives `[omniVoiceEngine, qwen3TtsEngine]` in `index.ts`.
- `userData/qwen3-tts/{bin,env,model,tmp}` dirs created on startup.
- Qwen3-TTS sidecar kill registered in both `before-quit` and `process.on("exit")`.
- No electrobun import in `qwen3-tts-handlers.ts`.

## Touches

- `apps/open-myanmar-speech/src/bun/rpc/qwen3-tts-handlers.ts` — new; pure handler map for three Qwen3-TTS RPC methods.
- `apps/open-myanmar-speech/src/bun/rpc/qwen3-tts-handlers.test.ts` — new; L1 e2e for handler map with fake setup deps.
- `apps/open-myanmar-speech/src/bun/rpc/app-rpc.ts` — edit; import + wire `createQwen3TtsHandlers`.
- `apps/open-myanmar-speech/src/bun/index.ts` — edit; dirs, sidecar/setup/engine init, progress push, two-engine service call, quit lifecycle.
- `apps/open-myanmar-speech/src/bun/services/tts-service.test.ts` — edit; add two-engine `listEngines` test with `id: "qwen3-tts"` assertion.
