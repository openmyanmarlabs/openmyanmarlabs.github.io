# 015-02 — Image skeleton loaders

Plan: `015-root-invoice-ux-fixes-2.md` · Blocked by: — · Parallel-safe with: 01, 03, 04

## Goal

Distinguish loading / loaded / empty for disk-backed images: show a pulsing skeleton while a
stored path resolves to bytes, the image once loaded, and the existing fallback when no path.

## Context

- `useImageObjectUrl(path)` returns `string | null` today (`src/lib/images.ts:45`) — it can't
  tell "loading" from "no path". Change it to return a status; update ALL 5 callers.
- **Surfaces (5):** `ClientAvatar`, `ProductThumbnail`, `client-image-field`,
  `product-image-field`, company `logo-field`. `ClientAvatar`/`ProductThumbnail` are shared by
  the list rows AND the selector modals, so the skeleton appears in both for free.
- **Do NOT touch** `invoice-document.tsx` / `invoice-background.tsx` — they feed the
  rasterized PDF/native export and must never show a pulsing placeholder. They don't use
  `useImageObjectUrl` anyway; leave them.
- **Skeleton = Tailwind built-in `animate-pulse`** (neutral block + muted image glyph). Do NOT
  add `@keyframes` to `global.css` — `animate-pulse` is core, and keeping out of `global.css`
  keeps this phase disjoint from phase 04 (which owns `global.css`).
- This is renderer / DOM / RPC glue (`URL.createObjectURL`, `imageApi.get`) → per the tdd
  skill, NOT unit-tested (don't mock the un-mockable). Verify by running.
- `@remixicon/react` is available (use `RiImageLine` for the skeleton glyph, or an inline SVG).

## Steps

- [ ] `src/lib/images.ts`: change `useImageObjectUrl` to return
      `{ url: string | null; status: "empty" | "loading" | "loaded" }` — `empty` when no path;
      `loading` while `loadImageObjectUrl` is pending; `loaded` on success; on error → `empty`
      (fall back to the glyph). Keep the existing revoke / cancel-on-unmount / path-change
      lifecycle intact.
- [ ] New `src/components/common/image-skeleton.tsx`: a `size-full` `animate-pulse bg-neutral-200`
      block with a centered muted image glyph (`text-neutral-400`); optional `className`.
- [ ] `ClientAvatar`: `loading` → `<ImageSkeleton/>` in the round slot; `loaded` + url → `<img>`;
      `empty` → the name initial.
- [ ] `ProductThumbnail`: `loading` → skeleton; `loaded` → `<img>`; `empty` → box glyph.
- [ ] `client-image-field` / `product-image-field` / `logo-field`: `loading` → skeleton inside the
      `size-20` preview box; `loaded` → `<img>`; `empty` → existing glyph.
- [ ] `bun run typecheck` green; run the app — lists/forms show pulse → image; no-image records
      show the fallback; exported invoice PDF/image unchanged.

## Done when

- All 5 surfaces show a pulse skeleton while resolving, the image once loaded, and the existing
  fallback when there's no path.
- The invoice export (`invoice-document` / `invoice-background`) is visually unchanged.
- No `global.css` edit; `bun run typecheck` passes.

## Touches

- `src/lib/images.ts` — `useImageObjectUrl` returns a status.
- `src/components/common/image-skeleton.tsx` — new shared skeleton.
- `src/features/clients/components/client-avatar.tsx`
- `src/features/products/components/product-thumbnail.tsx`
- `src/features/clients/components/client-image-field.tsx`
- `src/features/products/components/product-image-field.tsx`
- `src/features/company/components/logo-field.tsx`
