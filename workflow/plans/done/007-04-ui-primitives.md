# 007-04 — UI primitives + `cn()`

Plan: `007-root-feature-slice-auth.md` · Blocked by: 01 · Parallel-safe with: 02, 03, 05

## Goal

Hand-roll the reusable Tailwind UI primitives — `button`, `input`, `text` — plus the `cn()` helper, ready for the auth forms + navbar to consume.

## Context

No shadcn/Radix — primitives are hand-rolled (spec non-goal). They live in `src/components/ui/` and use `cn()` (`clsx` + `tailwind-merge`, both installed in 01) from `src/lib/cn.ts`. Standalone, presentational — no state, no RPC, no i18n — so this is fully parallel with 02/03/05.

```
src/lib/cn.ts                  # export const cn = (...i) => twMerge(clsx(i))
src/components/ui/button.tsx   # variants (primary/secondary/ghost), sizes, disabled; forwardRef
src/components/ui/input.tsx    # label/error-aware text input; forwardRef; aria-invalid
src/components/ui/text.tsx     # typographic primitive (heading/body/muted variants)
```

Styling = Tailwind v4 utilities already set up in `src/styles/global.css` (brand-\* scale, `font-myanmar`, `.dark` class variant, `font-sans`). Reuse those tokens — e.g. `bg-brand-600 hover:bg-brand-700`, `dark:` variants — matching the existing hello/about styling idiom.

**Tailwind v4 — before writing any CSS / class logic, consult the `tailwind-docs-reader` subagent** for verbatim v4 syntax; do not guess. Key facts already gathered (cite if useful): class strings must be **complete + static** for content detection — never interpolate (`` `bg-${x}-600` `` is invisible to the scanner); map variant props to full class strings or safelist via `@source inline(...)` (KB: `guides/content-detection.md`). If a primitive needs `@apply` in a separate (non-Tailwind-importing) stylesheet, it needs `@reference` (KB: `guides/custom-styles.md`) — but prefer utility classes in JSX over component CSS here. No new `@theme` tokens needed unless a primitive demands one.

Conventions: kebab-case filenames, PascalCase exports (`button.tsx` → `Button`). React 19 — `forwardRef` for `button`/`input` so forms (react-hook-form in 07) can register refs. Keep props minimal + typed (extend the native element props).

## Steps

- [ ] `src/lib/cn.ts` — `cn(...inputs)` = `twMerge(clsx(inputs))`.
- [ ] `src/components/ui/button.tsx` — `Button` with `variant` + `size` props mapped to **complete** class strings via `cn()`; forwardRef; spreads native `<button>` props; disabled styling.
- [ ] `src/components/ui/input.tsx` — `Input` forwardRef text field; optional `label` + `error` rendering; `aria-invalid` on error; native `<input>` props.
- [ ] `src/components/ui/text.tsx` — `Text` with typographic variants; renders the right element (`h1`/`p`/`span`) per variant.
- [ ] Sanity-render each primitive (temporarily on the home page) in light + dark; confirm brand colors + Burmese font apply; remove the scratch usage.
- [ ] `bun run typecheck` green; `bun run build` (Tailwind picks up the new class strings).

## Done when

- `cn()` merges conditional + conflicting classes correctly.
- `button`/`input`/`text` exist, typed, forwardRef where needed, styled with brand tokens + `dark:` variants, all classes static (detected by Tailwind).
- Primitives render correctly in light + dark; `bun run typecheck` green; classes appear in the built CSS.

## Touches

- `src/lib/cn.ts` — new helper.
- `src/components/ui/{button,input,text}.tsx` — new primitives.
