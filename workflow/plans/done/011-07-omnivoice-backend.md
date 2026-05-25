# 011-07 — OmniVoice backend (sidecar + setup + presets)

Plan: `011-root-open-myanmar-speech.md` · Blocked by: 04 · Parallel-safe with: 05, 06

## Goal

The OmniVoice engine end-to-end on the bun side: capability detection, an in-app setup flow (isolated Python env via `uv` + model download), a long-lived Python sidecar the bun process drives, the `OmniVoiceEngine` implementing `TtsEngine`, and the bundled Burmese voice-preset registry. After setup, OmniVoice synthesizes Burmese on this M4 (mps).

## Context

- **Pre-req (resolve before the presets step):** licensed Burmese reference clips + transcripts. Minimum to ship: the default **"Male — clear & natural"**. See root Notes / risks.
- **Consult `electrobun-docs-reader` first** — confirms: main process is plain Bun → use `Bun.spawn` / `Bun.spawnSync` (no Electrobun child-process API); kill the sidecar on `Electrobun.events.on("before-quit", async (e) => {…})` + a sync `process.on("exit")` fallback (KB `apis/events.md` — Linux system-quit doesn't fire `before-quit`, so the sync fallback matters); writable dirs via `Utils.paths.userData` (`mkdirSync(..., {recursive:true})`); never write into the bundle (`apis/paths.md`). Bundle presets via `scripts/post-build.ts` + `PATHS.RESOURCES_FOLDER` (like the phase-03 model).
- **Implements the phase-03 `TtsEngine` interface** (`src/bun/tts/engine.ts`) and plugs into the phase-04 `tts-service` engines array (DI in `index.ts`). The service/handlers/RPC for `speak`/`listEngines` already exist — this adds the second engine + its setup surface.
- **Capability detection** (`src/bun/tts/omnivoice/detect.ts`): is the env provisioned (env dir + model present under `userData/omnivoice/`)? is there a usable torch device (`mps`/`cuda`/`xpu`/`cpu`)? Keep the **decision logic pure + TDD'd** (given probe results → `{ available, reason }`): env missing → `{available:false, reason:"SETUP_REQUIRED"}`; no GPU/MPS → **allow + "slow" flag** (lean: `available:true`, surface a slow-warning, don't hard-disable); ready → `{available:true}`. The probes themselves (spawn `uv`/python) are impure — inject them.
- **Setup flow** (`src/bun/tts/omnivoice/setup.ts`): download `uv` (lean: download-on-setup, per-platform) → `uv venv` + install Python + `omnivoice` into `userData/omnivoice/env` → download the model into `userData/omnivoice/model`. **Emit progress** via an RPC _message_ channel (e.g. `webview.messages` or a request that streams status) and support **cancel** (kill the spawned process, clean partial dirs). One-time network; offline after. Confirm the exact `uv` + `omnivoice` install/model commands when implementing.
- **Sidecar** (`src/bun/tts/omnivoice/sidecar.ts` + a Python worker script bundled under resources): spawn the env's Python running the worker; per request pass `{ text, refClip, refText, speed }` (over stdin/JSON-lines or temp file); receive WAV bytes (stdout/temp file). **Keep it long-lived** (spawn once, reuse); pick device automatically (`mps`/`cuda`/`xpu`/`cpu`). Register the before-quit + exit kill. Output ~24 kHz WAV (engine reports its own `sampleRate`).
- **`OmniVoiceEngine`** (`src/bun/tts/omnivoice-engine.ts`): `id:"omnivoice"`, bilingual label, `detect()` (→ detect.ts), `synthesize({ text, voicePresetId, speed })` → resolve preset → sidecar call → WAV bytes. Honors `voicePresetId` + `speed` (confirm `omnivoice` speed param vs time-stretch — root open-q).
- **Preset registry** (`src/bun/tts/omnivoice/presets.ts`, light TDD on the pure lookup): curated entries `{ id, label:{en,my}, category, clipPath, transcript }`; default `"male-clear-natural"`. Clips bundled to Resources (post-build) + resolved via `PATHS`. Expose `listVoicePresets()` → `[{ id, label, category }]` (no paths over the wire) + `getPreset(id)`.
- **RPC contract** (`src/shared/types.ts`, append): `setupOmniVoice` (start; with progress messages), `cancelOmniVoiceSetup`, `listVoicePresets`. (`speak`/`listEngines` already carry OmniVoice once it's in the engines array.) Renderer wrappers in `src/lib/rpc.ts`.
- DI: add `createOmniVoiceEngine(...)` to the `tts-service` engines array in `index.ts`; `mkdirSync(userData/omnivoice, {recursive:true})`; register sidecar cleanup on before-quit/exit.
- **Not unit-testable:** the sidecar, `uv`/download, real synthesis (verified manually in phase 09, incl. the mps path). Unit-test the **pure** parts only: detect decision logic (injected probes) + preset lookup. Say so; don't mock the sidecar into a fake test.

## Steps

- [ ] Consult `electrobun-docs-reader` (spawn lifecycle, before-quit cleanup, userData, preset bundling).
- [ ] Source + vendor the default Burmese preset clip + transcript (+ any others); bundle via `post-build.ts`.
- [ ] (TDD) `detect.ts` decision logic (injected probes → `{available, reason}`: SETUP_REQUIRED, slow-allow, ready).
- [ ] (TDD-light) `presets.ts` registry + `listVoicePresets`/`getPreset`.
- [ ] `setup.ts` — uv download → env + `omnivoice` install → model download; progress messages + cancel + partial cleanup.
- [ ] `sidecar.ts` + Python worker — long-lived spawn, per-request synth, auto device pick; kill on before-quit + exit.
- [ ] `omnivoice-engine.ts` — `TtsEngine` impl (detect + synthesize via sidecar + preset).
- [ ] Extend `AppRPC` (`setupOmniVoice`, `cancelOmniVoiceSetup`, `listVoicePresets`) + renderer wrappers; DI in `index.ts` (engine in service array + cleanup hooks).
- [ ] `run`: provision via the setup path on this M4 → `listEngines` shows OmniVoice available → `speak` synthesizes Burmese (mps) with the default preset.

## Done when

- `bun test` green for the pure parts: detect decision logic (all reasons) + preset lookup.
- After setup, `listEngines()` reports OmniVoice `available:true`; before setup, `available:false, reason:"SETUP_REQUIRED"`.
- `speak({ engineId:"omnivoice", … })` synthesizes Burmese WAV on this M4 (mps) with the default preset + a speed change.
- Setup is cancellable + cleans partial dirs; sidecar is killed on quit; nothing writes into the app bundle.
- `bun run typecheck` clean.

## Touches

- `src/bun/tts/omnivoice-engine.ts`, `src/bun/tts/omnivoice/{detect,setup,sidecar,presets}.ts` (+ `.test.ts` for detect + presets).
- `resources/omnivoice/worker.py` (or similar) + `resources/omnivoice/presets/**` — bundled sidecar + clips.
- `scripts/post-build.ts` — bundle worker + presets.
- `src/bun/index.ts` — engine in service array, dirs, cleanup hooks.
- `src/shared/types.ts`, `src/lib/rpc.ts` — append setup/presets RPC.
- `package.json` — any download/extract helper if needed.
