# 023-05 — Templates seed + caption generator + custom templates CRUD

Plan: `023-root-open-myanmar-content-v1.md` · Blocked by: 02, 04 · Parallel-safe with: 06, 07

## Goal

Seed the 8 SME + 12 Myanmar-month festival templates, ship the brief form ("topic / tone / platform / template") that calls Ollama and parses bilingual caption + hashtags, persist every successful generation to `posts` history, support a "manual mode" when no text model is installed, and ship the CRUD UI for user-defined custom templates.

## Context

- Built-in templates seeded into the `templates` table via an idempotent `seedBuiltIns` call at app startup (`src/bun/db/startup.ts` already has a seed slot — extend it; mirrors the speech app's startup seed pattern).
- The 12 festival templates: one per Myanmar month per spec idea §2 table. Each carries a `prompt_system` that gives Ollama festival context (e.g. for တန်ခူး / Thingyan: explain it's the water festival, tone, common motifs, dates). **Open question — who authors these scaffolds?** Flagged at root. For this phase: write reasonable English-language scaffolds drawn from public references, mark them with `// TODO: review with Burmese marketer before Phase 10`. Do not block on this — the prompt is editable per-template later via Phase 06's custom-template UI re-purposed for built-ins if needed (out of v1 scope; built-ins stay read-only).
- The 8 SME templates: per spec — Product Sale / New Product Launch / Flash Sale / Event Announcement / Grand Opening or Anniversary / Customer Review / Delivery or Service Update / Custom (free-form). The "Custom" entry is a no-op template (empty system, generic user template) acting as the "no template" choice; the custom-templates UI in this phase replaces the need for a frozen "Custom" built-in. Decide: drop "Custom" from the seed, replace with a "(none)" option in the picker that uses a generic prompt. Pick: **drop**, picker exposes "(none)" + 7 SME + 12 festival + N custom.
- Prompt template structure (stored as `prompt_user_template`): `"Write a {{tone}} {{platform}} post in Burmese AND English for: {{topic}}. Output JSON: {"my":"...","en":"...","hashtags":["..."]}"`. The handler parses JSON; if parse fails, falls back to a heuristic split (look for "Burmese:" / "English:" / "Hashtags:" headers).
- Output parser is pure logic — TDD it.
- Caption service: `createCaptionService({ ollamaClient, templatesRepo, postsRepo, settingsRepo })` exposes `generate({ topic, tone, platform, templateId })` → fetches template → builds messages → calls `ollama.chat` → parses → writes post → returns the bilingual result.
- Manual mode: when `settings.active_text_model` is null (user skipped install), the brief form's "Generate" button is disabled with the inline hint per spec. The form still lets user type their own Burmese + English captions and hashtags into the OUTPUT fields directly, then "Save to history" writes a post row (no Ollama call). Phase 09 (history) reads these.
- Custom templates CRUD: under `/templates`, lists all templates with kind badges; clicking a built-in shows read-only details; "+ New custom template" opens a form (name, default tone, default platform, system prompt, user template); edit + delete only enabled for `kind=custom`.
- Per-block copy buttons: separate buttons for Burmese caption / English caption / hashtags. Each writes to clipboard using `navigator.clipboard.writeText`. Show a toast on copy. Reuse the toast pattern from `apps/open-myanmar-invoice/src/features/invoices/stores/toast-store.ts` (lightweight zustand).
- **TDD coverage**:
  - `caption-parser.test.ts` — JSON path, header-fallback path, missing keys, hashtag normalization (strip leading `#`, dedupe).
  - `caption-service.test.ts` — happy path with fake `ollamaClient` returning canned JSON; templates-repo `getById` miss → throws; post insertion uses returned content; manual-mode short-circuit (no chat call) when called with `mode: 'manual'`.
  - `caption-handlers.test.ts` — RPC handler thin wrapper.
  - `templates-built-in-seed.test.ts` — `seedBuiltIns` called with the canonical 7+12 list is idempotent.
  - `built-in-templates.ts` (the static list) — type-checked, no runtime tests needed.
- Skill to consult: `.claude/skills/tdd/SKILL.md`.

## Steps

- [ ] Read `.claude/skills/tdd/SKILL.md`.
- [ ] Write `src/features/templates/built-in-templates.ts` exporting the 7 SME + 12 festival template records (typed via the Phase 02 DTOs).
- [ ] Wire seeding: extend `src/bun/db/startup.ts` `prepareDatabase` to call `templatesRepo.seedBuiltIns(BUILT_INS)` on every run (idempotent per Phase 02 contract). Add a test in `templates-built-in-seed.test.ts`.
- [ ] TDD: `src/features/templates/caption-parser.ts` + `.test.ts`. Cover JSON path, header fallback, malformed input → throws typed error.
- [ ] TDD: `src/bun/services/caption-service.ts` + `.test.ts`. Inject `ollamaClient` (fake), `templatesRepo`, `postsRepo`, `settingsRepo`. Cover: generate happy path; manual mode (no Ollama call, just persist what UI provided); template-not-found → typed error; ollama failure → typed error rolled up.
- [ ] TDD: `src/bun/rpc/caption-handlers.ts` + `.test.ts` (transport-free `createCaptionHandlers({ service })` map exposing `generateCaption`, `saveManualCaption`, `listRecent`, `getById`).
- [ ] Bind in `src/bun/rpc/app-rpc.ts`; wire service in `src/bun/index.ts`.
- [ ] Build the brief form: `src/features/generator/pages/generator-page.tsx` (route `/`, replacing the inherited hello home page or adjacent — pick: `/` = generator). Form fields: topic textarea (Burmese-first placeholder), tone select (Casual/Professional/Festive), platform select (Facebook/Instagram), template select (grouped: SME / Festival / Custom / None). Generate button (disabled in manual mode w/ hint). Output panel with three editable blocks (Burmese caption, English caption, hashtags) + per-block copy buttons. "Save to history" button always enabled.
- [ ] Store: `src/features/generator/stores/generator-store.ts` + `.test.ts` — holds form state, last result, loading flag.
- [ ] Templates page + CRUD: `src/features/templates/pages/templates-page.tsx` (route `/templates`), with list + detail + custom-form components. Use existing UI primitives (`button`, `input`, `select`, `text`).
- [ ] Add nav items to sidebar: "Generator" (home) + "Templates".
- [ ] i18n keys for every label (brief, tone names, platform names, buttons, toast messages, template categories, custom-template-form labels, etc.).
- [ ] Manual verify: dev launch (with Ollama running, model installed from Phase 04) → enter Burmese topic → pick festival template → Generate → see bilingual output ≤30s → edit a line → copy each block → save to history → check `posts` row in dbeaver / sqlite cli.
- [ ] Manual verify manual-mode: uninstall the model (or set active=null in settings UI) → Generate disabled w/ hint → fill outputs manually → Save to history → row written with empty `template_id` resolved to the "(none)" sentinel (decide: nullable template_id OR a sentinel record; **prefer nullable** — adjust Phase 02 schema if it isn't already; if FK NOT NULL, add a special `(none)` built-in for manual posts).
- [ ] `bun test` green; `tsc --noEmit` green.

## Done when

- 7 SME + 12 festival templates exist in the `templates` table on fresh install (seed runs at startup).
- Brief form generates a bilingual caption + hashtags via Ollama in <30s on M3/M4 (manual measurement).
- Output is editable + per-block copyable + savable to history.
- Manual mode works: AI button disabled, user can fill + save.
- Templates page lists built-ins (read-only) + custom (CRUD); custom-template flow round-trips.
- `bun test` green with new tests for parser, service, handlers, seed, generator store.

## Touches

- `apps/open-myanmar-content/src/features/templates/built-in-templates.ts` — new.
- `apps/open-myanmar-content/src/features/templates/built-in-templates.test.ts` (optional sanity) — new.
- `apps/open-myanmar-content/src/features/templates/caption-parser.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/services/caption-service.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/rpc/caption-handlers.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/rpc/app-rpc.ts` — bind.
- `apps/open-myanmar-content/src/bun/index.ts` — wire service.
- `apps/open-myanmar-content/src/bun/db/startup.ts` — call `seedBuiltIns`.
- `apps/open-myanmar-content/src/bun/repositories/templates-repository.test.ts` — extend with seed-idempotency cases (or land in dedicated file).
- `apps/open-myanmar-content/src/features/generator/pages/generator-page.tsx` — new (replaces home).
- `apps/open-myanmar-content/src/features/generator/stores/generator-store.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/features/generator/components/{brief-form,output-panel,copy-button}.tsx` — new.
- `apps/open-myanmar-content/src/features/templates/pages/templates-page.tsx` — new.
- `apps/open-myanmar-content/src/features/templates/components/{template-list,template-detail,custom-template-form}.tsx` — new.
- `apps/open-myanmar-content/src/routes/index.tsx` — `/`, `/templates`.
- `apps/open-myanmar-content/src/components/layout/sidebar.tsx` — nav items.
- `apps/open-myanmar-content/src/lib/i18n/content.ts` — extend.
- (Adjust `src/bun/db/schema.ts` ONLY if Phase 02 made template_id non-nullable on posts and manual mode needs nullable — coordinate via Phase 02 contract check.)
