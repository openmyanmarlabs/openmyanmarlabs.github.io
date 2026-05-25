# Spec — Open Myanmar Speech (2026-05-25)

One-line: Offline, Burmese-first text-to-speech desktop app — type text → hear audio — with pluggable TTS engines behind a selector (lightweight sherpa-onnx default; optional heavy OmniVoice gated by machine capability).

Stack reference (how): `apps/electrobun-template` + `workflow/learning/electron-bun/`
Sibling pattern (fork + strip-auth + bytes-over-RPC): `workflow/specs/2026-05-24-open-myanmar-invoice.md`

## Goal

New app `apps/open-myanmar-speech`, forked from `apps/electrobun-template` (already scaffolded + renamed). User types Burmese text → app synthesizes speech offline and plays it. TTS sits behind a pluggable engine interface so engines can be swapped/added: **sherpa-onnx** (lightweight, offline, CPU, Burmese via `mms-tts-mya`) is the always-available default; **OmniVoice** (heavy, Python/PyTorch, GPU/MPS) is an optional engine, shown but gated by machine capability.

## Users / context

- **Single user, offline, on-device.** No accounts, no cloud, no multi-user.
- **Myanmar-first** — default language `my`, English UI available. All copy bilingual via template `content.ts`.
- Desktop: macOS first (dev machine: Apple M4 / 24 GB). Win/Linux later via Electrobun.

## Scope

**In:**

- Scaffold (DONE): forked `apps/open-myanmar-speech`; renamed `app.name` ("Open Myanmar Speech"), `app.identifier`, `package.json`, window title, update key, README.
- **Strip auth** — remove login/register/sessions, `users`/`sessions` tables, `auth-service`, guards. App opens straight to the main screen. (Mirrors invoice.)
- **Main screen** — text input box + engine selector + "Speak" action + audio player.
- **Engine abstraction** — `TtsEngine` interface in `src/bun/`; both engines REAL in v1: `SherpaEngine` (sherpa-onnx) + `OmniVoiceEngine` (Python sidecar).
- **Engine selector** — `<Select>` (reuse `components/ui/select.tsx`); lists engines with availability + reason; unavailable engines disabled with localized reason.
- **Capability detection (bun side)** — `listEngines()` RPC returns `[{ id, label, available, reason }]`; detection (Python present? usable torch device?) runs in the bun process, never the webview.
- **OmniVoice (REAL in v1)** — Python sidecar the bun process spawns/manages; actual synthesis on Apple Silicon (`mps`) / NVIDIA (`cuda`) / CPU. Install + model setup: see Open questions / round 2.
- **OmniVoice in-app setup** — "Set up advanced engine" flow: create isolated Python env (via `uv`) + download model into app data on demand. One-time network; offline after.
- **Voice presets (OmniVoice)** — curated set of bundled Burmese voice presets, each = reference clip + transcript + label/category (e.g. "Male — clear & natural" [default], "Female — warm", …). User picks a preset. (sherpa-onnx mms is single-voice — presets apply to OmniVoice only.)
- **Speed control** — speed slider, applied per-engine where supported (sherpa speed param; OmniVoice param/time-stretch).
- **Synthesis pipeline** — `speak({ engineId, text, voicePresetId?, speed })` RPC → engine produces audio bytes → renderer plays via `URL.createObjectURL(new Blob([bytes]))` + `<audio>`.
- **Save to file** — "Save" writes a `.wav` to disk via `saveAudio({ bytes, name })` RPC → `Bun.write` to Downloads (or chosen dir) → `Utils.showItemInFolder` (mirrors invoice export).
- **Burmese voice** — sherpa-onnx `vits-mms-mya` model, **bundled in the app** (offline, zero-setup default).
- **Zawgyi detect + warn** — detect Zawgyi input (Google `myanmar-tools`), show a non-blocking warning ("looks like Zawgyi — convert to Unicode for correct audio"). **No auto-conversion.**
- **History (SQLite)** — keep template DB; persist past generations (text + engine + voice preset + speed + audio file path); list, re-play, re-use text, delete.
- **i18n** — all new copy EN + MM, Myanmar-first.

