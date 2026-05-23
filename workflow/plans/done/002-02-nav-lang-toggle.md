# 002-02 — Nav + sliding language toggle

Plan: `002-root-decorate-ui.md` · Blocked by: 01 · Parallel-safe with: 03,04,05,06,07,08

## Goal

Redecorate the sticky nav and replace the pill language toggle with the `Switch` primitive (spring micro-animation, both labels) — the idea's signature piece. Apple-like scroll-aware bar.

## Context

- **File:** `src/sections/nav.tsx` — sticky translucent header (`backdrop-filter: blur(20px)`, hairline bottom). Brand (logo + name) · section links (`#apps`, `#approach`) · language pill button (`onClick={toggleLang}`) · "Get notified" primary `Button` → `#cta`. Section links hide `<720px`; actions cluster stays. Smooth-scroll helpers honor reduced-motion.
- **i18n:** `useI18n()` → `t.nav`, `toggleLang`, `lang`. Myanmar-first (default `my`).
- **`Switch`** from Phase 01 (`shared-ui`).
- **Both toggle labels without hardcoding / without touching frozen `content.ts`:** import `content` and read `content.my.nav.langToggle` (`"EN"`) + `content.en.nav.langToggle` (`"မြန်မာ"`). `checked = lang === "my"` (Myanmar-first), `onChange → toggleLang`. `aria-label` from `t.nav.langToggle` (or a sensible existing key).
- Build with the **`frontend-design` skill**.

## Steps

- [ ] Use the `frontend-design` skill for the nav redesign.
- [ ] Replace the pill toggle with `Switch`: labels `"EN"` / `"မြန်မာ"` (both from the two `content` objects), `checked = lang === "my"`, `onChange = toggleLang`, accessible label.
- [ ] Scroll-aware bar: refine translucency/blur + add hairline/shadow and a subtle shrink on scroll (`motion` `useScroll` or a scroll listener); static under reduced-motion.
- [ ] Link hover micro-interaction (underline grow / color shift) using tokens.
- [ ] Polish mobile (`<720px`): toggle + CTA stay; ensure the `Switch` fits with the wider Burmese label, no overflow.
- [ ] Verify EN + MY, reduced-motion, keyboard focus order + `:focus-visible`.

## Done when

- Toggle is the sliding `Switch`: both labels visible, thumb springs on toggle, flips page language, keyboard-accessible, snaps under reduced-motion.
- Nav reacts to scroll tastefully; links have hover states.
- No layout break on mobile or desktop, in EN or MY.
- `bun run typecheck` + `bun run build` pass.

## Touches

- `landing/src/sections/nav.tsx` — redesign + `Switch` integration.
