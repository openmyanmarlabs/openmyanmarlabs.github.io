# 002-07 — CTA section

Plan: `002-root-decorate-ui.md` · Blocked by: 01 · Parallel-safe with: 02,03,04,05,06,08

## Goal

Redecorate the accent-band waitlist CTA — animated gradient + input/button micro-interactions + a polished success state. Stays a visual-only no-op.

## Context

- **File:** `src/sections/cta-section.tsx` — **ACCENT BAND** (`--gradient-cta`), `id="cta"` (nav + footer + hero scroll here — id is load-bearing). Centered title + subtitle + email form; on submit `handleSubmit` only `preventDefault()` + flips `submitted` → shows `t.cta.success`.
- **VISUAL-ONLY / NO-OP — do NOT add any backend, fetch, or capture.** Keep `handleSubmit` side-effect-free beyond the local flag.
- **Copy frozen:** `t.cta.{title,subtitle,placeholder,button,success}`.
- On-dark `:focus-visible` ring already set in `global.css`. Build with **`frontend-design` skill**. CSS/SVG/gradient only.

## Steps

- [ ] Use the `frontend-design` skill.
- [ ] Recompose for polish; add a subtle animated/shifting gradient on the band (static under reduced-motion).
- [ ] Add input focus micro-interaction (ring/scale) + Button hover; animate the success-state transition (e.g. checkmark pop / cross-fade swap).
- [ ] Keep the no-op submit; keep `id="cta"`.
- [ ] Gate animations on reduced-motion; verify EN + MY; keep form responsive (wraps `<440px`).

## Done when

- CTA band visibly upgraded; gradient + focus + success motion tasteful + reduced-motion-safe.
- Submit still does nothing but flip to the success message; `id="cta"` intact.
- Both langs + responsive intact.
- `bun run typecheck` + `bun run build` pass.

## Touches

- `landing/src/sections/cta-section.tsx` — redesign (+ optional co-located local helper; NO `shared-ui`/token edits).
