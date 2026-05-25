# 013-05 — Renderer UI

Plan: `013-root-qwen3-tts-engine.md` · Blocked by: 01 · Parallel-safe with: 02, 03

## Goal

Add engine picker, Qwen3-TTS setup wizard, instruction field, and Qwen3-TTS preset picker to the main screen — bilingual (en/my).

## Context

**Key files (read before touching):**

- `apps/open-myanmar-speech/src/features/speech/stores/speech-store.ts` — Zustand store. Currently hardcoded `ENGINE_ID: EngineId = "omnivoice"`; holds `engines`, `presets` (OmniVoice only), `voicePresetId`. Needs: `selectedEngineId`, `instruction`, `qwen3TtsPresets`, and their setters + a `loadQwen3TtsPresets()` loader. `speak()` currently always passes `engineId: ENGINE_ID` — must branch on `selectedEngineId`.
- `apps/open-myanmar-speech/src/features/speech/pages/main-screen.tsx` — gated on `omnivoice.available` / `omnivoice.reason === "SETUP_REQUIRED"`, renders `<OmniVoiceSetup />`. No engine picker. Needs: engine picker (two tabs/buttons), engine-conditional setup wizard, instruction `<input>`, Qwen3-TTS preset `<Select>`.
- `apps/open-myanmar-speech/src/features/speech/components/omnivoice-setup.tsx` — setup wizard + `<VoicePresetPicker />`. Subscribes to `onOmniVoiceSetupProgress`; calls `speechApi.setupOmniVoice()` / `cancelOmniVoiceSetup()`. Mirror this as `qwen3-tts-setup.tsx`, subscribing to `onQwen3TtsSetupProgress` and calling `setupQwen3Tts` / `cancelQwen3TtsSetup` RPCs.
- `apps/open-myanmar-speech/src/features/speech/services/omnivoice-setup-progress.ts` — push-channel seam (`listeners` Set, `onOmniVoiceSetupProgress`, `emitOmniVoiceSetupProgress`). Create a parallel `qwen3-tts-setup-progress.ts` with the same shape, typed to `Qwen3TtsSetupProgress`.
- `apps/open-myanmar-speech/src/features/speech/services/speech-api.ts` — RPC client. Needs three new methods: `setupQwen3Tts()`, `cancelQwen3TtsSetup()`, `listQwen3TtsVoicePresets()` (same call pattern as OmniVoice equivalents). Also needs `rpc.ts` wiring for `qwen3TtsSetupProgress` webview message (emit → `emitQwen3TtsSetupProgress`); check how `omniVoiceSetupProgress` is wired in `src/lib/rpc.ts`.
- `apps/open-myanmar-speech/src/lib/i18n/content.ts` — bilingual copy tree. `my` is the source of truth; `en` is typed `Content` — keys must stay symmetric. Add `speech.enginePicker.*`, `speech.qwen3tts.*` to both. See existing `speech.omnivoice.*` as the model.
- `apps/open-myanmar-speech/src/shared/types.ts` — after phase 01: `EngineId = "omnivoice" | "qwen3-tts"`, `Qwen3TtsSetupPhase`, `Qwen3TtsSetupProgress`, `AppRPC` includes `setupQwen3Tts`, `cancelQwen3TtsSetup`, `listQwen3TtsVoicePresets` bun requests + `qwen3TtsSetupProgress` webview message.

**Tailwind v4:** project uses Tailwind CSS v4 (CSS-first, `@tailwindcss/vite`). v4 syntax differs from v3. **Before writing any Tailwind classes, query the `tailwind-docs-reader` subagent** (e.g. "v4 utility classes, conditional classes, @apply"). Use exact v4 directives — do not guess or apply v3 patterns.

**File naming:** kebab-case (`qwen3-tts-setup.tsx`), even when exporting PascalCase (`Qwen3TtsSetup`). See `apps/CLAUDE.md`.

## Steps

