# Spec — Speak/History UX + audio player (2026-05-25)

One-line: make Speak honest (no false errors), give generations a live pending/complete/failed status surfaced in History, and replace the native `<audio>` with one polished shared player.
Source: `workflow/ideas/open-myanmar-speech/speak-button-ux.md`

App: `apps/open-myanmar-speech`. Engine: OmniVoice (sole). Code: `src/features/speech/`, `src/features/history/`, `src/bun/`.

## Goal

Move synthesis to a **job model**: `speak` inserts a `pending` generation, returns immediately, synthesizes in the background, then flips the row to `complete` (with audio) or `failed`. The UI reads status from the row — no blocking RPC to time out, so the "shows error but it's in History" bug disappears and History shows live progress. Separately, replace the native player with a shared **wavesurfer.js** `<AudioPlayer>` on both the main screen and History.

## Users / context

Single-user offline desktop app, Burmese-first (EN/MM). User types Burmese → Speak → waits (OmniVoice is slow on CPU, seconds–minutes) → plays/saves. History lists past generations to replay/reuse. All new copy bilingual.

## Background / root cause

- `speak` is today a **blocking RPC** that synthesizes then returns the WAV bytes. A slow OmniVoice synth exceeds Electrobun's RPC `maxRequestTime`, so the renderer's request **rejects (shows the error) while bun keeps running and writes the history row** — the observed P2 symptom. (`setupOmniVoice` already sidesteps this by being fire-and-forget + a progress message.)
- Generations have **no status**: `generations` row / `GenerationSummary` (`src/shared/types.ts`) have none, and `speak` writes the row only **after** synth succeeds (`src/bun/rpc/speech-handlers.ts`). So History = completed rows only.
- Completion will be signalled with a **push webview message** (mirrors `omniVoiceSetupProgress`, wired in `src/lib/rpc.ts`).

## Scope

**In:**

- **Generation status** — add `status: 'pending' | 'complete' | 'failed'` to the `generations` table (Drizzle schema + migration) and to `GenerationSummary`. `audioPath` becomes nullable (pending/failed have no audio).
- **Job-model `speak`** — `speak` (a) inserts a `pending` row, (b) returns `{ generationId }` fast, (c) runs synth in the background, (d) on success writes the WAV + flips row → `complete`, on error flips → `failed`. No WAV bytes returned from `speak` anymore.
- **Completion push** — new bun→webview message `generationUpdated { id, status }`; fanned out in `src/lib/rpc.ts` to the speech + history stores.
- **Main screen (`main-screen.tsx` / `speech-store.ts`)** — Speak kicks off → `pending` ("generating…") state; Speak disabled while pending (**single-flight**). On `complete` push → fetch bytes via `getAudio(id)` → autoplay in the new player + keep bytes for Save. On `failed` → error chip + **Retry**. Keep a **≥300 ms** visible floor on the kick-off acknowledgement (P1).
- **History (`history-screen.tsx` / `history-store.ts`)** — render per-row status: spinner/badge while `pending`, player when `complete`, red chip + **Retry** + Delete when `failed`. Update rows live on `generationUpdated`.
- **Retry** — re-run a `failed` row's text/voice/speed; flips that row back to `pending` and re-synthesizes (single-flight applies).
- **Shared `<AudioPlayer>` (wavesurfer.js)** — one component (canvas waveform, seek, play/pause, time, themed for light/dark) fed a `blob:` URL; replaces the native `<audio>` on the main screen and in History. Blob-URL plumbing stays in the stores.
- **i18n** — all new copy (`generating`, `failed`, `retry`, status labels) in `en` + `my`, Myanmar-first.

**Out (non-goals):**

- No streaming / partial-audio playback during synth (play only on completion).
- No multi-generation queue — single-flight only.
- No waveform editing, regions, trimming, or spectrogram.
- No change to the engine (OmniVoice stays sole), the on-disk format (WAV), or the audio storage location.
- No change to Save-to-Downloads behavior beyond sourcing bytes from the completed generation.
- No raising of `maxRequestTime` as the fix (job model replaces the need); fast reads like `getAudio` are unaffected.
- No new dependency beyond the chosen player (wavesurfer.js + its React hook).

