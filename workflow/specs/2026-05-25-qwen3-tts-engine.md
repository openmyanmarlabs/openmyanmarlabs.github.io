# Spec — Qwen3-TTS Engine (2026-05-25)

Add Qwen3-TTS as a second, selectable TTS engine alongside OmniVoice in Open Myanmar Speech.

---

## Goal

Wire `Qwen3-TTS-12Hz-0.6B-Base` (via MLX, Apple Silicon) into the existing `TtsEngine` plugin system. Users pick between OmniVoice and Qwen3-TTS from the engine picker. Qwen3-TTS adds voice cloning (ref clip + transcript) plus natural-language instruction control — neither available in OmniVoice. Fully offline, zero per-use cost.

## Users / context

Myanmar desktop users running Open Myanmar Speech on Apple Silicon Macs. Non-Mac users see the engine listed but unavailable ("Mac only"). Burmese-first UI, offline-first.

## Scope

**In:**

- New `qwen3-tts` engine implementing the existing `TtsEngine` interface
- MLX-backed Python sidecar (`resources/qwen3-tts/worker.py`), same JSON-Lines protocol as OmniVoice
- One-time setup flow: uv → isolated venv → `mlx-audio` install → model download (~1.5 GB, `Qwen/Qwen3-TTS-12Hz-0.6B-Base`)
- Engine detection: available only on Apple Silicon Mac; unavailable (not hidden) on Linux/Windows with reason `"MAC_ONLY"`
- Separate voice preset registry for Qwen3-TTS (own clips under `resources/qwen3-tts/presets/`; same `VoicePreset` shape as OmniVoice)
- `instruction?` optional field added to `SynthRequest` — Qwen3-TTS passes it to the worker; OmniVoice silently ignores it
- Instruction control UI: text input shown only when Qwen3-TTS is the active engine; bilingual placeholder ("speak slowly and warmly" / "ဖြည်းဖြည်းနှင့် နွေးထွေးစွာ ပြောပါ")
- Engine picker: both engines listed, Qwen3-TTS greyed out with "Mac only" label on unsupported platforms
- Bilingual labels (`en` / `my`) for engine name, status messages, instruction placeholder
- History persists as before (generation rows, WAV saved to userData)

**Out (non-goals):**

- Streaming / progressive audio playback — non-streaming only, full WAV returned
- Qwen3-TTS-1.7B model — 0.6B only now; upgrade path deferred
- `VoiceDesign` or `CustomVoice` model variants — Base (voice clone) only
- Fine-tuning pipeline — inference only
- Shared presets between OmniVoice and Qwen3-TTS
- Instruction control for OmniVoice

## Requirements

- [ ] `Qwen3TtsSidecar` spawns a long-lived MLX Python worker; JSON-Lines protocol identical to OmniVoice sidecar
- [ ] `qwen3TtsSetup` follows OmniVoice setup phases: `downloading-uv` → `creating-env` → `installing-mlx-audio` → `downloading-model` → `done`
- [ ] `detect()` returns `available: false, reason: "MAC_ONLY"` on non-Apple-Silicon; returns `available: false, reason: "SETUP_REQUIRED"` when env/model absent; returns `available: true` otherwise
- [ ] `synthesize(req)` passes `text`, `refClip`, `refText`, `speed`, and `instruction` (empty string when omitted) to the worker; returns WAV bytes at 24 kHz
- [ ] Worker loads model once on first request, processes subsequent requests without reload
- [ ] `SynthRequest` gains optional `instruction?: string`; existing OmniVoice engine ignores it
- [ ] Separate preset registry at `src/bun/tts/qwen3-tts/presets.ts` with at least one bundled Burmese clip
- [ ] Engine picker lists both engines; Qwen3-TTS row shows greyed "Mac only" chip when `reason === "MAC_ONLY"`
- [ ] Instruction text input renders below preset picker only when Qwen3-TTS is selected
- [ ] Instruction field is optional — empty string = no instruction (model uses default style)
- [ ] All new UI copy in both `en` and `my`
- [ ] Existing OmniVoice behaviour unchanged (no regressions)
- [ ] `setupQwen3Tts` and `cancelQwen3TtsSetup` RPC handlers added (mirrors OmniVoice RPC)
- [ ] `listQwen3TtsVoicePresets` RPC handler added

## Constraints

- MLX (`mlx-audio`) runs only on Apple Silicon — no CPU fallback, no CUDA path
- Model weights ~1.5 GB; download skipped if already present in `userData/qwen3-tts/model/`
- Sidecar process: one instance per app run, killed on app quit — same lifecycle as OmniVoice
- `SynthRequest.instruction` must not break existing engine tests (optional, typed `string | undefined`)
- No network calls at synthesis time (`HF_HUB_OFFLINE=1` after setup)
- Follow existing file/naming conventions: kebab-case files, `src/bun/tts/qwen3-tts/` directory

## Acceptance — done when

- Qwen3-TTS engine appears in the engine picker alongside OmniVoice on Mac
- Selecting Qwen3-TTS + typing text + pressing Speak synthesizes audio using the MLX worker
- Instruction field visible when Qwen3-TTS selected; hidden when OmniVoice selected
- Typing an instruction (e.g. "speak slowly") audibly changes the output prosody
- On a non-Mac platform (or simulated via `reason` override), engine row shows greyed "Mac only" — cannot be selected
- OmniVoice still works identically after the change
- Setup flow completes without error on a clean Mac (no pre-existing venv/model)
- Synthesis result saved to history (generation row) same as OmniVoice

## Open questions

- **Bundled preset clip for Qwen3-TTS v1:** needs at least one clean Burmese WAV (~10s) + transcript. Reuse the existing OmniVoice `male-clear-natural.wav` as a bootstrap clip, or record a new one? (Can defer to implementation — reuse OmniVoice clip as default until a dedicated Qwen3-TTS clip is recorded.)
- **Instruction language:** does the model respond better to English instructions or Burmese instructions for Myanmar text? Needs a quick manual test at implementation time.