- [ ] **Prereq: wire the push channel.** Create `src/features/speech/services/qwen3-tts-setup-progress.ts` — mirrors `omnivoice-setup-progress.ts`, typed to `Qwen3TtsSetupProgress`. Export `onQwen3TtsSetupProgress` + `emitQwen3TtsSetupProgress`. Then open `src/lib/rpc.ts`, find where `omniVoiceSetupProgress` is wired to `emitOmniVoiceSetupProgress`, and add a parallel entry for `qwen3TtsSetupProgress` → `emitQwen3TtsSetupProgress`.

- [ ] **Extend `speech-api.ts`.** Add to `speechApi`:
  - `setupQwen3Tts(): Promise<{ ok: true }>` → `rpc().request.setupQwen3Tts({})`
  - `cancelQwen3TtsSetup(): Promise<{ ok: true }>` → `rpc().request.cancelQwen3TtsSetup({})`
  - `listQwen3TtsVoicePresets(): Promise<VoicePresetSummary[]>` → `rpc().request.listQwen3TtsVoicePresets({})`

- [ ] **Extend `speech-store.ts`.** Add to `SpeechState`:
  - `selectedEngineId: EngineId` (default `"omnivoice"`)
  - `instruction: string` (default `""`)
  - `qwen3TtsPresets: VoicePresetSummary[]` (default `[]`)
  - `setSelectedEngine(id: EngineId): void`
  - `setInstruction(text: string): void`
  - `loadQwen3TtsPresets(): Promise<void>` — load-once pattern matching `loadPresets()`, calls `speechApi.listQwen3TtsVoicePresets()`
  - In `speak()`: replace hardcoded `ENGINE_ID` with `get().selectedEngineId`. Pass `instruction: get().instruction` in `SpeakParams` only when `selectedEngineId === "qwen3-tts"` (empty string or omit for OmniVoice — confirm `SpeakParams.instruction` is `string | undefined` after phase 01).

- [ ] **Create `src/features/speech/components/qwen3-tts-setup.tsx`.** Mirror `omnivoice-setup.tsx`:
  - `SetupStatus` type: `"idle" | "running" | "done" | "error" | "cancelled"`.
  - `PHASE_KEY` map: `Qwen3TtsSetupPhase` → `keyof Content["speech"]["qwen3tts"]["phase"]` (exhaustive — new phases = compile error).
  - Subscribes to `onQwen3TtsSetupProgress`; on `"done"` calls `refreshEngines()`.
  - `start()` calls `speechApi.setupQwen3Tts()` (fire-and-forget). `cancel()` calls `cancelQwen3TtsSetup()`.
  - Progress bar + phase label + percent — same DOM shape as `OmniVoiceSetup`.
  - Copy keys: `t.speech.qwen3tts.setupCta`, `setupTitle`, `oneTimeNote`, `phase.*`, `cancel`, `retry`, `error`, `cancelled`.
  - Also export `Qwen3TtsPresetPicker` — mirrors `VoicePresetPicker`, reads from `qwen3TtsPresets` / calls `loadQwen3TtsPresets` / writes `voicePresetId`. Uses `t.speech.qwen3tts.presetLabel` / `presetPlaceholder`.

- [ ] **Update `main-screen.tsx`.**
  - Pull `selectedEngineId`, `setSelectedEngine`, `instruction`, `setInstruction`, `qwen3TtsPresets` (or just trigger `loadQwen3TtsPresets` when Qwen3-TTS is selected) from the store.
  - **Engine picker** — two clickable elements (tab-style or button group). For each engine, derive its `EngineInfo` from `engines`. If `engineInfo?.reason === "MAC_ONLY"`: render greyed, non-clickable, with a small "Mac only" chip (`t.speech.enginePicker.macOnly`); cannot be selected. Active engine gets a visual selected state (consult `tailwind-docs-reader` for v4 conditional class pattern before implementing).
  - **Engine-conditional setup wizards:** `selectedEngineId === "omnivoice" && needsSetupOmnivoice` → `<OmniVoiceSetup />`; `selectedEngineId === "qwen3-tts" && needsSetupQwen3Tts` → `<Qwen3TtsSetup />`. Gate `isReady` per selected engine.
  - **Instruction field** — shown only when `selectedEngineId === "qwen3-tts"`. A plain `<input type="text">` wired to `instruction`/`setInstruction`. Placeholder bilingual via `t.speech.qwen3tts.instructionPlaceholder`. Optional — empty is valid.
  - **Qwen3-TTS preset picker** — shown only when `selectedEngineId === "qwen3-tts"` and engine is ready. Render `<Qwen3TtsPresetPicker />` (from the new component). Call `loadQwen3TtsPresets()` on effect when `selectedEngineId` flips to `"qwen3-tts"`.
  - **Speak button gate:** disabled until the selected engine is ready (`isReady` for selected engine) + `hasText` + not pending.

