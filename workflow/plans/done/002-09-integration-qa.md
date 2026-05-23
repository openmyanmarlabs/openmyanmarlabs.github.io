# 002-09 — Integration & QA polish

Plan: `002-root-decorate-ui.md` · Blocked by: 02,03,04,05,06,07,08 · Parallel-safe with: —

## Goal

Verify the redecorated page as a whole and apply any seam-level polish. Cross-cutting QA — not a redo of section internals.

## Context

- **`src/app.tsx`** composes sections in order: Nav · Hero · Apps · Approach · Stats · CTA · Footer, with a skip link.
- **`src/styles/global.css`** holds atmosphere (radial wash + grain), `scroll-behavior: smooth` (off under reduced-motion), anchor `scroll-margin-top: 88px`, `:focus-visible` rings (light + on-dark for `#stats`/`#cta`/`footer`), skip link.
- All section + foundation phases are done. Band rhythm target: white → panel → white → ink → accent → deeper-ink.
- This phase touches only `app.tsx` / `global.css` for whole-page polish — **no section-internal changes** (those are owned by 02–08).

## Steps

- [ ] **Reduced-motion sweep** (toggle OS setting): no spring / fade / float / parallax / gradient-motion anywhere; all content usable.
- [ ] **Both-language full-page pass** (EN + MY via the new toggle): no overflow/clipping, headline wraps OK, toggle width OK with Burmese, KhitHaungg/Noto applied.
- [ ] **Responsive audit** at ≤480 / ≤720 / ≤860 / desktop: nav collapse, hero stack + cluster, card grids reflow, footer columns collapse.
- [ ] **Band rhythm + seams:** confirm the band sequence is intact (or consciously revised); section edges read clean; atmosphere/grain don't clash with new section visuals; z-index/overflow sane.
- [ ] **Keyboard pass:** `:focus-visible` rings on light + dark bands, skip link, `Switch`, anchor links + smooth-scroll.
- [ ] Optional whole-page polish in `app.tsx`/`global.css` only (e.g. scroll-progress indicator, section-transition easing).
- [ ] `bun run typecheck` + `bun run build` clean.

## Done when

- Spec acceptance met across the whole page: all 7 sections upgraded, nothing regressed, calm Apple-white feel preserved.
- Reduced-motion removes all motion; both langs correct; responsive at all breakpoints.
- `bun run typecheck` + `bun run build` pass clean.

## Touches

- `landing/src/app.tsx` — optional seam polish only.
- `landing/src/styles/global.css` — optional whole-page polish only.
- Everything else: verification only.
