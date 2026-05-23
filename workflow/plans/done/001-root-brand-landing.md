# Plan 001 — OpenMyanmarLabs brand landing site

Source: `workflow/ideas/landing-page.md`

## Summary

Net-new bilingual (Myanmar-first, EN toggle) single-scroll brand showcase in `landing/`. Vite + React 19 + `motion`, no router/state lib — i18n via small React context, all copy in `src/content.js` (`en`/`my`). Sections: Nav → Hero → Apps → Approach → Stats → Get-notified CTA → Footer. Waitlist is visual-only (no backend). UI per `design-system/design-system-reference.md`.

## Phases

| #   | Phase                  | File                                        | Blocked by | Parallel-safe with |
| --- | ---------------------- | ------------------------------------------- | ---------- | ------------------ |
| 01  | Scaffold, tokens, i18n | `plans/todo/001-01-scaffold-tokens-i18n.md` | —          | —                  |
| 02  | Shared UI primitives   | `plans/todo/001-02-ui-primitives.md`        | 01         | 03                 |
| 03  | Bilingual content      | `plans/todo/001-03-bilingual-content.md`    | 01         | 02                 |
| 04  | Nav + Hero             | `plans/todo/001-04-nav-hero.md`             | 02, 03     | 05, 06             |
| 05  | Apps + Approach        | `plans/todo/001-05-apps-approach.md`        | 02, 03     | 04, 06             |
| 06  | Stats + CTA + Footer   | `plans/todo/001-06-stats-cta-footer.md`     | 02, 03     | 04, 05             |
| 07  | Assembly + polish      | `plans/todo/001-07-assembly-polish.md`      | 04, 05, 06 | —                  |

Critical path: 01 → (02 ∥ 03) → (04 ∥ 05 ∥ 06) → 07.

## Notes / risks

- **Myanmar-first default**: site renders `my` on first load, EN on toggle. Don't let English creep in as the implicit default — content keys must be identical across `en`/`my`, toggle just swaps the object.
- **App names stay English** in both languages (product brands); only taglines + surrounding copy translate.
- **Fonts**: Fraunces (display serif) + Noto Sans Myanmar (Burmese) + system sans (body). Burmese needs Noto Sans Myanmar to render correctly — confirm it loads before building text-heavy sections.
- **Waitlist visual-only** — no backend/auth/email capture wiring. Form is a styled no-op (or local-only success state) for the pitch demo.
- **Daily Sales** is the one Live app — its card links out to the Daily Sales app landing (URL is a placeholder until provided).
- `.js` vs `.jsx`: idea names `content.js` + `i18n.jsx`. Keep files kebab-case (per `landing/CLAUDE.md`), JSX-bearing files use `.jsx`.
- React 19 + `motion` (the `motion` package, successor to framer-motion) — verify peer-dep compatibility at scaffold time.
