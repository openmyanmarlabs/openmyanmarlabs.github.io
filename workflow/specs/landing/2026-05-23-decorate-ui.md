# Spec — Landing UI Redecoration + Micro-animation (2026-05-23)

One-line: Polish all 7 landing sections — Apple Mac-sale-page rhythm, asset-light, plus tasteful micro-animations — keeping copy + DNA frozen.
Source: `workflow/ideas/decorate-ui.md`

## Goal

Re-decorate the `landing` app section-by-section to a more refined, "prettier" Apple-inspired finish, and introduce tasteful micro-animations (signature piece: the language switcher becomes an animated sliding toggle). A **sanctioned evolution** of the existing design language — keep the Apple-white DNA, tokens, and bilingual Myanmar-first behavior; raise the polish + motion bar without abandoning restraint.

## Users / context

Visitors to the OML marketing site — desktop + mobile, web (static Vite build). Bilingual: **Myanmar-first** default (`my`), English on toggle. No auth, no accounts; single-scroll page.

## Scope

**In:**

- Re-decorate all 7 sections, each built with the `frontend-design` skill, phase-by-phase:
  - `nav` · `hero-section` · `apps-section` · `approach-section` · `stats-section` · `cta-section` · `footer`
- Borrow Apple Mac-sale-page **patterns** — layout rhythm, depth, spacing, scroll choreography, motion feel.
- Re-compose layout **within** each section (grid, spacing, arrangement) for polish.
- Tasteful micro-animations: hover/press states, toggle morph, scroll-driven moments — purposeful, not flashy.
- **Language toggle → sliding-switch** primitive: both labels visible (`EN` / `မြန်မာ`), spring-animated thumb slides on toggle. Lives in `shared-ui` as a reusable `Switch`.
- New visuals crafted in **CSS/SVG/gradients** only.
- Update `design-system/design-system-reference.md` motion principle to sanction tasteful micro-animation (current text favors "one orchestrated reveal over many micro-moves").
- Add any new design tokens to `tokens.css` (single source of truth) if needed.

**Out (non-goals):**

- **No copy/content changes** — `content.ts` (both `en` + `my`) is frozen. No headline rewrites, no new eyebrow text.
- No new or removed sections; **section order is fixed**.
- No real photography, device mockups, or sourced image assets.
- No dark-mode theme toggle.
- No backend/network — `cta-section` stays a visual-only no-op.
- No routing / multi-page; stays single-scroll.
- No bold restyle that abandons Apple-white restraint or changes the brand palette.
- Other monorepo apps untouched — `landing` only.

## Requirements

- [ ] Each of the 7 sections visibly upgraded in polish, built via `frontend-design`.
- [ ] Language switcher is a sliding-switch toggle: both labels shown, thumb slides with spring micro-animation, drives existing i18n (`toggleLang`).
- [ ] Switch is a reusable `shared-ui` primitive (kebab file, PascalCase export), keyboard-accessible (`role="switch"` / appropriate ARIA), reduced-motion safe.
- [ ] Micro-animations applied tastefully across sections (e.g. button hover/press, card hover-lift, scroll-driven reveals/parallax) without breaking the calm Apple feel.
- [ ] Every new animation honors `prefers-reduced-motion` (token + primitive + per-animation gate, matching existing pattern) — no fade/lift/float/spring when reduced.
- [ ] Both languages render correctly across all animated + re-composed elements (Burmese via KhitHaungg/Noto; mind EN↔MY text-length differences in toggle width + headline wraps).
- [ ] All styling reads from tokens — no hardcoded hex downstream; new tokens go in `tokens.css`.
- [ ] Existing band rhythm preserved (white → panel → white → ink → accent → deeper-ink) unless a section improvement consciously revises it.
- [ ] `design-system-reference.md` motion principle updated to match the new sanctioned-micro-animation direction.

## Constraints

- Stack: React 19 + Vite + `motion` (already installed). No new heavy deps; reuse `motion` + existing `shared-ui` primitives (`Reveal`, `CountUp`, `Button`, `Card`, `Badge`, `StatTile`).
- Perf: GPU-friendly transforms only (opacity/transform), target 60fps, no layout thrash. Static build stays fast; fonts self-hosted (no external CDNs).
- i18n: Myanmar-first default preserved; copy comes from `content.ts` via `useI18n` — components never hardcode strings.
- Conventions: kebab-case files/assets, PascalCase exports. `tsc --noEmit` + `vite build` must pass; prettier auto-formats on write.

## Acceptance — done when

- All 7 sections visibly redecorated; nothing regressed in layout/responsiveness (desktop + mobile).
- Sliding-switch language toggle works, animates, is keyboard-accessible, and flips the page language.
- Tasteful micro-animations present site-wide; page still reads calm/Apple-white.
- Toggling OS reduced-motion removes all motion (no springs/fades/floats); content fully usable.
- Both `en` and `my` render correctly everywhere, including animated states.
- `bun run typecheck` and `bun run build` pass clean.
- `design-system-reference.md` motion principle reflects the new direction.
- `content.ts` unchanged; no photo assets added.

## Open questions

- Exact per-section micro-animation choreography (which specific moves per section) — deferred to plan/build via `frontend-design`; this spec sets taste guardrails, not per-pixel motion.
- Whether scroll choreography warrants a shared primitive (e.g. scroll-progress / sticky helper) vs. per-section motion — decide at plan time.