**Out (non-goals):**

- Auth, accounts, sessions, multi-user.
- Cloud / network TTS (except optional OmniVoice setup download + existing updater).
- Speech-to-text, mic recording.
- English (or other) voices — Burmese only in v1.
- User-uploaded reference audio / custom voice cloning — presets only in v1 (future).
- Automatic Zawgyi→Unicode conversion — detect + warn only.

## Requirements

### Scaffold / strip

- [ ] (DONE) Fork + rename to `apps/open-myanmar-speech`.
- [ ] Remove auth feature slice, `users`/`sessions` schema, auth RPC/service/store/guards; router opens to main screen, no guards.

### Engine abstraction (bun, template DI)

- [ ] `TtsEngine` interface: `id`, `label` (EN/MM), `detect()` → `{ available, reason? }`, `synthesize({ text, voicePresetId?, speed })` → audio bytes.
- [ ] `SherpaEngine` — always available; `vits-mms-mya`; single voice; honors `speed`.
- [ ] `OmniVoiceEngine` — available only when Python env set up AND a usable device detected; honors `voicePresetId` + `speed`.
- [ ] `listEngines()` RPC → `[{ id, label, available, reason }]` (detection runs bun-side).
- [ ] `speak({ engineId, text, voicePresetId?, speed })` RPC → `{ bytes, format, sampleRate }`; rejects with stable codes (`ENGINE_UNAVAILABLE`, `SETUP_REQUIRED`, `SYNTH_FAILED`) → renderer localizes.

### sherpa-onnx (default engine)

- [ ] `sherpa-onnx-node` N-API addon loaded in the bun process (spike Bun compat first; CLI-subprocess fallback).
- [ ] `vits-mms-mya` model bundled in the app; resolved read-only via `views://`/Resources, copied to app data if the addon needs a writable path.
- [ ] Synthesize Burmese Unicode text → WAV bytes; `speed` maps to the model length/speed param.

### OmniVoice (advanced engine)

- [ ] Setup flow: bundle/fetch `uv` → create isolated env with Python + `omnivoice` → download model into `userData/omnivoice/`. Progress + cancel in UI. One-time network.
- [ ] Capability detect: report `available:false` + reason when env missing (`SETUP_REQUIRED`) or no usable device.
- [ ] Sidecar: bun spawns a Python worker; passes `{ text, refClip, refText, speed }`; receives audio bytes (stdout/temp file). Pick device `mps`/`cuda`/`xpu`/`cpu` automatically.
- [ ] Voice presets registry: curated bundled Burmese references (clip + transcript + EN/MM label + category); default = "Male — clear & natural".

### Main screen (renderer)

- [ ] Text box (Burmese), engine `<Select>` (disabled options show localized reason), voice-preset picker (shown only for OmniVoice), speed slider, "Speak" button, audio player.
- [ ] On "Speak": call `speak(...)`, show progress, play returned bytes via `<audio>` + `URL.createObjectURL`.
- [ ] "Save" → `.wav` to disk via `saveAudio({ bytes, name })` → reveal in file manager.
- [ ] Zawgyi detection (`myanmar-tools`) on input → non-blocking bilingual warning; no auto-convert.
- [ ] Long text: split on Burmese sentence boundaries (`။ ၊` + newlines), synthesize per chunk, concatenate; soft cap (e.g. 5,000 chars) with a notice.

### History (SQLite, template DB conventions)

- [ ] `generations` table: id, `text`, `engine_id`, `voice_preset_id` (nullable), `speed`, `audio_path`, `created_date` (epoch ms).
- [ ] Audio saved to `userData/audio/<nanoid>.wav`; row stores the path (never bytes).
- [ ] History list: re-play (from saved file), re-use text (load into box), delete (row + file). Newest first, paginated.
- [ ] Repos → services → handlers per template DI; unit + e2e testable headlessly.

