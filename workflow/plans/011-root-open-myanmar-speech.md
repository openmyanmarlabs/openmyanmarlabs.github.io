# Plan 011 — Open Myanmar Speech (desktop TTS)

Source: `workflow/specs/2026-05-25-open-myanmar-speech.md`
Stack ref (how): `apps/electrobun-template` + `workflow/learning/electron-bun/` · Sibling pattern (fork + strip-auth + bytes-over-RPC): plan `010` (`apps/open-myanmar-invoice`)

## Summary

`apps/open-myanmar-speech` is already forked + renamed from the template. Drop auth (login/register/sessions) → app opens straight to a TTS main screen. Pluggable engines behind a `TtsEngine` interface: **sherpa-onnx** (`vits-mms-mya`, bundled, offline, CPU, the always-available default) + **OmniVoice** (Python sidecar via `uv`, GPU/MPS, opt-in setup, gated by machine capability). Type Burmese → speak → renderer plays returned WAV bytes via `<audio>` + `URL.createObjectURL` → optional save `.wav` to disk. History in SQLite (stores file paths, never bytes). Backend TDD'd (units) + L1 e2e-gated; UI on the template's React 19 + Tailwind 4 + zustand + react-router 7 + EN/MM i18n. **Headline risk: sherpa-onnx N-API addon under Bun — spiked in phase 03 before any features depend on it.**

## Phases

| #   | Phase                                               | File                                     | Blocked by         | Parallel-safe with |
| --- | --------------------------------------------------- | ---------------------------------------- | ------------------ | ------------------ |
| 01  | Drop authentication (login + register + sessions)   | `plans/todo/011-01-drop-auth.md`         | —                  | —                  |
| 02  | Main-screen shell + icon                            | `plans/todo/011-02-main-screen-shell.md` | 01                 | —                  |
| 03  | sherpa-onnx engine (spike + implement)              | `plans/todo/011-03-sherpa-engine.md`     | 02                 | —                  |
| 04  | TTS pipeline service + RPC contract (TDD + L1 seam) | `plans/todo/011-04-tts-pipeline-rpc.md`  | 03                 | —                  |
| 05  | Main screen UI (speak → play → save + Zawgyi)       | `plans/todo/011-05-main-screen-ui.md`    | 04                 | 06, 07             |
| 06  | History (generations DB + repo/service + UI)        | `plans/todo/011-06-history.md`           | 04                 | 05, 07             |
| 07  | OmniVoice backend (sidecar + setup + presets)       | `plans/todo/011-07-omnivoice-backend.md` | 04                 | 05, 06             |
| 08  | OmniVoice UI (setup flow + preset picker + gating)  | `plans/todo/011-08-omnivoice-ui.md`      | 05, 07             | 06                 |
| 09  | i18n sweep + L1 backend-e2e gate + verify           | `plans/todo/011-09-i18n-e2e-verify.md`   | 04, 05, 06, 07, 08 | —                  |

Critical path: **01 → 02 → 03 → 04 → {05, 06, 07} → 08 → 09**. Parallel wave: {05, 06, 07} after 04 (07 is the long pole — 08 needs it). Phases 03 + 04 are the de-risk + backbone; everything else hangs off the engine abstraction built in 04.

## Skills per phase (executor reference)

