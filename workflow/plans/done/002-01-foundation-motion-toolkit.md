# 002-01 — Foundation: motion toolkit, Switch, primitive upgrades, design doc

Plan: `002-root-decorate-ui.md` · Blocked by: — · Parallel-safe with: —

## Goal

Land the shared design infrastructure every section builds on: new motion tokens, the reusable `Switch` primitive, Button/Card micro-interaction upgrades, and the design-system-reference motion update. Unblocks all section phases.

## Context

- **`tokens.css` is the single source of truth** — no hardcoded hex/timing downstream. Existing motion tokens: `--duration-fast/base/slow` (150/250/400ms), `--ease-standard` `cubic-bezier(.4,0,.2,1)`, `--ease-reveal` `cubic-bezier(.22,1,.36,1)`. A `prefers-reduced-motion` block already collapses all `--duration-*` to ~0 — **new duration tokens must be added to that override too.**
- **shared-ui barrel:** `src/shared-ui/index.ts` re-exports primitives + prop types. Existing: `Button` (motion `whileTap` scale .98 only — no hover), `Card` (static, no hover, `elevation` false/sm/md/float), `Reveal` (scroll fade+24px lift, staggered, `useReducedMotion` → inert), `CountUp`, `StatTile`, `Badge`.
- **Reduced-motion pattern to follow:** tokens collapse durations + components call `useReducedMotion()` from `motion/react` and render a static branch (see `reveal.tsx`, `count-up.tsx`, hero float).
- **`motion` lib** (`motion/react`) installed; `motion.create(as)` used for polymorphic motion elements (see `button.tsx`).
- **Design doc:** `design-system/design-system-reference.md` Motion section + Principles currently say _"Calm motion: one orchestrated reveal beats many micro-moves."_ Must be updated to sanction tasteful, purposeful micro-animation.

## Steps

- [ ] Add motion tokens to `tokens.css`: spring/back easings (e.g. `--ease-spring`, `--ease-out-back`), a hover lift distance + hover elevation, toggle/switch timing. Add any new `--duration-*` to the `prefers-reduced-motion` override so they collapse too.
- [ ] Build `src/shared-ui/switch.tsx` — generic, **controlled** `Switch`: track + sliding thumb, two labels (left/right via props), spring thumb animation (`motion`), `role="switch"` + `aria-checked`, keyboard (Space/Enter), `:focus-visible` ring, reduced-motion-safe (thumb snaps, no spring). NOT lang-specific — `checked` + `onChange` API. Width must tolerate the longer Burmese label.
- [ ] Export `Switch` (+ `SwitchProps`) from `src/shared-ui/index.ts`.
- [ ] Enhance `Button`: add `whileHover` micro-interaction (subtle lift/scale + shadow) layered on the existing `whileTap`; reduced-motion-safe.
- [ ] Enhance `Card`: add an **opt-in** `interactive` (or `hover`) prop → hover lift + elevation bump; default off so existing static cards are unchanged; reduced-motion-safe.
- [ ] (Optional) If sections will share scroll choreography, add a lightweight `src/shared-ui/parallax.tsx` (motion `useScroll`/`useTransform`, inert under reduced-motion) + export it. Otherwise leave scroll motion to per-section local helpers.
- [ ] Update `design-system/design-system-reference.md` Motion + Principles: sanction tasteful, purposeful micro-animation (hover / press / toggle / scroll moments) alongside calm reveals; keep "purposeful, not flashy" + "honor reduced-motion".

## Done when

- New motion tokens present; `prefers-reduced-motion` override covers every `--duration-*`.
- `Switch` renders, thumb springs on toggle, works via mouse + keyboard, correct `role`/`aria-checked`, `:focus-visible` ring, snaps under reduced-motion; exported from barrel.
- `Button` has a hover state; `Card` supports opt-in hover-lift; both reduced-motion-safe; existing usages visually unbroken.
- `design-system-reference.md` motion principle reflects the new direction.
- `bun run typecheck` + `bun run build` pass.

## Touches

- `landing/src/styles/tokens.css` — new motion tokens (+ reduced-motion override).
- `landing/src/shared-ui/switch.tsx` — NEW `Switch` primitive.
- `landing/src/shared-ui/index.ts` — export `Switch`.
- `landing/src/shared-ui/button.tsx` — hover micro-interaction.
- `landing/src/shared-ui/card.tsx` — opt-in hover-lift.
- `landing/src/shared-ui/parallax.tsx` — (optional) scroll helper.
- `design-system/design-system-reference.md` — motion principle.
