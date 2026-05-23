# 001-02 — Typed data + i18n

Plan: `001-root-landing-typescript-migration.md` · Blocked by: 01 · Parallel-safe with: 03

## Goal

Convert the bilingual data layer to TS: `content.ts` (derived symmetry types, status
union) + `i18n.tsx` (fully typed context). The core typing decision from the spec.

## Context

- `content.js`: two trees `en`/`my` exported as `content = { en, my }`. Docstring is
  emphatic — en/my MUST be key-symmetric; `status` is `"live" | "soon"`.
- Spec decision: **derive + enforce symmetry.** `my` is source of truth; `en` typed
  so its shape must equal `my`'s → asymmetric keys become a compile error. `status`
  must be the literal union, not `string`.
- `i18n.jsx`: React context. `useI18n()` returns `{ lang, setLang, toggleLang,
isMyanmar, t }`; `t = content[lang]`. Currently context default is `null` with a
  throw-guard in `useI18n` — type so consumers never see `null`.
- Extensions already stripped (phase 01): `i18n` imports `./content`. Importers of
  `i18n`/`content` need NO edits — extensionless resolves to the new files.
- `allowJs` is on, so unconverted `.jsx` sections still resolve; `tsc` stays clean.

## Steps

- [ ] `content.js` → `content.ts`: - Make `status` literal: e.g. `status: "live"` narrowed via `satisfies` or a
      small `as const` on each item's status (avoid `as const` on the whole tree —
      over-narrows every string to a literal + readonly). - `my` is source of truth: `export type Content = typeof my;` then type the
      export so en conforms: `const en: Content = {…}` (forces en to match my's shape;
      mismatched/missing keys error). Confirm `my` itself satisfies the intended
      `status` union (helper type `AppStatus = "live" | "soon"` if useful). - Export `content`, `Content`, and `Lang = "en" | "my"` (or `keyof typeof content`).
- [ ] `i18n.jsx` → `i18n.tsx`: - Type context value (`I18nContextValue`): `lang: Lang`, `setLang: (l: Lang)=>void`,
      `toggleLang: () => void`, `isMyanmar: boolean`, `t: Content`. - `I18nProvider` props: `{ children: ReactNode }`. - Keep the `null` default + throw guard, but type `useI18n(): I18nContextValue`
      (post-guard, non-null) so callers get a non-null type. - Import types from `./content`; use `import type` where type-only (verbatimModuleSyntax).
- [ ] `bunx tsc --noEmit` → clean.

## Done when

- `content.ts` + `i18n.tsx` exist; no `.js`/`.jsx` for these.
- `status` is `"live" | "soon"` (hovering an item shows the union, not `string`).
- Removing/renaming a key in `en` causes a `tsc` error (symmetry enforced) — spot-check.
- `useI18n()` return type is non-null and fully typed.
- `bunx tsc --noEmit` clean.

## Touches

- `landing/src/content.js` → `content.ts`.
- `landing/src/i18n.jsx` → `i18n.tsx`.