- [ ] **Add i18n keys to `src/lib/i18n/content.ts`.** Add to both `my` and `en` (symmetric or compile fails):
  - `speech.enginePicker.label` — "အင်ဂျင်" / "Engine"
  - `speech.enginePicker.macOnly` — "Mac သာ" / "Mac only"
  - `speech.qwen3tts.setupCta`, `setupTitle`, `oneTimeNote` — one-time MLX/model download note
  - `speech.qwen3tts.phase.creatingEnv`, `installingMlxAudio`, `downloadingModel`, `done`, `error`, `cancelled` — mirrors `omnivoice.phase.*` set but with `installingMlxAudio` replacing the torch/omnivoice phases
  - `speech.qwen3tts.cancel`, `retry`, `success`, `error`, `cancelled`, `slowNote` (Mac GPU advisory)
  - `speech.qwen3tts.presetLabel`, `presetPlaceholder`
  - `speech.qwen3tts.instructionLabel`, `instructionPlaceholder` — e.g. "Speak in a calm, slow tone." / "သာယာသော အသံဖြင့် ပြောပါ…"
  - Update `Content = typeof my` will propagate automatically; ensure `en` object satisfies `Content`.

- [ ] **Consult `tailwind-docs-reader` before writing any Tailwind** — query "v4 utility classes, conditional classes, disabled state". Use exact v4 class strings (static, full strings for content detection — no dynamic concatenation).

- [ ] **Run `bun typecheck`** from `apps/open-myanmar-speech/`. Fix all errors.

## Done when

- Engine picker renders both engines; Qwen3-TTS shows greyed + "Mac only" chip when `reason === "MAC_ONLY"` and cannot be selected.
- Selecting Qwen3-TTS shows `<Qwen3TtsPresetPicker />` and the instruction `<input>`.
- Selecting OmniVoice hides instruction field and Qwen3-TTS preset picker; shows OmniVoice preset picker.
- `<Qwen3TtsSetup />` renders on Qwen3-TTS + SETUP_REQUIRED; progress bar, cancel, retry wired to correct RPCs.
- On Qwen3-TTS setup completion `refreshEngines()` is called and the wizard is replaced by synth controls.
- `SpeakParams.instruction` carries `instruction` store value when Qwen3-TTS selected; omitted/empty for OmniVoice.
- All new copy present in both `en` and `my`; `bun typecheck` clean.

## Touches

- `apps/open-myanmar-speech/src/features/speech/services/qwen3-tts-setup-progress.ts` — new push-channel seam.
- `apps/open-myanmar-speech/src/lib/rpc.ts` — wire `qwen3TtsSetupProgress` message → `emitQwen3TtsSetupProgress`.
- `apps/open-myanmar-speech/src/features/speech/services/speech-api.ts` — add `setupQwen3Tts`, `cancelQwen3TtsSetup`, `listQwen3TtsVoicePresets`.
- `apps/open-myanmar-speech/src/features/speech/stores/speech-store.ts` — add `selectedEngineId`, `instruction`, `qwen3TtsPresets`, setters, `loadQwen3TtsPresets`; branch `speak()` on selected engine.
- `apps/open-myanmar-speech/src/features/speech/components/qwen3-tts-setup.tsx` — new setup wizard + preset picker.
- `apps/open-myanmar-speech/src/features/speech/pages/main-screen.tsx` — engine picker, engine-conditional UI, instruction field.
- `apps/open-myanmar-speech/src/lib/i18n/content.ts` — add `speech.enginePicker.*` and `speech.qwen3tts.*` keys (en + my).
