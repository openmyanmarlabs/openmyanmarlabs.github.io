# 011-04 — TTS pipeline service + RPC contract (TDD + L1 seam)

Plan: `011-root-open-myanmar-speech.md` · Blocked by: 03 · Parallel-safe with: —

## Goal

The synthesis backbone: pure text-chunking + WAV-concat utils, a `tts-service` that orchestrates `listEngines()` + `speak()` over a set of engines, transport-free RPC handlers (`listEngines`, `speak`, `saveAudio`), and the core `AppRPC` contract the UI phases call. Wired with the real `SherpaEngine` (phase 03). **This phase owns the core RPC contract** so UI phases only append.

## Context

- **TDD the utils + service** — read `.claude/skills/tdd/SKILL.md`: in-memory + DI, co-located `*.test.ts`, `bun test`. The engines are impure (native/subprocess) so test the service with **fake engines** (plain objects implementing `TtsEngine`) — that's the whole point of the phase-03 interface.
- **Handlers must be transport-free for e2e** — read `.claude/skills/backend-e2e/SKILL.md`. Pure `createSpeechHandlers(deps)` → plain map (no `electrobun/bun` import); register it in the thin `src/bun/rpc/app-rpc.ts` wrapper (mirror the template's old `createAuthHandlers` seam + the surviving `update-handlers.ts`).
- **Chunking** (`src/bun/lib/chunk-text.ts`, TDD): split Burmese text on sentence boundaries (`။`, `၊`) + newlines into chunks; soft cap (e.g. 5,000 chars total) returning a `truncated` flag + the kept text. Never split mid-grapheme. Empty/whitespace → no chunks.
- **WAV concat** (`src/bun/lib/wav.ts`, TDD): parse a minimal PCM WAV header (sampleRate, channels, bitsPerSample, data offset/len); `concatWav(parts: Uint8Array[])` → one WAV with summed data + fixed header. Assert: same-rate parts concat to correct total data length + valid header; single part round-trips; rejects mismatched rates.
- **tts-service** (`src/bun/services/tts-service.ts`, TDD with fakes): `createTtsService(engines: TtsEngine[])`:
  - `listEngines()` → `await` each engine's `detect()` → `EngineInfo[] = [{ id, label, available, reason? }]` (reason is the stable code; renderer localizes). Order: sherpa first.
  - `speak({ engineId, text, voicePresetId?, speed })` → resolve engine by id (unknown → throw `"ENGINE_UNAVAILABLE"`); `detect()` → if not available throw its reason (`"SETUP_REQUIRED"` / `"ENGINE_UNAVAILABLE"`); `chunkText` → `synthesize` each chunk → `concatWav` → `{ bytes, format:"wav", sampleRate, truncated }`. Any engine throw → `"SYNTH_FAILED"`. Tests: unknown id, unavailable engine (each code), single + multi-chunk concat, truncation flag, synth failure mapping.
- **Handlers** (`src/bun/rpc/speech-handlers.ts`, transport-free): `createSpeechHandlers({ ttsService, paths })`:
  - `listEngines()` → `ttsService.listEngines()`.
  - `speak(params)` → `ttsService.speak(params)`; normalize thrown messages → stable codes.
  - `saveAudio({ bytes, name })` → `Bun.write(join(Utils.paths.downloads, sanitize(name)), bytes)` → `Utils.showItemInFolder(path)` → `{ path }`. (Manual "Save" → Downloads. History's on-disk persistence is phase 06.)
- **Wire types** (`src/shared/types.ts`): `EngineInfo`, `EngineId`, `SpeakParams`, `SpeakResult`, `SpeechErrorCode = "ENGINE_UNAVAILABLE" | "SETUP_REQUIRED" | "SYNTH_FAILED"`; extend `AppRPC.bun.requests` with `listEngines`, `speak`, `saveAudio`. Add renderer wrappers in `src/lib/rpc.ts` (+ optional `src/features/speech/services/speech-api.ts`).
- DI: `src/bun/index.ts` composes `createTtsService([createSherpaEngine(...)])` → `createSpeechHandlers(...)` → spread into `createAppRpc`. (OmniVoice engine is added to this array in phase 07.)
- **Bytes over RPC:** WAV `Uint8Array` crosses the wire; KB flags marshalling overhead — fine here, watch latency on long text (verify in 09).

## Steps

- [ ] (TDD) `chunk-text.ts` + `.test.ts` — boundaries, newlines, soft cap/truncate, empty input.
- [ ] (TDD) `wav.ts` + `.test.ts` — header parse + `concatWav` (same-rate concat, single part, rate mismatch rejected).
- [ ] (TDD) `tts-service.ts` + `.test.ts` — `listEngines` mapping (fake engines) + `speak` (resolve, error codes, chunk→concat, truncation).
- [ ] `speech-handlers.ts` (transport-free) — `listEngines`/`speak`/`saveAudio` + error-code normalization.
- [ ] Extend `src/shared/types.ts` `AppRPC` + add renderer wrappers in `src/lib/rpc.ts`.
- [ ] DI in `src/bun/index.ts`: build service with `SherpaEngine`, register handlers.

## Done when

- `bun test` green: chunking, WAV concat, and `tts-service` (listEngines + speak, all error codes, multi-chunk concat, truncation).
- `speak` (sherpa) callable end-to-end from the renderer typecheck-side; returns `{ bytes, format, sampleRate, truncated }`.
- `saveAudio` writes to Downloads + reveals it.
- Handlers are transport-free maps ready for the phase-09 L1 suite; `bun run typecheck` clean.

## Touches

- `src/bun/lib/chunk-text.ts`, `src/bun/lib/wav.ts` (+ `.test.ts`).
- `src/bun/services/tts-service.ts` (+ `.test.ts`).
- `src/bun/rpc/speech-handlers.ts`, `src/bun/rpc/app-rpc.ts`.
- `src/bun/index.ts` — DI.
- `src/shared/types.ts`, `src/lib/rpc.ts` (+ `src/features/speech/services/speech-api.ts`).
