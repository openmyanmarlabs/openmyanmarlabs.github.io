# 023-06 — Image library: import + browse + crop

Plan: `023-root-open-myanmar-content-v1.md` · Blocked by: 02 · Parallel-safe with: 03, 04, 05, 07

## Goal

Ship `/images` — import (native picker + drag-drop) to `<userData>/images/`, browse grid w/ thumbnails, tag chips, crop UI (1:1 / 4:3 / 16:9 / free) writing derived rows w/ `parent_id`.

## Context

- Phase 02 already shipped `images` table + `images-repository.ts` (fields: `id, filename, path, width, height, mime, bytes, source: 'import'|'crop'|'ai-generated', parent_id, tags JSON, created_at`).
- Native file picker via bun side:
  `Utils.showOpenDialog({ properties: ['openFile','multiSelections'], filters: [{ name: 'Images', extensions: ['png','jpg','jpeg','webp'] }] })`.
- Drag-drop in renderer (HTML5 DnD) → `File.arrayBuffer()` → number[] over wire → bun `importImage({ filename, bytes })`. Mirror the invoice pattern at `apps/open-myanmar-invoice/src/bun/rpc/export-handlers.ts` (transport-free handler map, bytes as `number[]`, deps injected; `Uint8Array.from(bytes)` at the edge).
- File copy: handler does `crypto.randomUUID()` basename + original extension → `Bun.write(Utils.paths.userData + '/images/<uuid>.<ext>', bytes)`.
- Dimensions: pure-TS header probe (PNG/JPEG/WEBP signatures) — portable across mac+win, no `sips`. Testable as `probeImageDimensions(bytes)`.
- Crop in renderer via canvas (no new dep — skip `react-image-crop`); `canvas.toBlob` → number[] → `cropImage({ sourceId, bytes, aspect })` → handler writes new row `source='crop'` + `parent_id`.
- Thumbnails: data URLs from `Bun.file(path).bytes()` via `readImageBytes({ id })` RPC (no `views://` mapping for userData by default).
- Tags: JSON array on the row, via repo `setTags`.
- TDD ref: `.claude/skills/tdd/SKILL.md` — co-located `*.test.ts`, in-memory SQLite + DI, do NOT import `migrate.ts` from tests.
- File naming: kebab-case per `apps/CLAUDE.md`.

## Steps

- [ ] Read `.claude/skills/tdd/SKILL.md`.
- [ ] TDD `src/bun/lib/image-probe.ts` + `.test.ts` — `probeImageDimensions(bytes): { width, height, mime }`; cover PNG, JPEG, WEBP signatures + invalid-bytes error.
- [ ] TDD `src/bun/services/image-service.ts` + `.test.ts` — `createImageService({ repo, fs, userDataDir, probe })` w/ `import(input)`, `crop(input)`, `delete(id)`, `setTags(id, tags)`. Inject `writeFile` / `mkdir` / `unlink`; tests use fake fs + in-memory repo.
- [ ] TDD `src/bun/rpc/image-handlers.ts` + `.test.ts` — `createImageHandlers({ service })` map: `importImage`, `cropImage`, `listImages({ tag?, source?, limit, offset })`, `deleteImage`, `setImageTags`, `readImageBytes({ id })`. Bytes as `number[]` in/out, converted at edge (mirror `export-handlers.ts`).
- [ ] Bind handlers in `src/bun/rpc/app-rpc.ts`.
- [ ] Wire service + `mkdir(userData/images, { recursive: true })` on startup in `src/bun/index.ts`.
- [ ] UI `src/features/images/pages/images-page.tsx` (route `/images`) — grid, import button (calls `showOpenDialog` RPC), drag-drop overlay, filter bar (source, tag).
- [ ] UI components `src/features/images/components/{image-grid,image-card,import-dropzone,crop-modal,tag-chip-editor}.tsx`.
- [ ] Crop modal: aspect buttons 1:1 / 4:3 / 16:9 / free + canvas region selector; Save → `cropImage` RPC.
- [ ] TDD store `src/features/images/stores/image-library-store.ts` + `.test.ts` — page, selection, filters, optimistic updates.
- [ ] Sidebar nav item in `src/components/layout/sidebar.tsx`.
- [ ] Extend `src/lib/i18n/content.ts` w/ EN + Burmese keys for every label, dialog, error.
- [ ] Manual verify: import 3 images (picker + drag-drop) → grid renders thumbs → crop one to 1:1 → both rows visible → tag one → filter by tag → delete → file gone from disk + row gone.
- [ ] `bun test` green; `bunx tsc --noEmit` green.

## Done when

- `/images` end-to-end: import, display, crop, tag, delete.
- Files persist under `<userData>/images/<uuid>.<ext>`; rows in `images` point at them.
- Crop creates a new row w/ `source='crop'` + `parent_id` = original id.
- `probeImageDimensions`, `image-service`, `image-handlers`, `image-library-store` green under `bun test`.
- No new deps (pure canvas crop; no `react-image-crop`).

## Touches

- `apps/open-myanmar-content/src/bun/lib/image-probe.ts` + `.test.ts` — new; pure header probe.
- `apps/open-myanmar-content/src/bun/services/image-service.ts` + `.test.ts` — new; DI fs + repo + probe.
- `apps/open-myanmar-content/src/bun/rpc/image-handlers.ts` + `.test.ts` — new; transport-free handler map.
- `apps/open-myanmar-content/src/bun/rpc/app-rpc.ts` — bind handlers w/ real `Utils.paths.userData` + `Bun.write`.
- `apps/open-myanmar-content/src/bun/index.ts` — instantiate service, `mkdir` images dir on startup.
- `apps/open-myanmar-content/src/features/images/pages/images-page.tsx` — new route page.
- `apps/open-myanmar-content/src/features/images/components/image-grid.tsx` — new.
- `apps/open-myanmar-content/src/features/images/components/image-card.tsx` — new.
- `apps/open-myanmar-content/src/features/images/components/import-dropzone.tsx` — new; HTML5 DnD.
- `apps/open-myanmar-content/src/features/images/components/crop-modal.tsx` — new; canvas crop.
- `apps/open-myanmar-content/src/features/images/components/tag-chip-editor.tsx` — new.
- `apps/open-myanmar-content/src/features/images/stores/image-library-store.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/routes/index.tsx` — register `/images`.
- `apps/open-myanmar-content/src/components/layout/sidebar.tsx` — nav entry.
- `apps/open-myanmar-content/src/lib/i18n/content.ts` — EN + Burmese keys.
