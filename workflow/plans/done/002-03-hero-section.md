# 002-03 — Hero section

Plan: `002-root-decorate-ui.md` · Blocked by: 01 · Parallel-safe with: 02,04,05,06,07,08

## Goal

Redecorate the hero (copy column + floating app-tile cluster) to Apple-sale rhythm with refined entrance + scroll micro-motion. Asset-light.

## Context

- **File:** `src/sections/hero-section.tsx` — white band, `id="top"`. 2-col grid (copy `1.05fr` | floating `AppTile` cluster `0.95fr`). `Reveal` staggered entrance. Perpetual soft float on tiles (`motion`, gated on `useReducedMotion`). Daily Sales = Live (accent ring, `--elevation-float`, "Live" dot); others muted (opacity .62). Primary/secondary `Button`s smooth-scroll to `#cta`/`#apps`.
- **Copy frozen:** `t.hero.*` (eyebrow, title, subtitle, primaryCta, secondaryCta), `t.apps.items` for tiles. Title `maxWidth: 16ch` — Burmese wraps differently than EN.
- **Atmosphere** (radial wash + grain) lives in `global.css` on `body` — don't duplicate; layer with it.
- Primitives upgraded in Phase 01 (Button hover, Card hover-lift) are available. Build with **`frontend-design` skill**. Keep all new visuals CSS/SVG/gradient.

## Steps

- [ ] Use the `frontend-design` skill.
- [ ] Recompose layout for more polish (depth, spacing, gradient/atmosphere interplay) without changing copy or the grid's responsive intent.
- [ ] Add tasteful entrance (e.g. headline line/word stagger) + a subtle scroll/parallax move on the tile cluster; keep/refine the perpetual float; Live-dot pulse optional.
- [ ] Apply Button hover; ensure CTAs still smooth-scroll (reduced-motion → snap).
- [ ] Gate every new animation on reduced-motion.
- [ ] Verify EN + MY (title wraps), responsive (`<860` stack columns, `<480` single-col cluster).

## Done when

- Hero visibly upgraded; micro-motion tasteful + reduced-motion-safe.
- Both langs render; responsive behavior intact.
- `bun run typecheck` + `bun run build` pass.

## Touches

- `landing/src/sections/hero-section.tsx` — redesign (+ optional co-located local helper; NO `shared-ui`/token edits).