## Constraints

- **Tech:** template stack only — Vite 7, React 19, Tailwind 4, zustand, typed RPC, react-router 7 hash router. New dep: `sherpa-onnx-node` (prebuilt N-API addon; `sherpa-onnx-darwin-arm64` for M4).
- **sherpa-onnx integration:** `sherpa-onnx-node` is a Node N-API native addon called from the **bun main process** (not the webview). **Risk/spike:** N-API-addon-under-Bun compatibility is unverified — spike loading it in the bun process before building features. Fallback: spawn the sherpa-onnx CLI binary as a subprocess.
- **OmniVoice integration:** Python + PyTorch (`mps` on Apple Silicon, `cuda` on NVIDIA, `xpu` on Intel Arc). Would run as a Python sidecar process the bun side spawns/talks to. Not bundled by default — requires a setup/install step (see Open questions).
- **Audio playback:** Electrobun has no native audio API; playback happens in the **renderer** via standard web `<audio>`/Web Audio from RPC-delivered bytes (same bytes-over-RPC pattern as invoice images).
- **OmniVoice env:** isolated, app-managed (via `uv`) under `userData/`; never touches the user's system Python. Setup is opt-in and needs one-time internet.
- **Audio format:** WAV (PCM) end to end; sample rate per engine (sherpa-onnx mms ~16 kHz, OmniVoice 24 kHz). Renderer plays/saves the bytes as-is.
- **Offline:** default (sherpa) engine 100% on-device, zero-setup (model bundled). Network only for: existing updater + opt-in OmniVoice setup.
- **i18n:** Myanmar-first; `my` source of truth, `en` key-symmetric. No untranslated strings.

## Acceptance — done when

- [ ] App builds + runs as native Electrobun app (own name/identifier); opens straight to the main screen (no login).
- [ ] Type Burmese text → "Speak" with **sherpa-onnx** → audio plays, fully offline, no setup. "Save" writes a playable `.wav` and reveals it.
- [ ] Engine selector lists both engines; OmniVoice is disabled with a localized reason until set up; sherpa-onnx is always enabled.
- [ ] "Set up advanced engine" provisions the Python env + model; afterward OmniVoice becomes selectable and **synthesizes Burmese audio** on this M4 (mps), with a chosen voice preset + speed.
- [ ] Speed slider audibly changes rate for the active engine.
- [ ] Pasting Zawgyi text shows the bilingual warning; Unicode text does not.
- [ ] History records each generation; re-play, re-use text, and delete all work; deleting removes the `.wav`.
- [ ] UI switches EN ↔ MM with no missing keys; default Myanmar.
- [ ] Engines/services/repos covered by `bun test` (units via `tdd`, backend vertical via `backend-e2e`).

## Open questions

- **sherpa-onnx-node under Bun** — N-API addon load in the bun process is unverified. **First spike.** Fallback: spawn the sherpa-onnx CLI binary as a subprocess.
- **Burmese voice presets sourcing** — need clean, licensed Burmese reference clips (+ transcripts) for OmniVoice presets. Which speakers/styles? Licensing? Resolve before the presets phase; default "Male — clear & natural" needed at minimum.
- **OmniVoice speed control** — does the `omnivoice` API expose a speed/rate param, or is time-stretch post-processing needed? Confirm in the OmniVoice phase.
- **`uv` bootstrapping** — bundle the `uv` binary per-platform vs download it during setup? Decide in the setup phase (download-on-setup is the lean first cut).
- **OmniVoice on CPU-only machines** — allow-with-"slow" warning vs hard-disable when no GPU/MPS? Lean: allow + warn.
- **mms-tts-mya quality** — confirm the bundled Burmese voice is acceptable (single, somewhat flat). Spike: run one Burmese sentence through the model before committing.
