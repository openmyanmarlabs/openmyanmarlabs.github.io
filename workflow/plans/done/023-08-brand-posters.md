# 023-08 — Brand posters: 20+ templates + native-rasterize export

Plan: `023-root-open-myanmar-content-v1.md` · Blocked by: 03, 05, 06 · Parallel-safe with: 07

## Goal

Ship 20+ bilingual poster templates that auto-apply brand identity (logo / primary+secondary color / font), auto-fill latest generated caption, render at chosen aspect (1:1 / 4:3 / 16:9), and export to PNG via `html-to-image` → bytes → Bun handler (mirrors invoice export). Save to image library tagged `poster`; write `poster_image_id` on `posts` row when launched from history.

## Context

- TDD bits → consult `.claude/skills/tdd/SKILL.md`. Skill caveat: do NOT import `migrate.ts` in tests; in-memory SQLite + DI.
- **Tailwind v4 work in this phase — executor MUST spawn the `tailwind-docs-reader` subagent before editing `global.css`.** Ground `@theme` syntax + runtime CSS-var override pattern in the local KB (`workflow/learning/tailwind/apis/theme.md`, `workflow/learning/tailwind/apis/directives-and-functions.md`); don't guess v4 syntax.
- Pattern to copy: `apps/open-myanmar-invoice/src/bun/rpc/export-handlers.ts` — transport-free `createExportHandlers({ downloads, writeFile, reveal })`. Renderer rasterizes node with `html-to-image`, ships bytes as `number[]`, handler writes + reveals.
- Renderer rasterize lib reference: `apps/open-myanmar-invoice/src/features/invoices/lib/export.ts` + `invoice-export-stage.tsx`.
- `html-to-image@^1.11.13` already in invoice's `package.json` — install in content app if absent (`bun add html-to-image`).
- Brand theming pattern (v4 CSS-first):
  - `src/styles/global.css` declares `@theme { --color-primary: …; --color-secondary: …; --font-burmese: "Pyidaungsu", "Padauk", sans-serif; }` so utilities `bg-primary`, `text-primary`, `font-burmese`, `bg-primary/20` resolve.
  - Each poster's root `<div>` injects runtime overrides via `style={{ "--color-primary": brand.primaryColor, … }}` — utilities inside cascade to the new value. `--alpha()` works at browser time.
- Poster components: `src/features/posters/templates/<slug>.tsx` — each exports `metadata: PosterMetadata = { id, slug, name_en, name_my, category, recommendedAspect }` + `component: React.FC<PosterProps>`. Central registry `src/features/posters/templates/index.ts`.
- Categories (≥20 total): promotion (3–4), new product (3–4), flash sale (2–3), event announcement (2), grand opening/anniversary (2), customer review (2), holiday greetings 3–4 (Thingyan, Tazaungdaing, Thadingyut, Buddhist Lent…).
- **Design source unknown** — build reasonable original layouts using brand tokens. Mark each with `// TODO(design): polish before Phase 10` (grep target for design pass).
- Aspect → pixel size: 1:1 = 1080×1080, 4:3 = 1080×810, 16:9 = 1080×608. Wrap each poster in a fixed-px sizing div; rasterize at that size.
- Posters page UX: `/posters` route → grid of thumbnails → click → preview-and-export. Caption preloads from generator-store (latest) or from a chosen `posts` row (Phase 09 hook). Aspect segmented control + caption editor (override does NOT mutate source post).
- Save modes (both per spec): "Save to library" (writes to `userData/images/<uuid>.png`, image row `source='poster'`, tags `['poster']`) and "Save As…" via `Utils.showSaveDialog`.
- If launched from a `posts` row, after library save → update `posts.poster_image_id` (extend `posts-repository.ts` with `setPosterImage(postId, imageId)` if missing).
- Files kebab-case per `apps/CLAUDE.md`; PascalCase exports.
- Individual poster React components NOT unit-tested (visual; manual verify). Tested bits: helpers, registry invariants, handlers.

## Steps

- [ ] Spawn `tailwind-docs-reader` subagent: "exact @theme syntax for declaring `--color-primary` / `--color-secondary` / `--font-burmese` in Tailwind v4, and the runtime-override pattern for setting those CSS vars on a wrapper element." Apply verbatim.
- [ ] Read `.claude/skills/tdd/SKILL.md`.
- [ ] Confirm `html-to-image` in `apps/open-myanmar-content/package.json`; `bun add html-to-image` if missing.
- [ ] Extend `src/styles/global.css` with `@theme` block per docs-reader output.
- [ ] TDD `src/features/posters/lib/font-family-var.ts` (+ `.test.ts`) — pure helper: `brand.fontFamily` → CSS font-family value. Red → green → refactor.
- [ ] TDD `src/features/posters/lib/aspect-to-pixels.ts` (+ `.test.ts`) — pure mapping `1:1|4:3|16:9` → `{w,h}`.
- [ ] Define types + registry: `src/features/posters/templates/index.ts` — `PosterMetadata`, `PosterProps`, exported `templates: PosterTemplate[]`.
- [ ] Build ≥20 poster components under `src/features/posters/templates/<slug>.tsx`. Each uses brand tokens (`bg-primary`, `text-primary`, `font-burmese`), embeds logo via `<img src={logoDataUrl} />`, renders bilingual text. Mark `// TODO(design): polish before Phase 10`.
- [ ] TDD `src/features/posters/templates/poster-metadata.test.ts` — invariants: length ≥20, slugs unique, `recommendedAspect ∈ {"1:1","4:3","16:9"}`, every metadata required field set.
- [ ] Build `src/features/posters/components/brand-runtime-vars.tsx` — wrapper that injects `--color-primary`, `--color-secondary`, `--font-burmese` via inline `style`.
- [ ] Build `src/features/posters/components/{poster-grid,poster-preview,aspect-picker,caption-editor}.tsx`.
- [ ] Build `src/features/posters/pages/posters-page.tsx` — wires grid → preview → export.
- [ ] Build `src/features/posters/lib/rasterize-poster.ts` — `htmlToImage.toBlob(node, { width, height, pixelRatio: 1 })` → `Uint8Array`.
- [ ] TDD `src/bun/rpc/poster-handlers.ts` (+ `.test.ts`) — `createPosterHandlers({ imageService, fs, paths, showSaveDialog })`:
  - [ ] `savePosterToLibrary({ bytes, name })` → writes `userData/images/<uuid>.png`, inserts image row (`source='poster'`, tags `['poster']`), returns row.
  - [ ] `savePosterAs({ bytes, name })` → uses injected `showSaveDialog`; writes to chosen path.
  - [ ] `attachPosterToPost({ postId, imageId })` → calls `postsRepository.setPosterImage`.
