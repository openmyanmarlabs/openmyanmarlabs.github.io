# 016-01 — Background data-URI fix

Plan: `016-root-*.md` · Blocked by: — · Parallel-safe with: 02, 03, 04, 05

## Goal

Re-import all 6 background SVGs as raw strings (`?raw`) and convert to `data:image/svg+xml;charset=utf-8,...` data URIs at module-init time, so background URLs are self-contained and never require external resolution.

## Context

- Bug: SVG backgrounds imported as Vite URL strings (e.g., `./assets/bg-aurora-HASH.svg`) fail under Electrobun's `views://` protocol and can't be inlined by `html-to-image` during export.
- Fix: `?raw` imports + `encodeURIComponent` → data URI. All consumers (`invoice-background.tsx`, `design-modal.tsx`, `export.ts`) already use the resolved URL string opaquely — no changes needed there.
- `export.ts` already skips data URIs in `waitForBackgroundImages` (`if (url && !url.startsWith("data:")) urls.add(url)`). Fix is transparent to the export pipeline.
- SVG files are 484–683 bytes each; data URI overhead is negligible.
- Registry file: `apps/open-myanmar-invoice/src/features/invoices/backgrounds/registry.ts`
  - Currently: `import bgAurora from "./bg-aurora.svg"` × 6 (Vite URL import)
  - `BUILTIN_BACKGROUNDS[n].url` used as CSS `backgroundImage` source; persisted ref is `builtin:<id>` (stable, no change needed)
- Type declaration: `apps/open-myanmar-invoice/src/features/invoices/backgrounds/backgrounds.d.ts`
  - Currently declares `*.svg` → URL string only; needs `*.svg?raw` → raw string added.

## Steps

- [ ] In `backgrounds.d.ts`: add `declare module "*.svg?raw" { const content: string; export default content; }` below the existing `*.svg` block.
- [ ] In `registry.ts`: change all 6 imports from `import bgX from "./bg-x.svg"` to `import bgXRaw from "./bg-x.svg?raw"`.
- [ ] In `registry.ts`: add helper before `BUILTIN_BACKGROUNDS` array:
  ```ts
  function svgDataUri(raw: string): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(raw)}`;
  }
  ```
- [ ] In `registry.ts`: replace each raw import reference with a derived constant, e.g. `const bgAurora = svgDataUri(bgAuroraRaw);` — repeat for all 6.
- [ ] Leave all exported constants, types, and functions unchanged (`BUILTIN_BACKGROUNDS`, `resolveBuiltinUrl`, `isFileRef`, `fileRefPath`, `builtinRef`, `DEFAULT_BACKGROUND_REF`, `DEFAULT_COLOR`).
- [ ] Run `bun run tsc --noEmit` (or equivalent) in the app dir — confirm zero TS errors.

## Done when

- `registry.ts` imports all 6 SVGs with `?raw`; each `BUILTIN_BACKGROUNDS[n].url` is a `data:image/svg+xml;charset=utf-8,...` string.
- `backgrounds.d.ts` declares both `*.svg` (URL string) and `*.svg?raw` (raw string content) modules.
- TypeScript compiles without errors.
- Visual check: open invoice builder → Design modal → click any background → invoice card background updates immediately in live preview (no broken image, no blank panel).

## Touches

- `apps/open-myanmar-invoice/src/features/invoices/backgrounds/backgrounds.d.ts` — add `*.svg?raw` module declaration.
- `apps/open-myanmar-invoice/src/features/invoices/backgrounds/registry.ts` — swap URL imports for `?raw`, add `svgDataUri` helper, derive URL constants from raw strings.
