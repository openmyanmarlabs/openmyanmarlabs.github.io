# Spec — Add Tailwind v4 to Electrobun template (2026-05-24)

One-line: Make Tailwind CSS v4 the styling system of `apps/electrobun-template/` — wire it up, convert the example UI to utilities, add class-strategy dark mode + brand tokens.
Source: `workflow/ideas/electron/add-tailwind-v4-in-electronbun-template.md`

## Goal

Adopt Tailwind v4 (CSS-first, `@tailwindcss/vite`) as the template's styling approach. The example pages are rewritten in utility classes; a `@theme` block holds font + brand-color tokens; dark mode works via a `.dark` class with a 3-state toggle. Same visual look as today (plus dark mode), now expressed in Tailwind so the template models the pattern end-to-end. Must keep working under Electrobun's `views://` build, in dev (HMR), and bilingual.

## Users / context

Developers cloning the template as a starting point for an Open Myanmar Labs desktop app. They expect Tailwind utilities to "just work" in dev and prod, the Myanmar-first font behavior intact, and a dark mode they can build on. Runs offline on-device (macOS WebView); default UI language Burmese (`my`).

## Scope

**In:**

- Install `tailwindcss` + `@tailwindcss/vite`; add `tailwindcss()` to `vite.config.ts` plugins (keep `base: "./"`).
- `@import "tailwindcss";` in `src/main-ui/styles/global.css`. Tailwind **Preflight** replaces the hand-written reset (remove the `*{box-sizing/margin/padding}` block).
- `@theme` tokens: `--font-sans`, `--font-myanmar: "KhitHaungg"`, and a `--color-brand-50…900` **blue** scale (oklch, anchored on today's `#2563eb` ≈ blue-600).
- **Keep** the KhitHaungg `@font-face` rules (2 weights) and the Myanmar-first `:lang(my)`/`[lang="my"]` rules (move element/base rules into `@layer base`). Font-face `src: url("../fonts/…")` stays relative — works under `views://`.
- Convert `hello-page.tsx`, `about-page.tsx`, `language-toggle.tsx` to utility classes; **delete** the now-unused component CSS (`.page`, `.page-nav`, `.lang-toggle`, link/button rules). Preserve the current appearance.
- **Dark mode (class strategy):** `@custom-variant dark (&:where(.dark, .dark *));`. New `theme-toggle.tsx` (kebab file, PascalCase export) cycling **light / dark / system**, placed beside the language toggle. `dark:` variants on the example pages.
- **Theme state:** a React context (`theme.tsx`) mirroring the existing `i18n.tsx` pattern — holds choice, toggles `.dark` on `document.documentElement`, persists to `localStorage.theme`.
- **No-FOUC:** inline `<script>` in `index.html` `<head>` that sets `.dark` before first paint from `localStorage.theme` ?? `prefers-color-scheme`.
- Add theme-toggle labels (light/dark/system) to `content.ts` in **both** `my` and `en`.
- Ground all CSS in the local KB (`workflow/learning/tailwind/`) — verbatim v4 syntax.

**Out (non-goals):**

- No PostCSS / CLI / webpack install path — Vite plugin only.
- No `tailwind.config.js` / any JS config (v4 is CSS-first).
- No Tailwind plugins (typography, forms, etc.).
- No redesign / new visual identity — keep the current look; dark mode is the only added surface.
- No new routes or pages beyond existing hello + about.
- No component/design-system library beyond the `@theme` font + brand tokens.
- Don't touch `landing/` or any other app — change is confined to `apps/electrobun-template/`.
- No automated visual/regression tests.
- Brand hue is blue only — no alternate palettes shipped.

## Requirements

- [ ] `bun add tailwindcss @tailwindcss/vite`; `tailwindcss()` added to Vite plugins; `base: "./"` unchanged.
- [ ] `global.css` begins `@import "tailwindcss";`; manual reset removed (Preflight covers it).
- [ ] `@theme` defines `--font-sans`, `--font-myanmar`, `--color-brand-50…900` (oklch blue).
- [ ] KhitHaungg `@font-face` (400 + 600) retained; Myanmar-first rules retained (in `@layer base`); Burmese still renders in KhitHaungg.
- [ ] `font-myanmar` / `font-sans` utilities exist and Myanmar-first still applies when `lang="my"`.
- [ ] Example pages + language toggle re-expressed in utilities; unused component CSS deleted; appearance matches pre-change (light mode).
- [ ] `@custom-variant dark` declared; example pages carry `dark:` variants.
- [ ] `theme-toggle.tsx` cycles light/dark/system; choice persists across app restarts.
- [ ] Inline head script prevents a light→dark flash on launch.
- [ ] Theme-toggle labels present in `content.ts` for both `my` and `en`.
- [ ] `bun run typecheck` passes; `bun run build` yields a runnable `.app` whose styles render under `views://`.
- [ ] `bun start` dev: editing a utility class hot-updates the window (HMR).

## Constraints

- **Tailwind v4 only**, CSS-first — no JS config; consult `workflow/learning/tailwind/` (don't fetch online or guess syntax). Plan phases must use the `tailwind-docs-reader` subagent.
- **`views://` / `base: "./"`** — built CSS is bundled into `dist/assets/`; all asset URLs must stay relative (the existing post-build copy flow is unchanged).
- **Offline-first** — Tailwind is build-time; zero runtime/CDN dependency. Fonts already local.
- **Browser baseline** — Tailwind v4 needs Safari **16.4+** (Chrome 111+/FF 128+). Electrobun renders in the system WebView, so the host macOS must meet that (macOS 13+). Flag if older support is required.
- **Bilingual** — toggle copy in `my` + `en`; Myanmar-first preserved; default lang `my`.
- **Repo conventions** — kebab-case filenames (`theme-toggle.tsx`), PascalCase exports; auto-prettier on write; clipped docs.

## Acceptance — done when

- Fresh `bun install && bun run build` produces a runnable unsigned `.app`; opening it shows the styled pages (light) identical to the pre-change look, with fonts and Burmese rendering correctly.
- Toggling theme switches light ⇄ dark ⇄ system live; relaunching the app restores the chosen mode with no flash.
- Switching language to Burmese renders KhitHaungg; English renders the sans stack.
- `bun run typecheck` is green; `grep` finds no leftover `.page`/`.lang-toggle` CSS.
- `bun start` HMR: changing a utility class updates the window without full reload.

## Open questions

- Target macOS floor: if the template must support macOS < 13 (Safari < 16.4), Tailwind v4 output may break — confirm the minimum OS, else accept 13+ as the baseline.
- Theme-toggle UX shape (cycle button vs. 3-segment control) — defer to plan/build; behavior is fixed (light/dark/system), only the control's form is open.
