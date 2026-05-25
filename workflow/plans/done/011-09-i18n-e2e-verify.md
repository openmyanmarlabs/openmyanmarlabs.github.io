# 011-09 — i18n sweep + L1 backend-e2e gate + verify

Plan: `011-root-open-myanmar-speech.md` · Blocked by: 04, 05, 06, 07, 08 · Parallel-safe with: —

## Goal

Close the feature: an EN/MM i18n sweep across every screen, the L1 backend-e2e gate over the assembled main-process stack, and the manual native-GUI acceptance walk (the only layer that can't be automated — including the OmniVoice mps path).

## Context

- **i18n sweep:** verify `src/lib/i18n/content.ts` `en`/`my` are symmetric across every namespace the feature phases appended (`main`, `speech`, `speech.omnivoice`, `history`, plus surviving `nav`/`update`/`theme`). Myanmar-first default; Burmese font (template's Khit Haung) renders. TS flags asymmetry via `en: Content = typeof my` — fix any gaps. No untranslated strings (spec hard rule).
- **L1 backend-e2e gate** — read `.claude/skills/backend-e2e/SKILL.md`. The one legitimate end-of-feature test step: exercise the **REAL assembled path** `speech-handlers map → tts-service → engines / generation-service → in-memory SQLite` (transport-free seam from phases 04/06), minus the native window + wire. `bun test`; **do not import `migrate.ts`** — use `createTestDb()`.
  - **Engines:** inject a **fake `TtsEngine`** (sherpa needs the native addon — out of scope for headless L1; the fake proves the orchestration + handler wiring). Optionally a fake unavailable engine to assert gating.
  - Cover the vertical flows:
    - `listEngines` → maps engine `detect()` → `EngineInfo[]` with correct `available`/`reason` codes (available + unavailable engines).
    - `speak` (fake engine) → chunks multi-sentence Burmese → concatenated WAV out → **persists a generation** (row + file via the injected audio dir) → returns `generationId`.
    - `speak` error-code normalization: unknown engine → `ENGINE_UNAVAILABLE`; unavailable → `SETUP_REQUIRED`; engine throw → `SYNTH_FAILED` (the codes the renderer maps).
    - `listGenerations` newest-first + pagination; `getAudio` round-trips bytes + **rejects path traversal**; `deleteGeneration` removes row **and** file.
    - `saveAudio` writes bytes + returns a path (reveal is fire-and-forget — assert the write, not the OS call).
  - **OmniVoice is excluded from L1** (sidecar / `uv` / real synth can't run headless) — its pure parts (detect decision, preset lookup) are already unit-tested in phase 07; the live path is L3-manual below.
- **`verify` skill — manual native-GUI walk (L3, can't automate):** build + launch the `.app` and walk the spec's acceptance:
  - opens straight to the main screen (no login);
  - type Burmese → Speak (sherpa) → audio plays offline → Save writes a playable `.wav` + reveals it;
  - selector lists both engines; OmniVoice disabled w/ reason until set up; **set up advanced engine** → provisions env+model → OmniVoice synthesizes Burmese on this M4 (mps) with a preset + speed;
  - speed slider audibly changes rate;
  - Zawgyi paste warns, Unicode doesn't;
  - history records each generation; re-play, re-use text, delete all work; delete removes the `.wav`;
  - relaunch → history persists, no FOUC, EN↔MM toggle clean + Burmese font; default Myanmar.

## Steps

- [ ] i18n sweep: ensure `en`/`my` symmetry + Myanmar-first across all namespaces; fix gaps; confirm Burmese font.
- [ ] Write the L1 `backend-e2e` suite (fake engine + real generation-service + in-memory SQLite) covering the flows above.
- [ ] `bun test` full suite green; `bun run typecheck` clean.
- [ ] `verify` (manual native-GUI walk) on the built app; record results — especially the OmniVoice mps synthesis (can't be automated).

## Done when

- EN/MM symmetric, no missing keys, default Myanmar, Burmese font renders.
- L1 `backend-e2e` suite green under `bun test`: listEngines mapping, speak (chunk→concat→persist→generationId), all error codes, history list/getAudio/delete (traversal-safe, file removed), saveAudio write.
- Full `bun test` + `bun run typecheck` green.
- Manual `verify` walk passes and is recorded (incl. OmniVoice mps path + speed audibility + Zawgyi warn + relaunch persistence).

## Touches

- `src/lib/i18n/content.ts` — symmetry fixes.
- `src/bun/rpc/speech-handlers.e2e.test.ts` (or per skill convention) — L1 suite.
- (No feature code expected — bug-fixes only if the sweep/gate surfaces issues.)
