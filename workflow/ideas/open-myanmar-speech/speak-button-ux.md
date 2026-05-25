# Idea — Speak button UX/UI fixes (open-myanmar-speech)

Several UX/UI rough edges across the **Speak** flow + **History**. None are engine bugs — OmniVoice synthesis itself works. App: `apps/open-myanmar-speech`. Code: `src/features/speech/`, `src/features/history/`.

## Problem 1 — Speak feels like a "glitch" (no feedback floor)

**Symptom.** Click Speak → sometimes nothing visibly happens. Feels unresponsive / like a glitch.

**Where.** `speech-store.ts` `speak()` sets `status:"synthesizing"` immediately and `main-screen.tsx` swaps the button to a spinner + disabled (`isSynthesizing`). But when the call resolves/rejects very fast, the spinner flashes for a few ms or not at all — the user never registers that the click took.

**Idea.** Give the in-progress state a **minimum visible duration (≥300ms)**. Even on a fast path, the spinner + disabled Speak stay up for at least 300ms so every click is acknowledged.

**Sketch.** Floor the synthesizing state in `speak()`:

```ts
const MIN_BUSY_MS = 300;
const startedAt = Date.now();
// ...after the call settles (success or error):
const elapsed = Date.now() - startedAt;
if (elapsed < MIN_BUSY_MS) await delay(MIN_BUSY_MS - elapsed);
// ...then apply the final status
```

Or `Promise.all([speechApi.speak(...), delay(300)])`. Keep it in the store so the screen stays declarative.

## Problem 2 — spurious error while it actually succeeds

**Symptom.** Right after clicking Speak the UI shows **"Something went wrong while speaking. Please try again."** — but the audio _was_ generated: it shows up on the **History** page. So the work completed; only the UI reports failure.

**Likely root cause.** The bun `speak` handler does the synth **and persists the generation (history) row**, then returns the WAV bytes. The renderer's `speechApi.speak()` promise nevertheless rejects → `toErrorCode()` → `SYNTH_FAILED` → the red error. So the backend finished (history row written) while the renderer surfaced an error. Candidates for _why the renderer rejects_:

- **RPC payload / marshalling** of the WAV bytes on the way back (bytes travel as `number[]`; large clips are big) failing or throwing renderer-side after bun already succeeded + saved.
- **RPC timeout** on a long CPU synth — renderer gives up while bun keeps going and writes history.