- [ ] Extend `src/bun/repositories/posts-repository.ts` with `setPosterImage(postId, imageId)` (+ test). Small in-memory SQLite test per TDD skill.
- [ ] Bind handlers in `src/bun/rpc/app-rpc.ts`; wire deps in `src/bun/index.ts` (pass `Utils.showSaveDialog`, `imageService`, `fs`, `paths`).
- [ ] Add `/posters` route in `src/routes/index.tsx`; sidebar nav entry in `src/components/layout/sidebar.tsx`.
- [ ] Add "Make poster" button on `src/features/generator/components/output-panel.tsx` — opens posters page with caption preloaded.
- [ ] Extend `src/lib/i18n/content.ts` with: category labels, aspect names, edit-caption, save-library, save-as, preview headers.
- [ ] Manual verify (record in scratchpad, can't automate):
  - Brand wizard → primary `#C0392B`, secondary `#2980B9`, upload logo.
  - Generate caption → open `/posters` → grid renders thumbnails.
  - Pick a festival poster → preview shows brand colors + logo + bilingual text.
  - Export 1:1 → PNG opens in macOS Preview at 1080×1080.
  - "Save to library" → appears in `/images` tagged `poster`.
  - Change primary color in Settings → reopen preview → re-themed live.
- [ ] `bun test` green; `bunx tsc --noEmit` green.

## Done when

- ≥20 templates registered; `/posters` grid renders thumbnails.
- Preview applies current brand identity automatically; changing brand color in Settings re-themes preview live (verified manually).
- Caption auto-fills from last generated caption; editor override does NOT mutate source post.
- Exported PNG dimensions exactly match selected aspect (1080×1080 / 1080×810 / 1080×608).
- "Save to library" inserts image row tagged `poster`; if launched from a post → `posts.poster_image_id` updated.
- "Save As…" writes via `Utils.showSaveDialog`.
- `@theme` block in `global.css` declares `--color-primary` / `--color-secondary` / `--font-burmese`; runtime CSS-var override on wrapper actually re-themes utilities inside.
- `bun test` green — green behaviors:
  - `font-family-var` maps brand font → CSS value.
  - `aspect-to-pixels` maps each aspect → correct `{w,h}`.
  - `poster-metadata.test.ts` — registry length ≥20, slugs unique, aspect ∈ allowed.
  - `poster-handlers.test.ts` — library save writes file + inserts image row; "save as" uses injected dialog; `attachPosterToPost` delegates to repo.
  - `posts-repository` `setPosterImage` updates row.
- Every poster file contains `// TODO(design): polish before Phase 10`.

## Touches

- `apps/open-myanmar-content/src/styles/global.css` — add `@theme` block.
- `apps/open-myanmar-content/src/features/posters/lib/font-family-var.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/features/posters/lib/aspect-to-pixels.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/features/posters/lib/rasterize-poster.ts` — new.
- `apps/open-myanmar-content/src/features/posters/templates/index.ts` — registry + types, new.
- `apps/open-myanmar-content/src/features/posters/templates/*.tsx` — ≥20 poster components, new.
- `apps/open-myanmar-content/src/features/posters/templates/poster-metadata.test.ts` — new.
- `apps/open-myanmar-content/src/features/posters/pages/posters-page.tsx` — new.
- `apps/open-myanmar-content/src/features/posters/components/poster-grid.tsx` — new.
- `apps/open-myanmar-content/src/features/posters/components/poster-preview.tsx` — new.
- `apps/open-myanmar-content/src/features/posters/components/aspect-picker.tsx` — new.
- `apps/open-myanmar-content/src/features/posters/components/caption-editor.tsx` — new.
- `apps/open-myanmar-content/src/features/posters/components/brand-runtime-vars.tsx` — new.
- `apps/open-myanmar-content/src/bun/rpc/poster-handlers.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/rpc/app-rpc.ts` — bind poster handlers.
- `apps/open-myanmar-content/src/bun/index.ts` — wire deps.
- `apps/open-myanmar-content/src/bun/repositories/posts-repository.ts` + `.test.ts` — add `setPosterImage`.
- `apps/open-myanmar-content/src/routes/index.tsx` — add `/posters`.
- `apps/open-myanmar-content/src/components/layout/sidebar.tsx` — nav entry.
- `apps/open-myanmar-content/src/features/generator/components/output-panel.tsx` — "Make poster" button.
- `apps/open-myanmar-content/src/lib/i18n/content.ts` — extend keys.
- `apps/open-myanmar-content/package.json` — add `html-to-image` if absent.

## Open items

- Design source for poster layouts unknown — original layouts built against brand tokens; design polish deferred (grep `TODO(design)` in Phase 10).
- Generator-store shape for "latest caption" assumed in-memory; confirm against Phase 05 store API when executing.
