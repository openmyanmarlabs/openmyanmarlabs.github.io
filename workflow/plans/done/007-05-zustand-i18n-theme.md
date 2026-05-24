# 007-05 — zustand i18n + theme migration

Plan: `007-root-feature-slice-auth.md` · Blocked by: 01 · Parallel-safe with: 02, 03, 04

## Goal

Rewrite the i18n + theme React-context providers as zustand stores, preserving `<html lang>` + `.dark` sync, localStorage persistence, and the no-FOUC behavior — with no provider wrappers left in `main.tsx`.

## Context

Today these are context providers (moved to `src/lib/` in 01): `i18n.tsx` (`I18nProvider`/`useI18n`: `lang` default `my`, `setLang`, `toggleLang`, `isMyanmar`, `t = content[lang]`) and `theme.tsx` (`ThemeProvider`/`useTheme`: `theme` default `system`, `setTheme`, `cycleTheme`, `isDark`; syncs `localStorage.theme` + `.dark` on `<html>`; OS-pref tracking in `system`). `index.html` has a no-FOUC head script that sets `.dark` from `localStorage.theme`/`prefers-color-scheme` before React mounts — **keep it as-is**. Consumers: `features/home/pages/{hello,about}-page.tsx`, `components/common/{language-toggle,theme-toggle}.tsx`. Content source: `src/lib/i18n/content.ts` (`content`, `Content`, `Lang`; `my` source-of-truth, `en: Content` symmetry — preserve).

Rewrite as zustand (`zustand` installed in 01):

```
src/stores/i18n-store.ts   # lang, setLang, toggleLang, isMyanmar; selector/derive t = content[lang]
src/stores/theme-store.ts  # theme, setTheme, cycleTheme, isDark; side effects on change
src/stores/auth-store.ts   # SHELL ONLY: user|null, token|null, set/clear — wired to RPC in 07
```

Migration rules:

- Replace `useI18n()` → a `useI18nStore` hook (selectors). `t` is `content[lang]` — derive via a selector or a small `useT()` helper so components keep `const { t } = ...` ergonomics.
- Theme side effects (write `localStorage.theme`, toggle `.dark`, track `matchMedia` in `system`) move into the store's actions / a one-time subscription/init — not a React effect tree. Initialize `isDark`/`theme` from `localStorage` to match the head script (no FOUC, no flthis-then-that flicker).
- `<html lang>` keeps syncing on `setLang` (`document.documentElement.lang = next`).
- Remove the old `lib/i18n.tsx` + `lib/theme.tsx` providers and the `<I18nProvider>`/`<ThemeProvider>` wrappers in `main.tsx`. Update toggles + home pages to the store hooks.
- `auth-store.ts` is a **shell** only here (state + setters); 07 connects it to the RPC client + persistence. Defining it now lets 07 stay disjoint.

**Tailwind:** no CSS changes expected. If anything dark-mode-related needs a CSS touch, consult the `tailwind-docs-reader` subagent first — the `.dark` strategy is `@custom-variant dark (&:where(.dark, .dark *))` in `global.css`; don't alter it.

**Parallel-safety contract:** this phase edits `main.tsx` (drop providers), `components/common/*toggle*`, `features/home/pages/*`, and removes `lib/i18n.tsx`/`lib/theme.tsx`. 02 was kept out of `main.tsx` (Electroview lives in `lib/rpc.ts`) and 04 touches only `components/ui` — so no collisions.

## Steps

- [ ] `src/stores/theme-store.ts` — port `theme.tsx` logic to zustand; init from `localStorage`; actions do the `.dark` toggle + persistence; subscribe to `matchMedia` for `system`.
- [ ] `src/stores/i18n-store.ts` — `lang`/`setLang`/`toggleLang`/`isMyanmar`; sync `<html lang>`; expose `t`/`useT()` from `content[lang]`.
- [ ] `src/stores/auth-store.ts` — shell: `{ user: User|null, token: string|null, setSession, clear }` (import `User` from `@/shared/dto`).
- [ ] Update `components/common/{language-toggle,theme-toggle}.tsx` + `features/home/pages/*` to use the stores.
- [ ] `main.tsx` — remove `<I18nProvider>`/`<ThemeProvider>`; render router directly. Delete `lib/i18n.tsx` + `lib/theme.tsx`.
- [ ] Verify: language toggle (my/en) + theme toggle work on all current screens; Burmese renders in KhitHaungg; **no FOUC** on launch (cold start in dark mode stays dark); `<html lang>`/`.dark` update live.
- [ ] `bun run typecheck` green; `bun start` HMR works.

## Done when

- i18n + theme are zustand stores; no provider wrappers in `main.tsx`; old provider files deleted.
- `<html lang>` + `.dark` still sync; localStorage persistence intact; no FOUC on launch.
- Language + dark-mode toggles still work across all screens.
- `auth-store` shell exists (state + setters, no RPC yet).
- `bun run typecheck` green; HMR works.

## Touches

- `src/stores/{i18n,theme,auth}-store.ts` — new.
- `src/main.tsx` — remove providers.
- `src/components/common/{language-toggle,theme-toggle}.tsx`, `src/features/home/pages/*` — use stores.
- `src/lib/i18n.tsx`, `src/lib/theme.tsx` — deleted.
