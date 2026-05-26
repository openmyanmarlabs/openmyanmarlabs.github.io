# Spec — English headings: serif → Apple-system sans (2026-05-24)

One-line: Swap the English display font from serif Fraunces to the Apple system sans stack, killing the Times New Roman fallback.
Source: `workflow/ideas/change-font-family-for-eng.md`

## Goal

English headings on the landing site currently render in serif Fraunces — and when Fraunces (Google Fonts) is slow/unavailable, fall back to **Times New Roman**. Switch English headings to the existing `--font-sans` (Apple system stack → SF Pro on Apple devices), the "Apple product page" look. Drop Fraunces entirely. Burmese headings untouched.

## Users / context

Visitors to the OML landing site (`landing/`), all devices. English-language headings only — Burmese headings already use KhitHaungg / Noto Sans Myanmar and are out of scope.

## Scope

**In:**

- Repoint `--font-display` (`landing/src/styles/tokens.css`) to the Apple system sans stack — same value as `--font-sans`.
- Affects **all** English headings using `var(--font-display)`: global `h1–h6` (`global.css`) + the 8 section/shared files (hero, apps, approach, stats, cta, footer, stat-tile).
- Remove the `Fraunces` family from the Google Fonts `<link>` in `landing/index.html` (keep `Noto Sans Myanmar`).
- Remove the serif fallbacks (`Georgia`, `"Times New Roman"`, `serif`) so no serif can ever render for English.
- Update `design-system/design-system-reference.md` (source of truth) — Display is now sans, not "Fraunces (serif)".
- Update the stale Fraunces/"italic = emphasis" comment in `index.html`.

**Out (non-goals):**

- Burmese fonts / headings — unchanged.
- Body text — already `--font-sans`; no change.
- Self-hosting any font, or loading a new web font (e.g. Inter/SF Pro). Using the system stack only.
- Changing heading weight, size, or tracking (current 600 / `-0.02em` stays).
- Implementing italic-emphasis styling (was documented intent, never built; dropped with Fraunces).

## Requirements

- [ ] `--font-display` resolves to a sans-serif stack on all platforms; no serif fallback remains.
- [ ] All English headings render sans-serif (hero h1, every section h2, app titles, stat tiles, footer title).
- [ ] Fraunces is no longer requested over the network (removed from the `index.html` Google Fonts link).
- [ ] Burmese headings still render KhitHaungg / Noto Sans Myanmar (no regression).
- [ ] `design-system/design-system-reference.md` reflects sans display; no lingering "Fraunces (serif)" / "editorial serif headlines" claims.

## Constraints

- Keep the 8 `fontFamily: "var(--font-display)"` references working — simplest path is to keep the `--font-display` token name and only change its value (no churn across section files). Token-only edit preferred over find-replacing call sites.
- i18n: Burmese path (`:lang(my)` / `[lang="my"]` heading rules in `global.css`) must keep leading with `--font-myanmar`.
- Offline/perf: removing Fraunces drops one remote dependency — net win. (Noto Sans Myanmar still loads from Google; not in scope to change.)
- Repo convention: kebab-case files; Prettier auto-formats on save.

## Acceptance — done when

- Viewing the landing page, all English headings are visibly sans-serif (no serif, no Times New Roman) — including with the network throttled / Google Fonts blocked.
- DevTools Network shows no Fraunces request.
- Burmese headings unchanged.
- `design-system-reference.md` and `index.html` comments no longer describe a serif display font.
