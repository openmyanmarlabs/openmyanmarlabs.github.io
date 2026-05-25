# 011-08 — OmniVoice UI (setup flow + preset picker + gating)

Plan: `011-root-open-myanmar-speech.md` · Blocked by: 05, 07 · Parallel-safe with: 06

## Goal

Surface OmniVoice on the main screen: a "Set up advanced engine" flow with progress + cancel, a voice-preset picker shown only when OmniVoice is selected, and correct engine-selector gating (OmniVoice disabled with a localized reason until set up, selectable after).

## Context

- **`frontend-design` skill**; **consult the `tailwind-docs-reader` subagent before writing any CSS** (Tailwind v4, CSS-first — verbatim syntax).
- Backend is done (phase 07): `listEngines()` already reports OmniVoice `available`/`reason`; `setupOmniVoice` (with progress messages) + `cancelOmniVoiceSetup` + `listVoicePresets` are wired in `src/lib/rpc.ts`. `speak` already accepts `voicePresetId`. This phase is renderer-only (no unit tests; verified by running).
- Extends the **phase-05 main screen + `speech-store`** (the slot left for presets). When the selected engine is OmniVoice and it's unavailable with `reason:"SETUP_REQUIRED"`, show a **"Set up advanced engine"** affordance instead of (or beside) the disabled option.
- **Setup UI:** trigger `setupOmniVoice` → show streamed progress (download uv → env → model) with a **Cancel** (`cancelOmniVoiceSetup`); on success re-run `listEngines()` so OmniVoice flips to selectable; on failure/cancel show a localized message + allow retry. One-time network — say so in copy.
- **Preset picker:** when `engineId === "omnivoice"`, show a voice-preset `<Select>` (or grouped-by-category control) fed by `listVoicePresets()`; default `"male-clear-natural"`; selection → `voicePresetId` in `speak`. Hidden for sherpa (single voice).
- **CPU-only:** if OmniVoice is available but flagged slow (no GPU/MPS — phase 07 detect), show a non-blocking "may be slow on this machine" note. (Lean: allow + warn.)
- **i18n:** append OmniVoice copy to `src/lib/i18n/content.ts` (en + my, symmetric): setup CTA, progress stages, cancel, success/error, the preset labels' surrounding UI, the slow-machine note. (Preset display labels come from `listVoicePresets()` which already carries `{en,my}`.)

## Steps

- [ ] Consult `tailwind-docs-reader`.
- [ ] Wire the engine selector gating: OmniVoice disabled + localized reason until available; show the "Set up advanced engine" CTA when `SETUP_REQUIRED`.
- [ ] Build the setup flow UI: start → streamed progress → cancel; on success re-fetch `listEngines()`.
- [ ] Add the voice-preset picker (OmniVoice-only) from `listVoicePresets()`; feed `voicePresetId` into `speak`.
- [ ] Show the slow-machine note when flagged.
- [ ] Append OmniVoice `speech.omnivoice.*` i18n keys (en + my).
- [ ] `run`/`verify`: set up OmniVoice on this M4 → it becomes selectable → speak Burmese with a chosen preset + speed; cancel mid-setup works.

## Done when

- Before setup, OmniVoice is disabled in the selector with a localized reason + a working "Set up advanced engine" CTA.
- Setup shows progress, supports cancel, and on success OmniVoice becomes selectable.
- Selecting OmniVoice reveals the preset picker; the chosen preset + speed drive `speak`; sherpa shows no picker.
- Slow-machine note appears when flagged; no missing i18n keys.
- `bun run typecheck` clean.

## Touches

- `src/features/speech/pages/main-screen.tsx`, `src/features/speech/stores/speech-store.ts` — preset state + gating (extend phase 05).
- `src/features/speech/components/omnivoice-setup.tsx` (+ preset picker) — new.
- `src/lib/i18n/content.ts` — `speech.omnivoice.*` (append).
