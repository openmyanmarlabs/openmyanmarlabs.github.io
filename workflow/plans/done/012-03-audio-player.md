# 012-03 — Shared <AudioPlayer> (wavesurfer.js)

Plan: `012-root-speak-history-ux.md` · Blocked by: — · Parallel-safe with: 01, 02, 04

## Goal

One polished, themed `<AudioPlayer>` (wavesurfer.js canvas waveform + play/pause + seek + current/total time) fed a `blob:` URL — the drop-in replacement for the native `<audio>` on both surfaces. This phase builds the component standalone; Phase 05 wires it in.

## Context

- This is a **renderer UI component** — NOT unit-tested (DOM + canvas + RPC-less). Verified visually in Phase 05's app walk. No electrobun API involved (wavesurfer is pure client-side / offline-safe — bundled, no CDN).
- **Tailwind v4 work** — before writing any CSS, consult the `tailwind-docs-reader` subagent for verbatim v4 syntax. Key findings already gathered (cite KB: `workflow/learning/tailwind/apis/theme.md`, `workflow/learning/tailwind/guides/dark-mode.md`):
  - `@theme` tokens compile to real CSS vars on `:root`. Project tokens live in `src/styles/global.css` (`--color-brand-50..900`, oklch); dark mode is `@custom-variant dark (&:where(.dark, .dark *))` toggled via a `.dark` class on `<html>`.
  - wavesurfer needs **JS color values** for `waveColor`/`progressColor` (canvas, not classes). Read them at runtime with `getComputedStyle(el).getPropertyValue("--…").trim()`, querying the **waveform container node** (so a `.dark` ancestor resolves correctly). For mode-dependent colors, add semantic aliases in `global.css` — `:root { --wave-color: …; --wave-progress: … }` and `.dark { … }` — then read those. Re-read + `wavesurfer.setOptions({ waveColor, progressColor })` when the theme changes (canvas colors are captured at draw time).
- Theme state: `src/stores/theme-store.ts` (subscribe to know when to recolor). Existing chrome styling to match: the player container styles on `main-screen.tsx` (`rounded-xl border bg-neutral-50 … dark:…`) and the `Button` primitive (`src/components/ui/button.tsx`).
- **Dependencies:** add `wavesurfer.js` + `@wavesurfer/react` (the official React hook) via `bun add`. No other new deps (spec). **Measure the build bundle delta** (`bun run build`) and record it; if egregious, fall back to `plyr-react` (spec's escape hatch) — flag before proceeding.
- File naming: kebab-case (`audio-player.tsx` → exports `AudioPlayer`). Put it under `src/components/ui/`.

## Steps

- [ ] `bun add wavesurfer.js @wavesurfer/react`.
- [ ] Add semantic waveform color aliases to `src/styles/global.css`: `:root { --wave-color: var(--color-brand-300); --wave-progress: var(--color-brand-600); }` and a `.dark { … }` override (pick legible light/dark pairs against the neutral player background). Consult `tailwind-docs-reader` first to confirm placement (outside `@theme`, plain `:root`/`.dark`).
- [ ] Build `src/components/ui/audio-player.tsx`:
  - Props: `{ url: string; autoPlay?: boolean; className?: string }`.
  - Use `@wavesurfer/react`'s `useWavesurfer` (or `<WavesurferPlayer>`) bound to a container ref; pass `url`, height, `barWidth`/`barRadius` for a clean look, and `waveColor`/`progressColor` read from `--wave-color`/`--wave-progress` off the container node.
  - Controls: a play/pause button (use the `Button` primitive or a matching icon button) wired to wavesurfer's play/pause + `isPlaying`; seek via clicking the waveform (built-in); a `current / total` time readout (`tabular-nums`), formatted `m:ss`.
  - `autoPlay`: play once the instance is `ready` (replaces today's `<audio key={url} autoPlay>` behavior — a changing `url` re-loads + re-autoplays).
  - **Theme reactivity:** subscribe to `theme-store` (or a `MutationObserver` on `<html class>`); on change, re-read the CSS vars and `setOptions({ waveColor, progressColor })`.
  - **Lifecycle:** destroy the wavesurfer instance on unmount / before re-init. Do NOT revoke the blob URL here — the stores own blob-URL hygiene (`speech-store`/`history-store` create + revoke). The component only consumes the URL.
  - Light/dark + responsive (`w-full`), matching the existing player container's visual weight.
- [ ] Manually sanity-check the component in isolation (temporary mount or Storybook-less quick render) OR defer the visual check to Phase 05 — at minimum confirm it compiles + `bun run typecheck` passes.

## Done when

- `wavesurfer.js` + `@wavesurfer/react` added; `bun run build` succeeds and the bundle-size delta is recorded (acceptable, or fallback flagged).
- `<AudioPlayer url … autoPlay />` renders a waveform, plays/pauses, seeks, shows current/total time, recolors on light↔dark, and destroys cleanly on unmount.
- `bun run typecheck` passes. (No unit test — UI/canvas component.)

## Touches

- `package.json` — `wavesurfer.js`, `@wavesurfer/react`.
- `src/components/ui/audio-player.tsx` — new shared player.
- `src/styles/global.css` — `--wave-color` / `--wave-progress` aliases (+ `.dark`).
