# 012-05 — UI wiring + i18n + verify

Plan: `012-root-speak-history-ux.md` · Blocked by: 03, 04 · Parallel-safe with: —

## Goal

Wire the new `<AudioPlayer>` + pending/complete/failed states into the main screen and History, add all new bilingual copy, restore the truncation notice as a client-side hint, then run the manual native-GUI acceptance walk.

## Context

- **UI phase — not unit-tested** (declarative React over the stores from Phase 04 + the player from Phase 03). Correctness is the **manual `verify` walk** below (`.claude/skills/verify`).
- **Tailwind v4** — before any new CSS, consult the `tailwind-docs-reader` subagent for verbatim v4 syntax (status badges/spinners/chips). Match existing static class strings; dark mode via `dark:` (the `@custom-variant dark` is already set in `global.css`).
- Main screen: `src/features/speech/pages/main-screen.tsx` — today gates on OmniVoice availability (`needsSetup`/`isReady`), `<audio key={audioUrl} controls autoPlay>` + Save, a `truncatedNotice`, an inline `Spinner`. Reads `useSpeechStore`.
- History: `src/features/history/pages/history-screen.tsx` — `HistoryRow` with Replay/Reuse/Delete + inline `<audio>` + `replayFailed`. Reads `useHistoryStore`.
- i18n: `src/lib/i18n/content.ts` — `my` is source-of-truth, `en` typed as `Content` (must be key-symmetric or it fails to compile). Myanmar-first. Existing keys: `speech.{speak,speaking,save,saved,truncatedNotice,errors.*}`, `history.{replay,reuse,delete,engineLabel,replayFailed,…}`, `omnivoice.retry` (reuse the wording, but add speech-level keys).
- **Truncation (client-side hint, locked decision):** `speak` no longer returns `truncated`. Add a renderer-local `const SOFT_CAP = 5000;` (mirrors `DEFAULT_MAX_CHARS` in `src/bun/lib/chunk-text.ts` — keep a comment cross-referencing it) and show `truncatedNotice` when `text.trim().length > SOFT_CAP`. Do NOT import the bun module into the renderer.

## Steps

- [ ] **i18n (`content.ts`, both `my` + `en`, symmetric):** add under `speech`: `generating` ("generating…" / "အသံဖွဲ့နေသည်…" — may reuse `speaking`), `retry` ("Try again" / "ထပ်မံကြိုးစားမည်"), `failed` (a generic "Synthesis failed." line for the main screen). Add under `history`: `status.{pending,complete,failed}` badge labels, `retry`, `pending` ("Generating…") and `failed` ("Failed") row copy. Keep wording aligned with the existing tone.
- [ ] **Main screen:**
  - Replace the `<audio>` block with `<AudioPlayer url={audioUrl} autoPlay />` (keep the surrounding container + Save + saved-path).
  - Speak button: disabled while a job is pending (single-flight) + when `!isReady`/`!hasText`; show the spinner + `generating` copy while pending.
  - On `failed` (store error state): show the error line + a **Retry** button calling the store's `retry()`.
  - Truncation: render `truncatedNotice` from the client-side `SOFT_CAP` check (replace `{count}` with `text.trim().length`).
- [ ] **History rows:** render by `gen.status`:
  - `pending` → spinner/badge (`status.pending`), no player; Delete still available.
  - `complete` → `<AudioPlayer>` on Replay (replace `<audio>`), plus Reuse/Delete (current behavior).
  - `failed` → red status chip (`status.failed`) + **Retry** (store `retry(id)`) + Delete; no player/Replay.
  - Keep the inline delete-confirm, paging, `replayFailed` handling, date/meta.
- [ ] `bun run typecheck` + `bun test` (whole app) green.
- [ ] **Manual verify walk** (`.claude/skills/verify` — run the app):
  - Speak a slow synth → "generating…" shows, **no false error**; History shows the row `pending` immediately, then flips `complete` with a playable clip — live, no refresh.
  - Navigate away mid-synth and back → History still updates to `complete`.
  - Force a failure → main screen shows error + Retry; History row shows `failed` + Retry; Retry re-runs to `complete`.
  - Both surfaces play through the **same wavesurfer player** (waveform/seek/current-total time) in light **and** dark; Save-to-Downloads still works.
  - Quit mid-synth, relaunch → the orphaned `pending` row reads `failed` (boot reconcile).
  - Existing-install migration: old rows read `complete` and replay. No FOUC; Burmese renders in KhitHaungg.

## Done when

- Both screens use `<AudioPlayer>`; main screen shows pending/complete/failed (+ Retry) and the client-side truncation hint; History renders per-row pending/complete/failed (+ Retry) and updates live.
- All new copy present + symmetric in `en` + `my` (compiles).
- `bun run typecheck` + `bun test` pass; the manual verify walk passes (record results).

## Touches

- `src/lib/i18n/content.ts` — new `speech.*` + `history.*` copy (both langs).
- `src/features/speech/pages/main-screen.tsx` — AudioPlayer, pending/failed/Retry, client-side truncation.
- `src/features/history/pages/history-screen.tsx` — per-status rows, AudioPlayer, Retry.
