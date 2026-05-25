# 011-05 — Main screen UI (speak → play → save + Zawgyi)

Plan: `011-root-open-myanmar-speech.md` · Blocked by: 04 · Parallel-safe with: 06, 07

## Goal

The headline screen: type Burmese → pick engine → adjust speed → **Speak** → audio plays → optional **Save**. Plus a non-blocking Zawgyi warning. Delivers the spec's core acceptance with the **sherpa** engine, fully offline. (OmniVoice gating/preset-picker is layered on in phase 08.)

## Context

- **Renderer-only** — no unit tests for UI/playback (verified by running the app). The one pure bit (`isLikelyZawgyi`) is TDD'd.
- **`frontend-design` skill** for the screen. **Consult the `tailwind-docs-reader` subagent before writing any CSS** — this app is Tailwind v4 (CSS-first; use verbatim v4 syntax, don't guess). Reuse existing primitives in `src/components/ui/` (`button`, `input`, `text`, **`select`**).
- **`Select`** (`src/components/ui/select.tsx`) is generic + controlled: `<Select<EngineId> value onChange options={[{ value, label, text?, disabled?, ... }]} />`. Disabled options render a localized reason. Feed it from `listEngines()` → map each `EngineInfo` to an option (`disabled: !available`, label shows the localized reason when unavailable).
- **RPC is already built (phase 04):** `listEngines()`, `speak(params)`, `saveAudio({ bytes, name })` via `src/lib/rpc.ts` / `speech-api.ts`. This phase only consumes + appends UI copy.
- **State:** a `src/features/speech/stores/speech-store.ts` (zustand) — `text`, `engineId`, `speed`, `engines`, `status` (`idle|synthesizing|playing|error`), `errorCode`, current audio blob URL. Keep DOM side effects out of testable transitions (tdd skill). Load engines on mount via `listEngines()`; default `engineId` = first available (sherpa).
- **Playback:** `speak()` → `{ bytes, format, sampleRate, truncated }` → `URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }))` → `<audio>` (controls). **Revoke the previous object URL** before replacing (no leaks). Show progress while synthesizing; map `errorCode` → localized message.
- **Save:** "Save" → `saveAudio({ bytes, name })` (name derived from a slug of the text + timestamp) → reveals in file manager; success toast.
- **Speed:** a slider (e.g. 0.5–2.0, step 0.1, default 1.0) → `speed` in `speak`. Label shows the multiplier.
- **Zawgyi:** `bun add myanmar-tools`. Wrap its `ZawgyiDetector` in a pure `src/features/speech/lib/zawgyi.ts` → `isLikelyZawgyi(text): boolean` (probability threshold, e.g. >0.8). **TDD it** (`.claude/skills/tdd/SKILL.md`): a known Zawgyi string → true, clean Unicode Burmese → false, empty/ASCII → false. On input change, show a **non-blocking bilingual warning** ("looks like Zawgyi — convert to Unicode for correct audio"); **no auto-conversion**.
- **Long text:** the soft cap lives in the service (phase 04 `truncated` flag) — surface a notice when `truncated` is true ("text was shortened to N characters").
- **i18n:** append a `speech.*` namespace to `src/lib/i18n/content.ts` (en + my, symmetric, Myanmar-first): labels for text box, engine, speed, Speak, Save, the Zawgyi warning, the truncation notice, and each `SpeechErrorCode`.
- Voice-preset picker is **out** here (OmniVoice-only → phase 08). Leave a slot/conditional that 08 fills.

## Steps

- [ ] Consult `tailwind-docs-reader`; scaffold the route `/` main screen under `AppLayout` (replace the phase-02 placeholder).
- [ ] `speech-store.ts` — text/engine/speed/status/engines/audioUrl + actions (loadEngines, speak, save, reset); revoke old blob URLs.
- [ ] Build the screen: Burmese textarea, engine `<Select>` (disabled+reason from `listEngines`), speed slider, Speak button, `<audio>` player, Save button.
- [ ] (TDD) `zawgyi.ts` `isLikelyZawgyi` + `.test.ts`; wire the non-blocking warning on input.
- [ ] Surface the truncation notice when `speak` returns `truncated`.
- [ ] Append `speech.*` i18n keys (en + my).
- [ ] `run`/`verify`: type Burmese → Speak (sherpa) → audio plays offline → Save writes a `.wav` + reveals it; paste Zawgyi → warning; Unicode → none.

## Done when

- Typing Burmese + Speak with sherpa plays audio, fully offline, no setup; Save writes a playable `.wav` and reveals it.
- Engine `<Select>` lists engines from `listEngines()`; unavailable ones disabled with a localized reason; sherpa always enabled + default.
- Speed slider feeds `speak`; truncation notice appears past the cap.
- Zawgyi paste shows the bilingual warning; Unicode doesn't (`isLikelyZawgyi` tests green).
- `bun test` green for `zawgyi`; `bun run typecheck` clean.

## Touches

- `src/features/speech/pages/main-screen.tsx`, `src/features/speech/stores/speech-store.ts`, `src/features/speech/lib/zawgyi.ts` (+ `.test.ts`).
- `src/routes/index.tsx` — `/` → main screen (append).
- `src/lib/i18n/content.ts` — `speech.*` (append).
- `package.json` — `myanmar-tools`.