- **01** — sibling `010-01` is the template for de-auth (skip its fork step). Confirm it still dev-runs to a bare placeholder (`run` skill / `bun run dev`).
- **02** — `add-icon` skill only if the app icon isn't already set; `frontend-design` (light) for the placeholder. Confirm launch (`run` skill / `bun run dev`).
- **03** — `electrobun-docs-reader` (bundling a model dir via `scripts/post-build.ts` + `PATHS.RESOURCES_FOLDER`; `Utils.paths.userData` for a writable copy). **First de-risk gate** — also settles the `mms-tts-mya` quality open-q.
- **04** — `tdd` (`.claude/skills/tdd/SKILL.md`) for chunking + WAV + the `tts-service` orchestration (fake engines); `backend-e2e` (`.claude/skills/backend-e2e/SKILL.md`) transport-free handler seam. **Owns the core RPC contract.**
- **05** — `frontend-design`; **consult `tailwind-docs-reader` before writing CSS** (v4). `tdd` for the pure `isLikelyZawgyi` helper.
- **06** — `tdd` (generations repo/service) + `backend-e2e` seam for its handlers; `frontend-design` + `tailwind-docs-reader` for the history UI.
- **07** — `electrobun-docs-reader` (`Bun.spawn` lifecycle, `before-quit` cleanup, `Utils.paths.userData`, bundling presets). `tdd` for capability-detect + preset-registry pure parts.
- **08** — `frontend-design` + `tailwind-docs-reader`.
- **09** — `backend-e2e` (L1 over assembled main process); `verify` (manual native-GUI walk, incl. the OmniVoice mps path which can't be automated).

## Notes / risks

- **sherpa-onnx-node under Bun is unverified (top risk).** N-API addon load in the bun process is the first thing to prove (phase 03). Fallback: spawn the sherpa-onnx CLI binary as a subprocess (same `Bun.spawn` pattern as the OmniVoice sidecar). The engine interface (phase 03) hides which path is used, so the fallback doesn't ripple.
- **Model + presets are large binaries.** `vits-mms-mya` (~100s of MB) and OmniVoice reference clips must ship. Template bundles views via Vite → `scripts/post-build.ts` (no `build.copy`); extend that script to `cpSync` the model/preset dirs into the bundle `Resources`, resolve at runtime via `PATHS.RESOURCES_FOLDER` (dev: a local vendored path). Decide vendoring vs fetch-on-build; `.gitignore` the big files or use git-lfs. If `build.useAsar` is on, add `*.node` + model + sidecar globs to `asarUnpack` (KB: `apis/cli/build-configuration.md`).
- **OmniVoice voice-preset sourcing is a hard pre-req.** Need clean, licensed Burmese reference clips + transcripts. Resolve **before** phase 07's preset step; the default "Male — clear & natural" is the minimum to ship OmniVoice. (Spec open-q.)
- **OmniVoice open decisions (lean defaults, confirm in 07/08):** `uv` bundled per-platform vs downloaded on setup → **download-on-setup** (lean). OmniVoice speed param vs time-stretch post-process → confirm against the `omnivoice` API. CPU-only machines → **allow + "slow" warning**, don't hard-disable.
- **Sidecar lifecycle.** The OmniVoice Python worker is long-lived; kill it on `Electrobun.events.on("before-quit", …)` + a sync `process.on("exit")` fallback (KB: `apis/events.md` — note the Linux system-quit gap). Never write into the app bundle at runtime (code-signing); all env/model/audio writes go under `Utils.paths.userData`.
- **Shared-file chokepoints.** Parallel phases (05/06/07) each append to `src/shared/types.ts` (RPC contract), `src/lib/rpc.ts`, `src/routes/index.tsx`, `src/lib/i18n/content.ts`. **Append only your own keys/routes/handlers — never rewrite.** Phase 04 builds the core contract once to minimise churn; 06/07 add only their own requests.
- **RPC blob size.** WAV bytes cross RPC for playback (and again for save); KB flags marshalling overhead. Fine for typical clips; history re-play reads from disk via `getAudio` → bytes → blob URL (same pattern as invoice `getImage`). Watch latency on long synthesis.
- **No native audio / no save dialog (verified).** Playback is renderer-only (`<audio>` + `URL.createObjectURL`). Save defaults to `Utils.paths.downloads` + `Utils.showItemInFolder`; a chosen folder is only possible via `Utils.openFileDialog({ canChooseDirectory: true })` (KB: `apis/utils.md`).
- **Manual acceptance (L3, can't automate)** — final `verify` walk: relaunch → history persists, no FOUC, EN↔MM toggle clean + Burmese font; sherpa speak+play+save offline; set up OmniVoice → it synthesizes Burmese on this M4 (mps) with a preset + speed; speed audibly changes rate; Zawgyi paste warns, Unicode doesn't; history re-play / re-use / delete (deletes the `.wav`).
- Nothing executed — phases sit in `plans/todo/`. Move each to `plans/done/` as it ships (`plan-execute` handles this).
