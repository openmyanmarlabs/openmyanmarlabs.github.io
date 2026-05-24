# 006-02 — Convert UI to utilities + dark variants

Plan: `006-root-tailwind-v4-electrobun-template.md` · Blocked by: 01 · Parallel-safe with: —

## Goal

Rewrite hello-page, about-page, language-toggle in Tailwind utilities (same light look) with `dark:` variants; delete the now-unused hand-written component CSS.

## Context

- **Blocked by 01** — needs Tailwind + `@theme` tokens + `@custom-variant dark` available.
- **Consult the `tailwind-docs-reader` subagent before writing classes** — verbatim v4 utilities; mind the content-detection gotcha (no interpolated class strings — use complete static class names). KB: `guides/content-detection.md`.
- Files (all in `src/main-ui/`):
  - `hello-page.tsx` — `<main className="page">`, `<h1>{t.hello.greeting}</h1>`, `<nav className="page-nav">` with `<LanguageToggle/>` + `<Link to="/about">`.
  - `about-page.tsx` — same shape + `<p>{t.about.body}</p>`, `<Link to="/">`.
  - `language-toggle.tsx` — `<button type="button" className="lang-toggle">`.
- **CSS → utility mapping (preserve appearance):**
  - `.page` → `flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center` + backdrop `bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100`.
  - `.page h1` (2.5rem/600) → `text-4xl font-semibold`.
  - `.page p` (max 32rem, #555) → `max-w-lg text-neutral-600 dark:text-neutral-400`.
  - `.page-nav` → `flex items-center gap-4`.
  - links (`a`, #2563eb → #1d4ed8 hover) → `text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400`.
  - `.lang-toggle` (pill) → `cursor-pointer rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm font-medium transition-colors hover:border-brand-600 hover:bg-brand-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700`.
- **Body backdrop:** add `@layer base { body { @apply bg-white dark:bg-neutral-900; } }` in global.css so no white gutter shows behind the page in dark (page container's `min-h-screen` + this both cover it). `@apply` works here — global.css imports Tailwind.
- **Delete from global.css:** `.page`, `.page h1`, `.page p`, `.page-nav`, `a`, `a:hover`, `button`, `.lang-toggle`, `.lang-toggle:hover`. **Keep** `@import`/`@theme`/`@custom-variant`/`@font-face`/`@layer base` (Myanmar-first + body).

## Steps

- [ ] Convert `hello-page.tsx`, `about-page.tsx`, `language-toggle.tsx` to the utility classes above (incl. the `<Link>` in each nav).
- [ ] Add the `body` backdrop `@apply` rule in `@layer base`.
- [ ] Delete the unused component-class blocks from `global.css`.
- [ ] `bun run typecheck` && `bun run build`; visually confirm the light look matches pre-change.

## Done when

- Pages render identically to pre-change in **light** mode (centered, same type sizes, blue links, pill toggle).
- `grep -rn 'className="page\|page-nav\|lang-toggle' src` → no hits; `grep -nE '\.page|\.lang-toggle' src/main-ui/styles/global.css` → no hits.
- `dark:` variants present on page containers, links, toggle.
- typecheck + build green.

## Touches

- `src/main-ui/hello-page.tsx`, `about-page.tsx`, `language-toggle.tsx` — utilities + `dark:` variants.
- `src/main-ui/styles/global.css` — body backdrop rule; delete component classes.
