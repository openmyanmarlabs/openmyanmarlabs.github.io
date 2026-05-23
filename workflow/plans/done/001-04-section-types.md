# 001-04 — Typed sections

Plan: `001-root-landing-typescript-migration.md` · Blocked by: 02, 03 · Parallel-safe with: —

## Goal

Convert the 7 page sections to `.tsx`. They consume the now-typed `useI18n` (typed
`t`) and the typed `shared-ui` primitives, so most types flow through inference.

## Context

- Files: `sections/{nav,hero-section,apps-section,approach-section,stats-section,
cta-section,footer}.jsx`.
- Every section imports `../i18n` (`useI18n`) + `../shared-ui` (extensionless, phase 01).
  Blocked by 02 (i18n/content types) and 03 (shared-ui prop types) — both must be done
  so `t` and component props are typed; otherwise sections lean on `allowJs` fallbacks.
- These are leaf components: mostly `export function X() { const { t } = useI18n(); … }`,
  no props. Typing burden is light — annotate any local helpers, map callbacks
  (`items.map((item) => …)` now gets typed `item`), and event handlers (e.g. the CTA
  form `onSubmit`, email input `onChange` in `cta-section`).
- `apps-section` consumes `status` ("live"|"soon") + `badge` copy and renders `Badge`
  — verify the status union lines up with `Badge`'s prop type from phase 03.
- No new behavior — pure rename + annotations. Watch for readonly friction if phase 02
  narrowed arrays (`.map` over readonly is fine; mutation would error — none expected).

## Steps

- [ ] Convert each of the 7 `sections/*.jsx` → `.tsx`.
- [ ] Add types only where inference needs help: event handlers (`cta-section` form/input),
      any non-inferred locals. Let `t`-driven `.map` callbacks infer from `Content`.
- [ ] Confirm `apps-section` `status` → `Badge` prop types align (no cast).
- [ ] `bunx tsc --noEmit` → clean.

## Done when

- All 7 sections are `.tsx`; no `.jsx` in `sections/`.
- Event handlers typed (no implicit `any`); strict passes with no `any`.
- `bunx tsc --noEmit` clean.

## Touches

- `landing/src/sections/{nav,hero-section,apps-section,approach-section,stats-section,cta-section,footer}.jsx` → `.tsx`.
