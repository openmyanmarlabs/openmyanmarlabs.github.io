# 013-02 — Qwen3-TTS bun core

Plan: `013-root-qwen3-tts-engine.md` · Blocked by: 01 · Parallel-safe with: 03, 05

## Goal

All bun-side Qwen3-TTS modules — detect, presets, sidecar, setup, engine — mirroring the OmniVoice pattern; TDD on pure logic; `bun typecheck` clean.

## Context

- TDD phase — follow `.claude/skills/tdd/SKILL.md`. `bun test`, co-located `*.test.ts`. Pure logic only; sidecar/setup/real synthesis not unit-testable (verified at phase 04 / manual).
- **Mirror OmniVoice shape** (the executed implementation, not the old plan):
  - `src/bun/tts/omnivoice/detect.ts` — split pure/impure: `decideAvailability(probe)` pure + TDD; `detect(deps)` impure wrapper.
  - `src/bun/tts/omnivoice/presets.ts` — `VoicePreset`, `VoicePresetInfo`, `ResolvedVoicePreset`, `listVoicePresets()`, `getPreset(id)`, `setPresetsDir()`.
  - `src/bun/tts/omnivoice/sidecar.ts` — `OmniVoiceSidecar`, `SidecarSynthRequest`, `SidecarSynthResult`, `createOmniVoiceSidecar(deps)`. JSON-Lines over stdin/stdout.
  - `src/bun/tts/omnivoice/setup.ts` — `createOmniVoiceSetup(deps)` phases: `downloading-uv` → `creating-env` → `installing-<pkg>` → `downloading-model`.
  - `src/bun/tts/omnivoice-engine.ts` — `createOmniVoiceEngine(deps)`, implements `TtsEngine`.
- **Qwen3-TTS differences vs OmniVoice:**
  - **detect:** only valid on `darwin` + `arm64`. Decision: `platformArch !== "darwin-arm64"` → `{ available: false, reason: "MAC_ONLY" }`; not provisioned → `{ available: false, reason: "SETUP_REQUIRED" }`; provisioned → `{ available: true }`. No `slow` flag — MLX is always fast on Apple Silicon.
  - **presets:** resource dir `resources/qwen3-tts/presets/`. Default id `"male-clear-natural"` (same bootstrap clip as OmniVoice for v1).
  - **sidecar:** `SidecarSynthRequest` gains `instruction: string` (empty string = no instruction). JSON wire request gains `instruction` field. Temp file prefix `qwen3tts-` (was `omnivoice-`).
  - **setup:** install phase is `installing-mlx-audio` (not torch/omnivoice). Pin `mlx-audio` version at implementation time (check `mlx-audio` release page). Warm step: `python -c "from mlx_audio.tts.models import load_model; load_model('Qwen/Qwen3-TTS-12Hz-0.6B-Base')"` — confirm exact API against mlx-audio docs before wiring. Deps type: `Qwen3TtsSetupDeps`.
  - **engine:** id `"qwen3-tts"`, label `{ en: "Qwen3-TTS (voice clone)", my: "Qwen3-TTS (အသံပုံတူ)" }`. `synthesize()` passes `req.instruction ?? ""` to sidecar.
- **Shared types** (`src/shared/types.ts`) extended by phase 01 — `Qwen3TtsSetupPhase` union already present; import it here.
- Open item: confirm the exact `mlx_audio` model-load API before wiring `setup.ts`; if the import path differs, update `downloading-model` warm step in-place.

## Steps

- [ ] Read `src/bun/tts/omnivoice/detect.ts` + `omnivoice/presets.ts` + `omnivoice/sidecar.ts` + `omnivoice/setup.ts` + `omnivoice-engine.ts` — understand exact shapes before writing anything.
- [ ] (TDD — red→green→refactor) `src/bun/tts/qwen3-tts/detect.ts`: `Qwen3TtsProbe { platformArch: string; envProvisioned: boolean }`. Pure `decideQwen3TtsAvailability(probe)` → `EngineDetect`. Impure `detectQwen3Tts(deps)` (reads `process.platform`/`process.arch`, checks provisioned path).
- [ ] `src/bun/tts/qwen3-tts/detect.test.ts`: three branches — `platformArch !== "darwin-arm64"` → `MAC_ONLY`; darwin-arm64 + not provisioned → `SETUP_REQUIRED`; provisioned → `{ available: true }`. Run `bun test` green.
- [ ] (TDD — red→green→refactor) `src/bun/tts/qwen3-tts/presets.ts`: mirror `omnivoice/presets.ts`. Default id `"male-clear-natural"`. Presets dir `resources/qwen3-tts/presets/`. Export `listVoicePresets()`, `getPreset(id)`, `setPresetsDir()`, and the three types.
- [ ] `src/bun/tts/qwen3-tts/presets.test.ts`: `listVoicePresets()` returns ≥ 1 entry; `getPreset("male-clear-natural")` returns the default; `getPreset("unknown-id")` returns `undefined`. Run `bun test` green.
- [ ] `src/bun/tts/qwen3-tts/sidecar.ts`: mirror `omnivoice/sidecar.ts`. Add `instruction: string` to `SidecarSynthRequest`; include `instruction` in JSON wire payload. Temp file prefix `qwen3tts-`. Export `Qwen3TtsSidecar`, `SidecarSynthRequest`, `SidecarSynthResult`, `createQwen3TtsSidecar(deps)`.
- [ ] `src/bun/tts/qwen3-tts/setup.ts`: mirror `omnivoice/setup.ts`. Phases: `downloading-uv` → `creating-env` → `installing-mlx-audio` → `downloading-model`. Pin `mlx-audio==<version>` (look up latest stable at impl time). Warm step runs `load_model('Qwen/Qwen3-TTS-12Hz-0.6B-Base')`. Deps type `Qwen3TtsSetupDeps`. Import `Qwen3TtsSetupPhase` from `@/shared/types`.
- [ ] `src/bun/tts/qwen3-tts-engine.ts`: `createQwen3TtsEngine(deps)` implementing `TtsEngine`. id `"qwen3-tts"`, label as above. `synthesize()` resolves preset, passes `req.instruction ?? ""` to sidecar. `detect()` delegates to `detectQwen3Tts`.
- [ ] `bun typecheck` — zero errors.

## Done when

- `detect.test.ts` green: `MAC_ONLY` for non-darwin-arm64, `SETUP_REQUIRED` when not provisioned, `available:true` when provisioned.
- `presets.test.ts` green: list ≥ 1 preset, `getPreset` returns default, `getPreset("unknown")` returns `undefined`.
- Sidecar mirrors OmniVoice shape with added `instruction: string` field in request + wire payload, and `qwen3tts-` temp prefix.
- `bun typecheck` clean — no new type errors.

## Touches

- `src/bun/tts/qwen3-tts/detect.ts` — new; pure + impure detect.
- `src/bun/tts/qwen3-tts/detect.test.ts` — new; TDD three branches.
- `src/bun/tts/qwen3-tts/presets.ts` — new; preset registry.
- `src/bun/tts/qwen3-tts/presets.test.ts` — new; TDD list + get.
- `src/bun/tts/qwen3-tts/sidecar.ts` — new; JSON-Lines sidecar with `instruction`.
- `src/bun/tts/qwen3-tts/setup.ts` — new; uv → env → mlx-audio → model.
- `src/bun/tts/qwen3-tts-engine.ts` — new; `TtsEngine` impl.
