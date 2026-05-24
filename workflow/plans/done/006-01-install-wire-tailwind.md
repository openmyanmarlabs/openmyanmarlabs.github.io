# 006-01 — Install & wire Tailwind

Plan: `006-root-tailwind-v4-electrobun-template.md` · Blocked by: — · Parallel-safe with: —

## Goal

Tailwind v4 installed + wired: plugin in Vite; `@import` + `@theme` tokens + `@custom-variant dark` in global.css; base/Myanmar-first moved into `@layer base`; manual reset removed. App still renders (old component classes kept this phase).

## Context

- App: `apps/electrobun-template/` (Bun, Vite 7 + React 19; gitignored by the parent repo).
- **Consult the `tailwind-docs-reader` subagent before writing any CSS** — use verbatim v4 syntax from the local KB (`workflow/learning/tailwind/`); do not guess or fetch online.
- KB refs: `guides/installation-vite.md` (plugin + import), `apis/theme.md` (`@theme`), `guides/dark-mode.md` (`@custom-variant`), `guides/custom-styles.md` (`@layer base`).
- Current `vite.config.ts`: `defineConfig({ base: "./", plugins: [react()] })` — **keep `base: "./"`** (relative asset URLs for `views://`).
- Current `src/main-ui/styles/global.css` holds: manual reset (`*,*::before,*::after{box-sizing/margin/padding}`), two `@font-face` blocks (KhitHaungg 400/600, `src:url("../fonts/khithaungg-*.woff2")`), `:root` font vars, `body` styles, Myanmar-first `:lang(my)`/`[lang="my"]` rules, and component classes (`.page`, `.page h1`, `.page p`, `.page-nav`, `a`, `button`, `.lang-toggle`). **Keep the component classes this phase** — the components still reference them; phase 02 deletes them.
- **Preflight:** `@import "tailwindcss"` includes Tailwind's reset, so the manual `*{}` reset is redundant — remove it. (Not in the KB; confirmed upstream — verify visual parity after.)
- **Brand scale = Tailwind default blue (oklch).** Use these exact values (`brand-600` ≈ `#2563eb`, `brand-700` ≈ `#1d4ed8`):
  ```css
  --color-brand-50: oklch(0.97 0.014 254.604);
  --color-brand-100: oklch(0.932 0.032 255.585);
  --color-brand-200: oklch(0.882 0.059 254.128);
  --color-brand-300: oklch(0.809 0.105 251.813);
  --color-brand-400: oklch(0.707 0.165 254.624);
  --color-brand-500: oklch(0.623 0.214 259.815);
  --color-brand-600: oklch(0.546 0.245 262.881);
  --color-brand-700: oklch(0.488 0.243 264.376);
  --color-brand-800: oklch(0.424 0.199 265.638);
  --color-brand-900: oklch(0.379 0.146 265.522);
  ```
- `@custom-variant dark (&:where(.dark, .dark *));` (verbatim from KB) — declares the `.dark`-class strategy used in phases 02–03.
- `@font-face` stays at top level (unlayered). Myanmar-first + `body`/base element rules go in `@layer base`. Token `--font-myanmar: "KhitHaungg", var(--font-sans);` so the `font-myanmar` utility carries the fallback.

## Steps

- [ ] `cd apps/electrobun-template && bun add tailwindcss @tailwindcss/vite`
- [ ] `vite.config.ts`: `import tailwindcss from "@tailwindcss/vite"`; plugins → `[react(), tailwindcss()]`. Keep `base: "./"`.
- [ ] Rewrite `global.css` in this order: `@import "tailwindcss";` → `@custom-variant dark (&:where(.dark, .dark *));` → `@theme { --font-sans:…; --font-myanmar:"KhitHaungg", var(--font-sans); --color-brand-50…900 }` → the two `@font-face` blocks (unlayered, `src` unchanged) → `@layer base { body{…}, Myanmar-first rules }`.
- [ ] Remove the manual `*,*::before,*::after{…}` reset (Preflight covers it).
- [ ] Keep `.page`, `.page h1`, `.page p`, `.page-nav`, `a`, `button`, `.lang-toggle` rules as-is (phase 02 removes them).
- [ ] `bun run typecheck` && `bun run build`.

## Done when

- `bun run typecheck` green; `bun run build` produces a runnable `.app`.
- `font-myanmar`, `font-sans`, `bg-brand-*`/`text-brand-*` utilities resolve (spot-check by adding one to a page, then revert).
- App still renders as before (old classes intact); Burmese still in KhitHaungg.

## Touches

- `apps/electrobun-template/package.json` — +`tailwindcss`, +`@tailwindcss/vite`.
- `apps/electrobun-template/bun.lock` — lockfile.
- `apps/electrobun-template/vite.config.ts` — add `tailwindcss()` plugin.
- `apps/electrobun-template/src/main-ui/styles/global.css` — `@import`/`@theme`/`@custom-variant`/`@layer base`; remove manual reset (keep component classes).
