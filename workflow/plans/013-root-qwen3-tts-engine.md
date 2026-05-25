# Plan 013 — Qwen3-TTS Engine

Source: `workflow/specs/2026-05-25-qwen3-tts-engine.md`

## Summary

Adds `Qwen3-TTS-12Hz-0.6B-Base` (via MLX, Apple Silicon) as a second selectable TTS engine alongside OmniVoice. Same JSON-Lines sidecar pattern as OmniVoice. New: natural-language instruction control field in UI. Separate voice-preset registry. Non-Mac platforms see the engine listed but greyed "Mac only". Fully offline, zero per-use cost.

## Phases

| #   | Phase                           | File                                 | Blocked by | Parallel-safe with |
| --- | ------------------------------- | ------------------------------------ | ---------- | ------------------ |
| 01  | Types & wire contract           | `plans/todo/013-01-types-wire.md`    | —          | 03                 |
| 02  | Qwen3-TTS bun core              | `plans/todo/013-02-bun-core.md`      | 01         | 03, 05             |
| 03  | Python MLX worker + preset clip | `plans/todo/013-03-python-worker.md` | —          | 01, 02, 05         |
| 04  | RPC wiring + L1 e2e             | `plans/todo/013-04-rpc-wiring.md`    | 02, 03     | 05                 |
| 05  | Renderer UI                     | `plans/todo/013-05-renderer-ui.md`   | 01         | 02, 03             |

## Notes / risks

- **Instruction language:** model may respond differently to English vs. Burmese instructions for Myanmar text — needs a quick manual test at phase 02/03 (note the result in the engine's `label` copy or a comment).
- **Preset clip:** spec leaves open whether to reuse OmniVoice's `male-clear-natural.wav` or record a new one. Phase 03 defaults to reusing the OmniVoice clip as a bootstrap; can be swapped later without touching any other phase.
- **MLX version pinning:** `mlx-audio` moves fast — phase 02 setup.ts should pin a known-good version at implementation time (same pattern as OmniVoice's `UV_VERSION` pin).
- **`EngineId` union:** `shared/types.ts` currently narrows `EngineId = "omnivoice"`. Phase 01 widens it. Any `satisfies EngineId` casts in existing code must be checked (grep `satisfies EngineId`).
- **Manual `verify` walk (not automatable):** after phase 05, run `/verify` — relaunch persistence, no-FOUC, real Speak + instruction + preset round-trip, "Mac only" UI on simulated non-Mac.
