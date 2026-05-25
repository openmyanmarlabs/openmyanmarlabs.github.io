# Plan 012 — Speak/History UX + audio player

Source: `workflow/specs/2026-05-25-speech-speak-history-ux.md`

## Summary

Move synthesis to a **job model**: `speak` inserts a `pending` generation, returns `{ generationId }` fast, synthesizes detached, then flips the row → `complete` (WAV written) or `failed`, pushing a `generationUpdated { id, status }` webview message on every transition. UI reads status from the row — no blocking RPC to time out, so the false-error bug dies and History shows live progress. Separately, replace the native `<audio>` with one shared **wavesurfer.js** `<AudioPlayer>` on the main screen + History.

Confirmed at plan time: (1) orphan `pending` rows are reconciled → `failed` on boot; (2) the truncation notice survives as a **client-side hint** (renderer-local `SOFT_CAP` mirroring `DEFAULT_MAX_CHARS`), since `speak` no longer returns `truncated`; (3) Retry flips the **same** failed row back to pending (spec's choice).

## Phases

| #   | Phase                     | File                                      | Blocked by | Parallel-safe with |
| --- | ------------------------- | ----------------------------------------- | ---------- | ------------------ |
| 01  | Data model + service      | `plans/todo/012-01-data-model-service.md` | —          | 03                 |
| 02  | Backend job-model + L1    | `plans/todo/012-02-backend-job-model.md`  | 01         | 03                 |
| 03  | Shared AudioPlayer        | `plans/todo/012-03-audio-player.md`       | —          | 01, 02, 04         |
| 04  | Renderer stores + fan-out | `plans/todo/012-04-renderer-stores.md`    | 02         | 03                 |
| 05  | UI wiring + i18n + verify | `plans/todo/012-05-ui-i18n-verify.md`     | 03, 04     | —                  |

Critical path: **01 → 02 → 04 → 05**, with **03** (AudioPlayer) buildable in parallel the whole time. First wave can run **01 + 03** concurrently.

## Notes / risks

- **L1 backend-e2e gate** lives in **Phase 02's Done when** (per `.claude/skills/backend-e2e`): the assembled `speech-handlers → tts-service → generation-service → repo → SQLite` path, covering `pending → complete` and `pending → failed`. The existing `speech-handlers.e2e.test.ts` asserts `speak` returns WAV bytes — it MUST be rewritten for the job model (`speak` returns `{ generationId }`; the row settles after a tick).
- **Manual native-GUI acceptance walk** (can't be automated — `.claude/skills/verify`): (a) Speak on a slow synth shows "generating…", never a false error; row appears `pending` in History immediately, flips to `complete` live; (b) navigate away mid-synth and back — History still updates; (c) a forced failure shows error + Retry on both surfaces; Retry re-runs; (d) both surfaces play through the same wavesurfer player (waveform/seek/light+dark); Save-to-Downloads still works; (e) quit mid-synth, relaunch → the orphaned `pending` row shows `failed` (reconcile); (f) existing install migrates cleanly (old rows read `complete`); no-FOUC.
- **Migration nullability:** dropping `audio_path NOT NULL` makes drizzle-kit emit a table-recreate (create→copy→drop→rename), not a bare ALTER. Verify the generated `0003_*.sql` backfills existing rows `status='complete'` and preserves data. Forward-only; commit the generated files.
- **Detached synth must never crash bun** — the background task catches its own rejection → `markFailed` + push (mirrors `omnivoice-handlers.setupOmniVoice`'s `void run().catch()`).
- **No store import cycle:** `generationUpdated` fans out through a subscription seam (`generation-updates.ts`), mirroring `omnivoice-setup-progress.ts` — `rpc.ts` imports only the emitter, never a feature store.
- **wavesurfer bundle size:** measure the build delta in Phase 03; fall back to `plyr-react` only if egregious (spec). Fully client-side/offline — no CDN.
- Nothing is executed — phases sit in `plans/todo/` for review; move each to `plans/done/` as it ships.
