# Spec — KhitHaungg Myanmar Font (landing) (2026-05-23)

One-line: Self-host the KhitHaungg font family and make it the primary Burmese typeface in the `landing` app, active whenever locale is `my`.
Source: `workflow/ideas/change-font-family.md`

## Goal

When a user switches the `landing` app to Burmese (`lang="my"`), all Burmese text renders in **KhitHaungg** instead of Noto Sans Myanmar. KhitHaungg is self-hosted (woff2), leads the Myanmar font stack, with Noto Sans Myanmar kept as fallback for glyph gaps. English is unaffected.

## Users / context

- Visitors to the `landing` app who toggle to Burmese (default locale is `my`).
- Locale drives `<html lang>` (synced by `src/i18n.tsx`); CSS reacts via existing `[lang="my"]` / `:lang(my)` selectors. No new switching mechanism needed.

## Scope

**In:**

- Convert 4 KhitHaungg `.otf` files (`workflow/ideas/fonts/Z20-KhitHaungg-{Regular,Medium,SemiBold,Bold}.otf`) → `.woff2`.
- Store converted fonts under `landing/public/fonts/`.
- `@font-face` declarations for family `KhitHaungg`, weights 400/500/600/700, `font-display: swap`.
- New CSS var (e.g. `--font-myanmar`) updated so KhitHaungg leads, Noto Sans Myanmar follows as fallback, then sans fallback.
- KhitHaungg applies to **all** Burmese text incl. headings (it leads the var the existing `[lang="my"]` rules already consume).

**Out (non-goals):**

- Other apps / the `design-system` package — `landing` only.
- English / Latin typography (Fraunces, system sans) — unchanged.
- Removing the Noto Sans Myanmar Google Fonts link — kept as fallback.
- New language-switching UI or i18n changes.
- Font subsetting / per-glyph optimization beyond format conversion.
- Variable-font packaging — ship discrete static weights.

## Requirements

- [ ] All 4 weights converted to woff2 and present in `landing/public/fonts/`.
- [ ] `@font-face` maps each woff2 to family `KhitHaungg` at its weight (400/500/600/700), `font-style: normal`, `font-display: swap`.
- [ ] Myanmar font stack = `"KhitHaungg", "Noto Sans Myanmar", <sans fallback>`.
- [ ] In Burmese mode, body, small/caption, and h1–h3 Burmese text render in KhitHaungg.
- [ ] Bold/medium Burmese text (`<strong>`, 600 headings) uses the matching KhitHaungg weight (no synthetic bold).
- [ ] English mode renders unchanged (Fraunces display + system sans).
- [ ] Noto Sans Myanmar still loads and serves as fallback for glyphs KhitHaungg lacks.

## Constraints

- **Stack**: Vite 7 + React 19, vanilla CSS (no Tailwind). Tokens in `src/styles/tokens.css`, rules in `src/styles/global.css`. Vite serves `public/` as-is.
- **i18n**: custom React context (`src/i18n.tsx`); locales `my` (default) / `en`; do not alter switching logic.
- **Offline-first**: KhitHaungg must be self-hosted (no CDN); woff2 keeps payload small.
- **Conversion tooling**: needs a one-time `.otf → .woff2` step (e.g. `fonttools`/`woff2`); document the exact command used.
- **Naming**: kebab-case font assets (repo convention), e.g. `khithaungg-400.woff2` … `khithaungg-700.woff2`.
- **Docs**: concise/clipped per root `CLAUDE.md`.

## Acceptance — done when

- Toggling `landing` to Burmese visibly renders Burmese copy in KhitHaungg (headings + body), confirmed in browser.
- DevTools shows KhitHaungg woff2 files loaded from `/fonts/`, not Google CDN, for Burmese text.
- Switching back to English shows no KhitHaungg usage; layout/typography unchanged.
- Bold Burmese text uses real KhitHaungg Bold (700), not faux-bold.
- A Burmese glyph absent from KhitHaungg (if any) falls back to Noto Sans Myanmar rather than tofu.

## Open questions

- Exact asset filename convention: `khithaungg-400.woff2` (weight-numbered) vs `khithaungg-regular.woff2` (name-based)? Pick at plan time; weight-numbered recommended.
- Should a single `@font-face` block live in `global.css` or a dedicated `src/styles/fonts.css`? Cosmetic; decide at plan time.