Needs a quick confirm (log the raw cause — `speak()` already `console.error`s it; check whether it's a reject from the RPC layer vs. a throw in `wavObjectUrl`).

**Idea (user-facing fix).** While generating, **disable Speak and show a clear "generating, please wait" state** instead of letting a premature error pop. Don't scare the user when the work is in fact succeeding.

**Two layers to consider:**

1. **UX (do regardless).** Keep Speak disabled + "generating…" until we have a definitive result. Don't show the error unless we're sure synth truly failed. Pairs with Problem 1's busy-state floor.
2. **Root cause (the real fix).** Stop the renderer from rejecting when the synth actually succeeded:
   - If it's marshalling/timeout: make the renderer wait correctly for the result and harden the bytes round-trip, **or**
   - Move to a **job model** — `speak` kicks off a generation, the row lands in history, the UI watches for completion and pulls the result from history. Then "generating…" is the honest state and there's no bytes-over-RPC reject to misfire.

## Problem 3 — History has no "generating" state (pending / loading / complete)

**Symptom.** A generation only appears in History **after** synth finishes — there's no row while it's still working, no pending/loading indicator, no completion transition. The user can't see "this one is generating."

**Where.** Today there is **no status concept**. The `speak` handler (`src/bun/rpc/speech-handlers.ts`) writes the generation row only **after** `ttsService.speak()` succeeds (best-effort `generationService.create()`); `GenerationSummary` (`src/shared/types.ts`) and the DB `GenerationRow` (`src/bun/db/schema.ts`) have no `status` field. So History = completed rows only.

**Idea.** Add a **status** to generations and write the row up front: `pending → complete` (and `failed`). History renders a per-row badge/spinner: spinner while `pending`, normal row + player when `complete`, an error chip when `failed`.

**This is the clean fix for Problem 2 too** (the "job model"). Flow:

1. `speak` inserts a `pending` row immediately, returns its `id` (no big bytes over RPC at this point).
2. Synth runs; on success the row flips to `complete` (with `audioPath`), on error to `failed`.
3. The UI's source of truth becomes the **row status**, not the synth call's resolve/reject — so a late RPC reject can't show a false error, and History always reflects reality.

**Touches.**

- **Schema + migration.** Add `status` (e.g. `'pending' | 'complete' | 'failed'`) to `generations` in `src/bun/db/schema.ts` → `bun run db:generate` to emit a Drizzle migration (the startup migrate/seed system handles it).
- **Service/handler.** `generation-service.create` writes `pending` first; a new `markComplete` / `markFailed` (or an `update`) flips it; `speech-handlers.speak` orchestrates.
- **Wire type.** Add `status` to `GenerationSummary`.
- **History UI.** `history-screen.tsx` `HistoryRow` renders the status (spinner/badge); decide how it learns of the flip — poll `listGenerations` while any row is `pending`, or push an RPC event. (See open questions.)

## Problem 4 — current audio player is unpolished; use a library

**Symptom.** The current player is the **native `<audio controls>`** element — on both the main screen (`main-screen.tsx`) and, on Replay, in History (`history-screen.tsx`). It looks unstyled/inconsistent and doesn't match the app's UI. The History page **already renders a player**, so any redesign must cover both surfaces.

**Idea.** Replace the native element with **one shared `<AudioPlayer>` component** backed by a library, used by both the main screen and History. Keep the existing blob-URL plumbing in the stores (`wavObjectUrl` + revoke); the component just takes a `src` (the `blob:` URL) and renders a polished, themeable UI.

**Researched options** (all client-side — fine for an offline desktop app):

- **wavesurfer.js** (+ official `@wavesurfer/react` hook) — **recommended.** Canvas waveform visualization; looks great for short TTS clips, plays/seeks on the waveform, fully themeable, plugins (timeline, regions). Heaviest of the three; works with `blob:` URLs. Best "smooth/modern" fit.
- **plyr-react** — clean, accessible, themeable **traditional** player (no waveform). Lighter than wavesurfer; good if a waveform feels like overkill.
- **react-h5-audio-player** (v3.10.x, TS, mobile/keyboard-friendly) — simplest drop-in, styled via CSS variables. Lowest effort; least "wow."

**Lean:** wavesurfer.js for the polish, wrapped in our own `<AudioPlayer>` so swapping libraries later is a one-file change. Add Tailwind theming + dark-mode to match. Confirm bundle-size impact is acceptable.

## Open questions

- Is the reject an RPC timeout, a bytes-marshalling failure, or a renderer-side throw? (Confirm from the logged cause before choosing fix 2's path.)
- Should a **failed** synth persist a `failed` row (with Problem 3) or write nothing? (A `failed` row gives the user a retry affordance; "nothing" keeps History clean.)
- How does History learn a `pending` row flipped to `complete`? Poll while any row is pending, or add an RPC push/event? (Poll is simplest; event is cleaner.)
- Job model vs. hardening the synchronous round-trip — how long do CPU synths actually run? (Drives whether a timeout is in play.)
- Audio player: waveform (wavesurfer) or traditional (plyr / h5)? Acceptable bundle size for a desktop app? Does it autoplay cleanly per clip the way the current `key={audioUrl}` + `autoPlay` does?

## Scope

- **P1 (busy-state floor)** — small, renderer-only: `speech-store.ts` + `main-screen.tsx`.
- **P2 (false error)** — RPC `speak` path (`src/bun/rpc` / `services`) + history-write timing. Validate the cause first. Largely **subsumed by P3's job model.**
- **P3 (history status)** — the biggest piece: a **schema migration** (`generations.status` + `bun run db:generate`), service/handler changes (`generation-service`, `speech-handlers`), wire type (`GenerationSummary`), and History UI (`history-screen.tsx`) + a refresh mechanism (poll/event).
- **P4 (audio player)** — a new dependency + one shared `<AudioPlayer>` component, swapped into `main-screen.tsx` and `history-screen.tsx`; blob-URL plumbing in the stores stays.

Suggested order: P1 (quick win) → P3 (introduces the job model) → P2 (mostly resolved by P3, confirm) → P4 (independent, do anytime). P3 + P4 are spec-sized; consider `/spec` before building.

## Sources (audio player research)

- [wavesurfer.js](https://wavesurfer.xyz/) · [react-h5-audio-player (npm)](https://www.npmjs.com/package/react-h5-audio-player) · [WaveSurfer + React guide](https://www.zignuts.com/blog/react-wavesurfer-js-audio-waveform-guide)

---

Drafted 2026-05-25. Source of truth for behavior: `src/features/speech/stores/speech-store.ts`, `src/features/speech/pages/main-screen.tsx`, `src/features/history/pages/history-screen.tsx`.
