# 023-09 — Post history page

Plan: `023-root-open-myanmar-content-v1.md` · Blocked by: 05, 08 · Parallel-safe with: —

## Goal

Ship `/history` — list every generated post with search, filters, reuse, delete.

## Context

- Phase 02's `posts-repository.ts` exposes `list({ platform?, templateId?, dateFrom?, dateTo?, q?, limit, offset })` + `getById` + `delete` + `count`. This phase wraps it via RPC handler.
- Visual idiom: mirror `apps/open-myanmar-invoice/src/features/invoices/components/invoice-list.tsx` — platform pills + Filters popover + chips below. Same server-side filter constraint as invoice Phase 021 (history can grow large).
- Filters:
  - Platform pills: All / Facebook / Instagram.
  - Popover: template select + date range (from/to).
  - Chips below pills, clearable per-chip.
  - Search input debounced 250ms → `q` against `caption_my` + `caption_en` + `brief_topic`.
- Post card: relative timestamp (absolute on hover), template badge, platform badge, caption preview (3-line ellipsis, Burmese-first), thumbnail (poster_image_id wins over image_id), actions: Reuse / Open poster (if poster set, jump to /posters with selection) / Copy text (bilingual block) / Delete.
- Reuse: navigate to `/` with router state; generator-store gains `loadFromPost(post)` action hydrating topic/tone/platform/template + output blocks.
- Delete confirm modal: mirror `apps/open-myanmar-invoice/src/features/invoices/components/invoice-delete-modal.tsx`.
- Pagination: 25 per page + "Load more" button (simpler than full pagination; matches personal-data UX).
- Thumbnails reuse Phase 06's `readImageBytes({id})`; client-side data-URL cache via `useImageDataUrl(imageId)` hook (zustand-backed, testable).
- TDD scope per `.claude/skills/tdd/SKILL.md`:
  - `posts-handlers.ts` — `createPostsHandlers({ repo })` map (listPosts / getPost / deletePost). Transport-free seam — inject fake repo.
  - `history-filter-store.ts` — filter state, chip add/remove, serialize to repo args.
  - `generator-store.ts` extension — `loadFromPost`.
  - `use-image-data-url.ts` — cache hit/miss/invalidation.
- UI components + routing + i18n not unit-tested — verified by manual walk.
- Skill ref for executor: `.claude/skills/tdd/SKILL.md`.

## Steps

- [ ] Read `.claude/skills/tdd/SKILL.md`.
- [ ] TDD `src/bun/rpc/posts-handlers.ts` + `.test.ts` — `createPostsHandlers({ repo })`; cover listPosts wiring + getPost + delete; fake repo.
- [ ] Bind handlers in `src/bun/rpc/app-rpc.ts`.
- [ ] Wire in `src/bun/index.ts` — pass existing `createPostsRepository` from Phase 02 to handlers.
- [ ] TDD `src/features/history/stores/history-filter-store.ts` + `.test.ts` — state shape, setPlatform / setTemplate / setDateRange / setQuery / clearChip / toRepoArgs.
- [ ] Extend `src/features/generator/stores/generator-store.ts` with `loadFromPost(post)` + test in existing `generator-store.test.ts`.
- [ ] TDD `src/features/history/hooks/use-image-data-url.ts` + `.test.ts` — cache + invalidation; fake `readImageBytes`.
- [ ] Build UI: `src/features/history/pages/history-page.tsx` at `/history`.
- [ ] Build components under `src/features/history/components/`: `platform-pills.tsx`, `filters-popover.tsx`, `filter-chips.tsx`, `search-input.tsx`, `post-list.tsx`, `post-card.tsx`, `delete-post-modal.tsx`.
- [ ] Register `/history` route in `src/routes/index.tsx`.
- [ ] Add sidebar nav item in `src/components/layout/sidebar.tsx`.
- [ ] Extend `src/lib/i18n/content.ts` — page title, search placeholder, platform names, filter labels, chip removal, action buttons, delete confirm copy, empty-state.
- [ ] Manual verify: generate 5 posts across templates/platforms → /history reverse-chrono → Burmese substring search narrows list → Instagram pill filters → clear chip restores → Reuse hydrates generator brief → Delete confirms + row gone → Load more reveals page 2.
- [ ] `bun test` green; `bunx tsc --noEmit` green.

## Done when

- `/history` lists posts with thumbnails (poster preferred over image), captions, timestamps, badges.
- Search + platform + template + date-range filters apply server-side via repo, visible immediately.
- Reuse hydrates generator brief; Delete removes row after confirm; Copy text copies bilingual block; Open poster jumps to /posters for posts with `poster_image_id`.
- "Load more" pagination works past initial 25.
- `bun test` green incl. new `posts-handlers.test.ts`, `history-filter-store.test.ts`, `generator-store.test.ts` (loadFromPost case), `use-image-data-url.test.ts`.

## Touches

- `apps/open-myanmar-content/src/bun/rpc/posts-handlers.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/rpc/app-rpc.ts` — bind handlers.
- `apps/open-myanmar-content/src/bun/index.ts` — wire repo into handlers.
- `apps/open-myanmar-content/src/features/history/pages/history-page.tsx` — new.
- `apps/open-myanmar-content/src/features/history/components/{platform-pills,filters-popover,filter-chips,search-input,post-list,post-card,delete-post-modal}.tsx` — new.
- `apps/open-myanmar-content/src/features/history/stores/history-filter-store.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/features/history/hooks/use-image-data-url.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/features/generator/stores/generator-store.ts` (+ `.test.ts`) — extend with `loadFromPost`.
- `apps/open-myanmar-content/src/routes/index.tsx` — add `/history` route.
- `apps/open-myanmar-content/src/components/layout/sidebar.tsx` — add nav item.
- `apps/open-myanmar-content/src/lib/i18n/content.ts` — extend keys.
