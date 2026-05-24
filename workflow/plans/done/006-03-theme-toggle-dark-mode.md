# 006-03 — Theme toggle + dark-mode state

Plan: `006-root-tailwind-v4-electrobun-template.md` · Blocked by: 02 · Parallel-safe with: —

## Goal

3-state (light/dark/system) theme toggle wired through a React context + no-FOUC head script; `.dark` class driven on `<html>`, choice persisted to `localStorage`.

## Context

- **Blocked by 02** — adds `<ThemeToggle/>` into the converted page navs; needs `@custom-variant dark` from 01.
- **Consult the `tailwind-docs-reader` subagent** for the verbatim no-FOUC script + class-strategy detail. KB: `guides/dark-mode.md`.
- **Mirror the existing i18n pattern** — read `src/main-ui/i18n.tsx` (context + provider + `useI18n` hook + `document.documentElement` sync) and `content.ts` (`my` source-of-truth, `Content = typeof my`, `en: Content` — key trees symmetric, compile-enforced).
- **`theme.tsx` (new):** `Theme = "light" | "dark" | "system"`, default `"system"`. Context exposes `theme`, `setTheme`, `cycleTheme` (light→dark→system→light), resolved `isDark`. On mount + change: persist (`localStorage.theme = "light"|"dark"`; `localStorage.removeItem("theme")` for system) and toggle `.dark` on `document.documentElement` via `theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches)`. While in `"system"`, subscribe to `matchMedia("(prefers-color-scheme: dark)")` change.
- **No-FOUC script (verbatim, inline in `index.html` `<head>` _before_ the module script):**
  ```html
  <script>
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
  </script>
  ```
- **`theme-toggle.tsx` (new; kebab file, `ThemeToggle` export):** button cycling the 3 states (`onClick={cycleTheme}`), label from `t.nav.themeToggle[theme]`. Reuse the same pill utility classes as `language-toggle.tsx` (from phase 02) for visual parity.
- **`content.ts`:** add `nav.themeToggle: { light, dark, system }` to **both** `my` (source) and `en` (typed `Content`) — keep keys symmetric. e.g. `my`: light `"အလင်း"`, dark `"အမှောင်"`, system `"စနစ်"`; `en`: `"Light"`, `"Dark"`, `"System"`.
- **`main.tsx`:** wrap the tree in `<ThemeProvider>` (alongside `I18nProvider`; keep `StrictMode`).
- **Pages:** add `<ThemeToggle />` beside `<LanguageToggle />` in both page navs.

## Steps

- [ ] `index.html`: add the inline no-FOUC `<script>` in `<head>`.
- [ ] `content.ts`: add `nav.themeToggle` (my + en).
- [ ] `theme.tsx`: context/provider/hook mirroring `i18n.tsx`; localStorage + matchMedia + `.dark` sync.
- [ ] `theme-toggle.tsx`: 3-state cycle button; labels from content; pill styling.
- [ ] `main.tsx`: wrap app in `ThemeProvider`.
- [ ] `hello-page.tsx` + `about-page.tsx`: add `<ThemeToggle/>` in nav beside `<LanguageToggle/>`.
- [ ] `bun run typecheck`; `bun start` to sanity-check the toggle.

## Done when

- Toggle cycles light → dark → system → light; UI updates live.
- Choice persists across app restart (localStorage); **no** light→dark flash on launch (head script).
- `"system"` tracks OS appearance changes live.
- Labels render in both `my` + `en`; `bun run typecheck` green.

## Touches

- `src/main-ui/theme.tsx` (new), `src/main-ui/theme-toggle.tsx` (new).
- `src/main-ui/content.ts` — `themeToggle` labels.
- `src/main-ui/main.tsx` — `ThemeProvider`.
- `src/main-ui/hello-page.tsx`, `about-page.tsx` — add `<ThemeToggle/>`.
- `index.html` — no-FOUC head script.
