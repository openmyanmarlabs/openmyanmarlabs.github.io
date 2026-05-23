# 002-05 — Approach section

Plan: `002-root-decorate-ui.md` · Blocked by: 01 · Parallel-safe with: 02,03,04,06,07,08

## Goal

Redecorate the four-principle grid with hover micro-interactions + light structure (numerals / SVG accents). Asset-light.

## Context

- **File:** `src/sections/approach-section.tsx` — white band, `id="approach"`. Header (title + subtitle) + `auto-fit` grid (`minmax(260px,1fr)`) of 4 principle cards (`Card` sm, title `h3` + blurb). `Reveal stagger`.
- **Copy frozen:** `t.approach.title`, `subtitle`, `principles[{title,blurb}]` (4 items).
- Card opt-in hover-lift from Phase 01 available. Build with **`frontend-design` skill**. CSS/SVG only — no sourced icons.

## Steps

- [ ] Use the `frontend-design` skill.
- [ ] Recompose the principle cards for polish; add light structure — e.g. an index numeral or a crafted CSS/SVG glyph per principle, or a connecting accent line.
- [ ] Apply Card hover-lift; refine the staggered reveal.
- [ ] Gate animations on reduced-motion; verify EN + MY (Burmese titles/blurbs longer); keep `auto-fit` responsiveness.

## Done when

- Approach grid visibly upgraded; hover + reveal tasteful + reduced-motion-safe.
- Both langs + responsive grid intact.
- `bun run typecheck` + `bun run build` pass.

## Touches

- `landing/src/sections/approach-section.tsx` — redesign (+ optional co-located local helper; NO `shared-ui`/token edits).
