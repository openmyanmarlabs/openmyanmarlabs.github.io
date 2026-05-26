# 014-03 — Light-only (remove dark mode)

Plan: `014-root-invoice-ux-fixes-1.md` · Blocked by: — · Parallel-safe with: 01, 02

## Goal

App always renders light. Remove the theme toggle UI, theme store, and the FOUC head script; OS dark mode has no effect. Leave the dormant `dark:` utility classes in components untouched (per spec).

## Context

- Reason: dark colors break PDF / invoice export. Light-only is the fix.
- **Dark variant is class-based** — `apps/open-myanmar-invoice/src/styles/global.css:10`: `@custom-variant dark (&:where(.dark, .dark *))`. So `dark:` utilities ONLY apply under a `.dark` ancestor. Once nothing ever adds `.dark`, every `dark:` class is permanently dormant — even under OS dark mode. So we do NOT need to strip `dark:` classes or change the variant. Just stop anything from adding `.dark`.
- What adds `.dark` today:
  - `index.html` head `<script>` (the no-FOUC toggler) — reads `localStorage.theme` / `prefers-color-scheme`.
  - `src/stores/theme-store.ts` — `applyTheme` toggles `.dark`, plus a module-level `matchMedia` subscription.
- `theme-store` importers (grep): `theme-store.ts`, `theme-toggle.tsx`, `navbar.tsx`. So removal = delete the store + toggle, and drop `ThemeToggle` from the navbar.
- **navbar.tsx is also rewritten in phase 04** (nav → sidebar). This phase must leave navbar compiling + the app working (top nav still present, just no theme toggle). 04 takes it from there. (This ordering is why 04 is blocked by 03.)
- Leave `global.css` as-is (the `dark:` `@apply` in `body` and the `@custom-variant` line are harmless once `.dark` is never set). Optional: drop `dark:bg-neutral-900` from the `body` `@apply` for tidiness — not required.
- Pure removal/UI; no unit tests (no logic contract). Verified by the manual walk (launches light, no FOUC, OS dark mode ignored).

## Steps

- [ ] Remove the `<script>` block from `index.html` `<head>` (the `.dark` FOUC toggler). Keep `<html lang="my">`, meta, title.
- [ ] Delete `src/stores/theme-store.ts`.
- [ ] Delete `src/components/common/theme-toggle.tsx`.
- [ ] Edit `src/components/common/navbar.tsx`: remove the `ThemeToggle` import + its usage (leave `LanguageToggle` and the route links). App still compiles + runs.
- [ ] Grep to confirm no remaining import of `theme-store` / `theme-toggle` / `useThemeStore` / `cycleTheme`.
- [ ] Leave i18n `nav.themeToggle.{light,dark,system}` keys in `content.ts` for now (harmless; can be removed in 04 when the shell strings are reworked) — or remove if trivial.
- [ ] `bun run typecheck` clean; launch app to confirm light render + no FOUC.

## Done when

- No `.dark` class is ever applied; app renders light regardless of OS appearance.
- No FOUC script in `index.html`; `theme-store.ts` + `theme-toggle.tsx` deleted; navbar no longer references them.
- No dangling imports of the removed theme modules; `bun run typecheck` passes.
- `dark:` utility classes remain in components (not stripped).

## Touches

- `apps/open-myanmar-invoice/index.html` — remove FOUC script.
- `apps/open-myanmar-invoice/src/stores/theme-store.ts` — delete.
- `apps/open-myanmar-invoice/src/components/common/theme-toggle.tsx` — delete.
- `apps/open-myanmar-invoice/src/components/common/navbar.tsx` — drop ThemeToggle import + usage.
- (optional) `apps/open-myanmar-invoice/src/lib/i18n/content.ts` — remove `nav.themeToggle` keys.
