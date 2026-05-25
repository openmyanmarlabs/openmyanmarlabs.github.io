# 011-03 — sherpa-onnx engine (spike + implement)

Plan: `011-root-open-myanmar-speech.md` · Blocked by: 02 · Parallel-safe with: —

## Goal

Prove `sherpa-onnx-node` loads + synthesizes Burmese in the bun process, then leave behind a working, bundled `SherpaEngine` (the default, always-available, offline engine) plus the shared `TtsEngine` interface. **This is the headline de-risk gate** — settle it before phase 04 builds the pipeline on top.

## Context

- **Risk (don't skip the spike):** N-API-addon-under-Bun compatibility is unverified. Step 1 is a throwaway script that just `require`/`import`s `sherpa-onnx-node` in the bun process and runs one Burmese sentence → WAV. If it loads + synthesizes, keep it. **If it crashes/segfaults under Bun, switch to the fallback in this same phase:** spawn the sherpa-onnx CLI binary as a subprocess (`Bun.spawn`, read WAV from stdout/temp file). The `TtsEngine` interface hides which path is used.
- **Deps:** `bun add sherpa-onnx-node` + the platform addon `sherpa-onnx-darwin-arm64` (dev machine is M4). Other platforms later.
- **Model:** `vits-mms-mya` (Facebook MMS Burmese VITS, converted for sherpa-onnx — from the k2-fsa/sherpa-onnx pre-trained models). Files: `model.onnx`, `tokens.txt`, any lexicon/data dir. Vendor it under e.g. `apps/open-myanmar-speech/resources/models/vits-mms-mya/`; `.gitignore` the large `.onnx` (document the fetch in README) or git-lfs. **Confirm the model dir name + required files against sherpa-onnx docs before wiring.**
- **Bundling (consult `electrobun-docs-reader` first):** template bundles views via Vite → `scripts/post-build.ts` (no `build.copy`). Extend `post-build.ts` to `cpSync(modelDir, join(resourcesPath, "models/vits-mms-mya"), { recursive: true })` into the bundle `Resources`. Resolve at runtime: prod via `PATHS.RESOURCES_FOLDER` (from `electrobun/bun`), dev via the vendored local path. **Never write into the bundle at runtime** (code-signing). If the addon needs a writable model path, copy the model dir to `Utils.paths.userData/models/` on first run (`mkdirSync(..., {recursive:true})`). KB: `apis/paths.md`, `apis/bundled-assets.md`, `apis/cli/build-configuration.md`, `apis/utils.md`.
- **Interface (`src/bun/tts/engine.ts`):**
  ```ts
  export interface SynthRequest {
    text: string;
    voicePresetId?: string;
    speed: number;
  }
  export interface SynthResult {
    bytes: Uint8Array;
    format: "wav";
    sampleRate: number;
  }
  export interface EngineDetect {
    available: boolean;
    reason?: string;
  } // reason = stable code, not localized
  export interface TtsEngine {
    id: string; // "sherpa" | "omnivoice"
    label: { en: string; my: string };
    detect(): Promise<EngineDetect>;
    synthesize(req: SynthRequest): Promise<SynthResult>; // synthesizes ONE chunk
  }
  ```
- `SherpaEngine` = always available (`detect()` → `{available:true}` once the addon + model load; `{available:false, reason:"SYNTH_FAILED"}` only if load fails). Single voice → ignores `voicePresetId`. `speed` maps to the VITS length/speed param (sherpa `lengthScale` ≈ `1/speed`). Output ~16 kHz WAV. Chunking/concatenation is NOT here — the engine does one chunk; phase 04's service chunks + concats.
- This phase isn't unit-tested (native addon / real synthesis) — it's verified by the spike run + a one-sentence smoke. Say so; don't mock the addon.

## Steps

- [ ] Consult `electrobun-docs-reader` to confirm `PATHS.RESOURCES_FOLDER` + `Utils.paths.userData` + post-build copy approach.
- [ ] `bun add sherpa-onnx-node sherpa-onnx-darwin-arm64`. Vendor `vits-mms-mya` + `.gitignore`/document.
- [ ] **Spike:** throwaway `src/bun/tts/_spike.ts` — load the addon, synthesize one Burmese sentence, write a `.wav`, play it. Record: addon works under Bun? quality acceptable? (settles the `mms-tts-mya` open-q). If broken → implement the CLI-subprocess fallback instead.
- [ ] Define `TtsEngine` interface in `src/bun/tts/engine.ts`.
- [ ] Implement `src/bun/tts/sherpa-engine.ts` → `createSherpaEngine(deps)` (deps: resolved model path): `detect()` + `synthesize()` (Burmese Unicode → WAV bytes, `speed` → length param).
- [ ] Extend `scripts/post-build.ts` to copy the model into bundle Resources; add runtime path resolution (dev vs prod) + first-run copy-to-userData if the addon needs a writable path.
- [ ] Smoke: a small bun script calls `createSherpaEngine(...).synthesize(...)` → playable WAV. Remove `_spike.ts`.

## Done when

- `createSherpaEngine` synthesizes a Burmese sentence to playable ~16 kHz WAV bytes in the bun process (or via the documented CLI-subprocess fallback) — both dev and built app.
- Model resolves correctly in dev and in the built bundle; nothing writes into the bundle at runtime.
- Spike outcome recorded: addon-vs-fallback decision + `mms-tts-mya` quality note + chosen `speed`→param mapping.
- `bun run typecheck` clean.

## Touches

- `src/bun/tts/engine.ts`, `src/bun/tts/sherpa-engine.ts` — interface + default engine.
- `scripts/post-build.ts` — bundle the model dir.
- `electrobun.config.ts` — `asarUnpack` for `*.node` + model only if `useAsar` is on.
- `package.json` — `sherpa-onnx-node`, `sherpa-onnx-darwin-arm64`.
- `resources/models/vits-mms-mya/**` (+ `.gitignore`) — vendored model.
