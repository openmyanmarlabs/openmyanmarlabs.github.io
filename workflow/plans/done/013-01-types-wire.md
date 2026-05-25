# 013-01 — Types & wire contract

Plan: `013-root-<slug>.md` · Blocked by: — · Parallel-safe with: 03

## Goal

Widen shared types and the RPC wire contract to carry Qwen3-TTS — before any engine code is written.

## Context

- `apps/open-myanmar-speech/src/shared/types.ts` — source of truth for all wire types. Currently: `EngineId = "omnivoice"` (single-member union), `SpeakParams` uses `EngineId`, `OmniVoiceSetupPhase`/`OmniVoiceSetupProgress` defined, `AppRPC` bun requests has `setupOmniVoice`, `cancelOmniVoiceSetup`, `listVoicePresets`; webview messages has `omniVoiceSetupProgress`.
- `apps/open-myanmar-speech/src/bun/tts/engine.ts` — defines `SynthRequest { text, voicePresetId?, speed }`, `SynthResult`, `EngineDetect`, `TtsEngine`. No `instruction` field yet.
- OmniVoice engine ignores unknown fields on `SynthRequest` — adding `instruction?` is non-breaking, no behaviour change.
- `EngineId` widening may affect `satisfies EngineId` casts elsewhere — grep before finishing.

## Steps

- [ ] In `src/shared/types.ts`: widen `EngineId` to `"omnivoice" | "qwen3-tts"`. Update the comment above it.
- [ ] Grep codebase for `satisfies EngineId` and any literal `"omnivoice"` typed-as `EngineId` that now needs an explicit cast check. Fix any type errors surfaced.
- [ ] In `src/bun/tts/engine.ts`: add `instruction?: string` to `SynthRequest` with a brief comment (Qwen3-TTS instruction prompt; ignored by OmniVoice).
- [ ] In `src/shared/types.ts`: add `Qwen3TtsSetupPhase` union type — `"downloading-uv" | "creating-env" | "installing-mlx-audio" | "downloading-model" | "done" | "error" | "cancelled"`.
- [ ] In `src/shared/types.ts`: add `Qwen3TtsSetupProgress` interface — `{ phase: Qwen3TtsSetupPhase; progress: number; detail?: string; error?: string }`. Model after `OmniVoiceSetupProgress`.
- [ ] In `AppRPC` bun `requests` block, append three new entries under the OmniVoice block:
  - `setupQwen3Tts: { params: {}; response: { ok: true } }`
  - `cancelQwen3TtsSetup: { params: {}; response: { ok: true } }`
  - `listQwen3TtsVoicePresets: { params: {}; response: VoicePresetSummary[] }`
- [ ] In `AppRPC` webview `messages` block, append: `qwen3TtsSetupProgress: Qwen3TtsSetupProgress`.
- [ ] Run `bun typecheck` (or `bunx tsc --noEmit`) from the app root. Fix any errors before marking done.

## Done when

- `bun typecheck` passes with zero errors.
- `EngineId` is `"omnivoice" | "qwen3-tts"`.
- `SynthRequest` has `instruction?: string`.
- `Qwen3TtsSetupPhase` and `Qwen3TtsSetupProgress` exported from `src/shared/types.ts`.
- `AppRPC` bun requests includes `setupQwen3Tts`, `cancelQwen3TtsSetup`, `listQwen3TtsVoicePresets`.
- `AppRPC` webview messages includes `qwen3TtsSetupProgress`.

## Touches

- `apps/open-myanmar-speech/src/shared/types.ts` — widen `EngineId`, add `Qwen3TtsSetupPhase`, `Qwen3TtsSetupProgress`, three bun requests, one webview message.
- `apps/open-myanmar-speech/src/bun/tts/engine.ts` — add `instruction?: string` to `SynthRequest`.
