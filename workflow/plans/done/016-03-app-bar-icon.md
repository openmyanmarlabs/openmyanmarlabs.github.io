# 016-03 — App bar PNG icon

Plan: `016-root-<slug>.md` · Blocked by: — · Parallel-safe with: 01, 02, 04, 05

## Goal

Replace the `RiBillFill` gradient-tile placeholder in the app bar with the actual app icon PNG.

## Context

- App root: `apps/open-myanmar-invoice/`
- `src/components/layout/app-bar.tsx` — brand mark is a `<span>` gradient tile holding `<RiBillFill>`. Comment already flags it as a swap-in placeholder.
- Source icon: `icon.iconset/icon_32x32@2x.png` — 64×64px physical, renders at 32px display (crisp at 2× density).
- `src/assets/` does not exist yet — create it when copying the PNG.
- Vite config: `base: "./"` → imports via `import url from "@/assets/..."` produce relative URLs rewritten by Vite. Required for Electrobun's `views://` protocol; never use absolute `/assets/...` paths.
- `src/vite-env.d.ts` — only declares `*.css` today; needs a `*.png` declaration so the typed import resolves without TS errors.

## Steps

- [ ] Copy `apps/open-myanmar-invoice/icon.iconset/icon_32x32@2x.png` → `apps/open-myanmar-invoice/src/assets/app-icon.png`.
- [ ] In `src/vite-env.d.ts`, append a PNG module declaration below the existing `*.css` block:
  ```ts
  declare module "*.png" {
    const url: string;
    export default url;
  }
  ```
- [ ] In `src/components/layout/app-bar.tsx`:
  - Add `import appIconUrl from "@/assets/app-icon.png"` (top of imports).
  - Replace the entire `<span className="inline-flex size-8 ..."><RiBillFill .../></span>` brand mark with `<img src={appIconUrl} alt="" aria-hidden="true" className="size-8 rounded-xl object-cover" />`.
  - Remove the `RiBillFill` import from `@remixicon/react` (unused after swap).
  - Update the file-level JSDoc comment to reflect the real icon is now in use (remove the "no web-friendly logo" note).

## Done when

- App bar displays the app icon PNG instead of the gradient tile.
- No TypeScript errors (`bunx tsc --noEmit` clean, or dev server starts without type errors).
- Icon renders crisply at 32×32 display size (64×64 source PNG).
- `RiBillFill` import removed — no unused-import lint noise.

## Touches

- `apps/open-myanmar-invoice/icon.iconset/icon_32x32@2x.png` — source; copy only, do not modify.
- `apps/open-myanmar-invoice/src/assets/app-icon.png` — new file (copied from iconset).
- `apps/open-myanmar-invoice/src/vite-env.d.ts` — add `*.png` declaration.
- `apps/open-myanmar-invoice/src/components/layout/app-bar.tsx` — swap brand mark, remove unused import.
