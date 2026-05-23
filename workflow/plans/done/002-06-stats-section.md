# 002-06 — Stats section

Plan: `002-root-decorate-ui.md` · Blocked by: 01 · Parallel-safe with: 02,03,04,05,07,08

## Goal

Redecorate the dark credibility strip — emphasize the big tabular numerals with on-dark accents + refined reveal. Asset-light.

## Context

- **File:** `src/sections/stats-section.tsx` — **INK band** (`--color-ink` #0f1216), `id="stats"`. Re-points `--color-text`/`--color-text-muted` to the on-dark palette on the wrapper so descendants resolve dark-surface colors (keep this trick). 4 `StatTile`s, values via `CountUp` (tabular nums). `Reveal stagger`.
- **CountUp** already snaps to final value under reduced-motion. `renderStatValue` parses `"2+"`, `"25k+"`, `"100%"`; `"1 → 6"` is non-numeric → static string (don't break this).
- **Copy frozen:** `t.stats.title`, `subtitle`, `items[{value,label}]`.
- On-dark `:focus-visible` ring already set in `global.css`. Build with **`frontend-design` skill**. CSS/SVG/gradient only.

## Steps

- [ ] Use the `frontend-design` skill.
- [ ] Recompose for stronger numeric emphasis (scale, hairline dividers, on-dark accent gradient/glow); keep tabular numerals first-class.
- [ ] Refine reveal + count-up entrance; optional subtle emphasis on each number settling.
- [ ] Preserve the token re-point trick and the `"1 → 6"` static path.
- [ ] Gate animations on reduced-motion; verify EN + MY.

## Done when

- Stats strip visibly upgraded; numerals are the focal point; motion tasteful + reduced-motion-safe (CountUp snaps).
- Both langs render; grid responsive (`auto-fit minmax(180px,1fr)`).
- `bun run typecheck` + `bun run build` pass.

## Touches

- `landing/src/sections/stats-section.tsx` — redesign (+ optional co-located local helper; NO `shared-ui`/token edits).
