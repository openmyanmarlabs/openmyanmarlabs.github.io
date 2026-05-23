# 001-02 — Shared UI primitives

Plan: `001-root-brand-landing.md` · Blocked by: 01 · Parallel-safe with: 03

## Goal

Build the reusable presentational components every section consumes — Button, Badge, Card, Stat tile, Count-up, scroll-reveal wrapper.

## Context

- Blocked by 01 (needs tokens + global styles). Parallel-safe with 03 (content authoring — disjoint files).
- `landing/CLAUDE.md`: kebab-case files in `shared-ui/`; export PascalCase (`button.jsx` → `Button`); `.jsx`.
- Specs (`design-system/design-system-reference.md`):
  - Button: primary (accent pill) / secondary (panel) / ghost; sizes sm/md/lg; press-scale `.98`.
  - Badge: free (green) / soon (gray) / pro (blue) / neutral. App status → Live=free/green, Coming soon=soon/gray.
  - Card: white surface, hairline border, optional shadow, rounded.
  - Stat tile: small label + big value (tabular numerals).
  - Count-up: number animates to value (via `motion`).
  - Scroll reveal: fade + ~24px lift, staggered, once; ease reveal `cubic-bezier(.22,1,.36,1)`; **must honor reduced-motion** (no anim — snap/show).
- Use tokens (CSS vars) from phase 01 — no hardcoded hex.
- Pure/presentational — no business logic, no baked-in strings (text via props/children so phase-03 copy flows through).

## Steps

- [ ] Create `landing/src/shared-ui/`.
- [ ] `button.jsx` — primary/secondary/ghost, sm/md/lg, press-scale.
- [ ] `badge.jsx` — free/soon/pro/neutral.
- [ ] `card.jsx` — surface + hairline + optional shadow + radius.
- [ ] `stat-tile.jsx` — label + big tabular value.
- [ ] `count-up.jsx` — animate to target via `motion`; snaps under reduced-motion.
- [ ] `reveal.jsx` — scroll-triggered fade+lift, staggered, once; inert under reduced-motion.
- [ ] Optional barrel/index for ergonomic imports.

## Done when

- All six primitives render in isolation with token-driven styling.
- Button shows all variants/sizes + press-scale; Badge shows all four variants.
- Count-up animates and snaps under reduced-motion.
- Reveal fades+lifts on scroll once, inert under reduced-motion.

## Touches

- `landing/src/shared-ui/button.jsx`
- `landing/src/shared-ui/badge.jsx`
- `landing/src/shared-ui/card.jsx`
- `landing/src/shared-ui/stat-tile.jsx`
- `landing/src/shared-ui/count-up.jsx`
- `landing/src/shared-ui/reveal.jsx`