## Requirements

- [ ] `generations.status` column added with a Drizzle migration; **existing rows default to `complete`** (they predate the field and have audio). `audioPath` nullable.
- [ ] `GenerationSummary` gains `status`; `toSummary` maps it.
- [ ] `generation-service` gains: create a **pending** row (no audio), `markComplete(id, bytes)` (write WAV + set `audioPath` + `complete`), `markFailed(id)` (set `failed`). `getAudioBytes` rejects for non-`complete` rows.
- [ ] `speak` handler returns `{ generationId }` immediately after inserting the pending row; synth runs detached; row flips + a `generationUpdated` message is pushed on settle. `speak` no longer returns WAV bytes.
- [ ] `generationUpdated { id, status }` added to the `AppRPC` webview messages and handled in `src/lib/rpc.ts` (fan-out, no store import cycle).
- [ ] Main screen: Speak disabled while a generation is pending; shows "generating…"; ≥300 ms floor on kick-off; on complete autoplays fetched audio; on failed shows error + Retry.
- [ ] History rows render `pending` (spinner) / `complete` (player) / `failed` (chip + Retry + Delete) and update live without a manual refresh.
- [ ] Retry re-synthesizes a failed row (flips it back to pending); respects single-flight.
- [ ] Shared `<AudioPlayer>` (wavesurfer.js) used on both surfaces; waveform + play/pause + seek + current/total time; themed for light + dark; autoplays the freshly completed clip the way today's `key={audioUrl}` + `autoPlay` does; revokes blob URLs (no leaks).
- [ ] New copy present and symmetric in `en` + `my` (`src/lib/i18n/content.ts`).
- [ ] Existing speech/history unit + e2e tests updated; the handler/service tests cover pending→complete and pending→failed transitions.

## Constraints

- **Electrobun RPC is JSON** — bytes still cross as `number[]` at the boundary (`AudioBytes`); only fast reads (`getAudio`) carry them, never the long synth.
- **Detached background work in bun** — the synth runs after the handler returns; must not crash the process on rejection (catch → `markFailed` + push).
- **DB safety** — schema change goes through the startup backup→migrate→seed flow (`src/bun/db/README.md`); migration must replay cleanly on existing installs.
- **Offline** — wavesurfer.js is fully client-side (bundled, no CDN/network); fine for an offline app. Verify bundle-size impact at build.
- **Bilingual, Myanmar-first** — no raw/un-localized status strings in the UI.
- **No writes into the app bundle** (codesign) — audio stays under `<userData>/audio`.

## Acceptance — done when

- Clicking Speak on a slow synth shows a **"generating…"** state (never a false error); the row appears in History as `pending` immediately and flips to `complete` with a playable clip when done.
- A genuinely failed synth shows an **error + Retry** on the main screen and a **failed row** in History; Retry re-runs it.
- History reflects pending/complete/failed **live** (no manual refresh) and across navigating away and back while a synth runs.
- Both the main screen and History play audio through the **same wavesurfer player** (waveform, seek, light/dark), and Save-to-Downloads still works.
- Existing installs migrate cleanly (old rows show as `complete`); `bun test` + `bun run typecheck` pass.

## Open questions

- Confirm (one-line log check) that P2's reject is the RPC timeout vs. a bytes-marshalling throw — the job model fixes both, but worth knowing.
- Retry: flip the **same** failed row back to pending (chosen, keeps History clean) vs. create a new row — confirm at plan time if dedupe matters.
- wavesurfer.js bundle-size delta acceptable for the desktop build? (Measure; fall back to plyr-react if it's egregious.)
- Should a long-pending generation (e.g. app closed mid-synth) be reconciled on next launch (orphan `pending` rows → mark `failed`)? Likely yes — confirm.
