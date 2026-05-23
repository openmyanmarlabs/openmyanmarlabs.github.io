# Plan 002 — Landing UI Redecoration + Micro-animation

Source: `workflow/specs/2026-05-23-decorate-ui.md`

## Summary

Redecorate all 7 landing sections to a more refined Apple-inspired finish + tasteful micro-animations; signature piece = sliding-switch language toggle. **Phase 01 (Foundation)** lands all shared infra — new motion tokens, the reusable `Switch` primitive, Button/Card micro-interaction upgrades, design-system-reference motion update. Then **one phase per section** (02–08), each touching only its own `sections/<name>.tsx`, all parallel-safe. **Phase 09** does cross-cutting QA (reduced-motion sweep, both langs, responsive, band rhythm, typecheck+build).

## Phases

| #   | Phase                         | File                                             | Blocked by           | Parallel-safe with |
| --- | ----------------------------- | ------------------------------------------------ | -------------------- | ------------------ |
| 01  | Foundation — motion toolkit   | `plans/todo/002-01-foundation-motion-toolkit.md` | —                    | —                  |
| 02  | Nav + sliding language toggle | `plans/todo/002-02-nav-lang-toggle.md`           | 01                   | 03,04,05,06,07,08  |
| 03  | Hero section                  | `plans/todo/002-03-hero-section.md`              | 01                   | 02,04,05,06,07,08  |
| 04  | Apps section                  | `plans/todo/002-04-apps-section.md`              | 01                   | 02,03,05,06,07,08  |
| 05  | Approach section              | `plans/todo/002-05-approach-section.md`          | 01                   | 02,03,04,06,07,08  |
| 06  | Stats section                 | `plans/todo/002-06-stats-section.md`             | 01                   | 02,03,04,05,07,08  |
| 07  | CTA section                   | `plans/todo/002-07-cta-section.md`               | 01                   | 02,03,04,05,06,08  |
| 08  | Footer                        | `plans/todo/002-08-footer.md`                    | 01                   | 02,03,04,05,06,07  |
| 09  | Integration & QA polish       | `plans/todo/002-09-integration-qa.md`            | 02,03,04,05,06,07,08 | —                  |

Critical path: **01 → (02–08 in parallel) → 09**.

## Notes / risks

- **Per-section split (7) is the user's explicit instruction** ("phase by phase for each component"). Kept despite >8 total because each section is an independent file → all 7 are genuinely parallel-safe, and each is a real `frontend-design` unit (full redesign + micro-motion + responsive + both langs + reduced-motion).
- **Parallel-safety rule (load-bearing):** section phases (02–08) edit ONLY their own `sections/<name>.tsx` (+ co-located local helper files if needed). ALL shared changes — `tokens.css`, `shared-ui/*`, `global.css`, `design-system-reference.md` — are owned by Phase 01. If a section discovers it needs a NEW shared primitive mid-build, add it to Phase 01 first, or run that section serially. Never edit `shared-ui` from two phases at once.
- **Why 01 blocks everything:** its Button/Card upgrades change every section's look; sections must be designed against the final primitives, not the old ones.
- **Lang toggle / frozen content:** spec freezes `content.ts`, but a two-label switch needs both endonyms at once. They already exist across the two language objects — `content.my.nav.langToggle` = `"EN"`, `content.en.nav.langToggle` = `"မြန်မာ"`. Read both objects directly → both labels, no hardcoding, freeze intact. (Decision baked into Phase 02.)
- **`Switch` built in 01, consumed only by Nav (02).** Generic/controlled so it stays reusable, not lang-specific.
- **Reduced-motion:** every new animation gated via the established pattern — `tokens.css` collapses durations under `prefers-reduced-motion`, plus per-animation `useReducedMotion()` checks, plus `Reveal` already inert. Phase 09 sweeps the whole page.
- **`cta-section` stays a visual-only no-op** — no backend/network added (Phase 07).
- **content.ts frozen** — compile enforces EN/MY key symmetry; no copy edits anywhere.
- Each section phase MUST be built with the `frontend-design` skill (per spec + idea).
