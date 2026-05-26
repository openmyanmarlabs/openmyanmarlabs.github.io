# 023-02 — Domain schema + repositories (TDD)

Plan: `023-root-open-myanmar-content-v1.md` · Blocked by: 01 · Parallel-safe with: —

## Goal

Land the full Drizzle schema for v1 (brand profile, templates, images, posts, settings) plus typed repository functions for each, driven test-first with in-memory SQLite. Nothing UI-facing — just the data substrate every later phase reads/writes.

## Context

- Pattern reference: `apps/open-myanmar-speech/src/bun/repositories/generation-repository.ts` + its `.test.ts` (DI of a `BetterSQLite3.Database`, in-memory DB via `src/bun/db/test-db.ts`, factory `createX(db)` returning a typed function map).
- DB connector / migration plumbing already inherited from Phase 01 (`src/bun/db/{connector,migrate,startup,test-db}.ts`). Do NOT import `migrate.ts` from tests — it boots the Electrobun runtime (see TDD skill note). Use `test-db.ts` to build in-memory dbs that apply the same migrations.
- **TDD skill**: read `.claude/skills/tdd/SKILL.md` before writing tests. Repo behavior is L0 logic — drive one behavior at a time, red→green→refactor, co-located `*.test.ts`.
- Schema decisions (all in one new migration file generated via `bunx drizzle-kit generate`):
  - `brand_profile`: `id` (PK, single row enforced by `id=1` constraint), `name` (text, optional), `logo_path` (text, nullable — disk path under `userData/brand/`), `primary_color` (text — hex), `secondary_color` (text — hex), `font_family` (text — one of `pyidaungsu | padauk | system`), `created_at`, `updated_at`.
  - `templates`: `id` (PK, uuid), `kind` (`sme | festival | custom`), `slug` (text, unique within `kind`), `name_en` (text), `name_my` (text), `default_tone` (`casual | professional | festive`), `default_platform` (`facebook | instagram`), `prompt_system` (text — system prompt for Ollama), `prompt_user_template` (text — user message template with `{{topic}}` placeholder), `festival_month` (int 1–12 nullable; only set when `kind=festival`), `is_built_in` (bool), `created_at`, `updated_at`. Built-ins seeded in Phase 05.
  - `images`: `id` (PK, uuid), `filename` (text — original), `path` (text — absolute path under `userData/images/`), `width` (int), `height` (int), `mime` (text), `bytes` (int), `source` (`import | crop | ai-generated`), `parent_id` (uuid nullable — for crops/AI-derived), `tags` (text — JSON array), `created_at`.
  - `posts` (history): `id` (PK, uuid), `template_id` (uuid FK → templates), `platform` (`facebook | instagram`), `tone` (text), `brief_topic` (text), `caption_my` (text), `caption_en` (text), `hashtags` (text — JSON array), `image_id` (uuid FK → images, nullable), `poster_image_id` (uuid FK → images, nullable — the rendered branded poster, also lives in images table tagged `poster`), `created_at`.
  - `settings`: key/value table (`key` PK text, `value` text JSON-encoded). Stores: `ui_language` (`my` | `en`), `active_text_model` (`qwen2.5:7b` | `gemma3:4b`), `installed_text_models` (JSON array), `sd_model_installed` (bool), `first_run_completed` (bool), `brand_setup_completed` (bool).
- Single-brand enforcement: `brand_profile` row id is always `1` (CHECK or upsert via repo). Schema may grow to multi later — see spec constraint.
- Repository factories (one file each under `src/bun/repositories/`), each returning a `create<X>Repository(db)` map of typed functions. Mirror naming + DI style from speech app.
  - `brand-profile-repository.ts`: `get()`, `upsert(profile)`, `clear()`.
  - `templates-repository.ts`: `listAll()`, `listByKind(kind)`, `getById(id)`, `getBySlug(kind, slug)`, `insertCustom(input)`, `updateCustom(id, patch)`, `deleteCustom(id)`, `seedBuiltIns(records)` (idempotent — used by Phase 05's seed; only inserts when not present).
  - `images-repository.ts`: `insert(input)`, `getById(id)`, `list({ tag?, source?, limit, offset })`, `searchByTag(tag)`, `delete(id)`, `setTags(id, tags)`.
  - `posts-repository.ts`: `insert(input)`, `list({ platform?, templateId?, dateFrom?, dateTo?, q?, limit, offset })`, `getById(id)`, `delete(id)`, `count(filter)`.
  - `settings-repository.ts`: `get<T>(key, fallback)`, `set<T>(key, value)`, `getAll()`.
- All FK relations use Drizzle relations API + `ON DELETE` rules consistent with invoice app's pattern (read `apps/open-myanmar-invoice/src/bun/db/schema.ts` for reference).
- IDs: use `crypto.randomUUID()` at insert time — let the repo accept input without id, generate inside.
- Timestamps: ISO strings (`new Date().toISOString()`), to match speech app.

## Steps

- [ ] Read `.claude/skills/tdd/SKILL.md`.
- [ ] Define new tables in `src/bun/db/schema.ts` per Context.
- [ ] `bunx drizzle-kit generate` → commit the new migration file under `src/bun/db/migrations/`.
- [ ] Add zod schemas (or pure TS types) for repo inputs in `src/shared/dto.ts` — `BrandProfileDto`, `TemplateDto` (+ insert variant), `ImageDto`, `PostDto`, `SettingsKey` union.
- [ ] For each repository file, drive test-first per TDD skill:
  - [ ] **brand-profile-repository.test.ts**: red → write `get()` returns null when empty → green → upsert returns row → second upsert updates not inserts → clear empties.
  - [ ] **templates-repository.test.ts**: insertCustom returns row with generated id → listByKind filters → getBySlug round-trips → updateCustom patches → deleteCustom only deletes when `kind=custom` (throws on built-in) → seedBuiltIns is idempotent (run twice, count stable).
  - [ ] **images-repository.test.ts**: insert assigns id + created_at → getById returns the row → list filters by source/tag → setTags replaces tags → delete removes row.
  - [ ] **posts-repository.test.ts**: insert generates id → list filters by platform/template/date range/q (full-text-ish across caption_my + caption_en) → count matches list length → delete works → FK to templates is enforced.
  - [ ] **settings-repository.test.ts**: get returns fallback when missing → set then get round-trips JSON values → getAll returns all keys.
- [ ] Refactor pass after green: extract any shared test helper into `src/bun/db/test-db.ts` if it would duplicate (e.g. seeding a brand profile or a built-in template fixture).
- [ ] Run full `bun test` — every repo test green; nothing else regresses.
- [ ] `bunx drizzle-kit check` (or `migrate`) shows no pending diffs.

## Done when

- All five repository modules + their test files exist; `bun test` lists each behavior green.
- Schema file compiles; one new migration committed; `drizzle-kit generate` is a no-op.
- No repository file imports `electrobun/bun` (transport-free; pure logic over `BetterSQLite3.Database`).
- DTOs in `src/shared/dto.ts` cover every repo input + the union of `SettingsKey`.
- Test count rises by the number of behaviors covered (rough target: 25–35 new tests across the five repos).

## Touches

- `apps/open-myanmar-content/src/bun/db/schema.ts` — add 5 tables.
- `apps/open-myanmar-content/src/bun/db/migrations/0001_*.sql` (or whatever index follows the baseline) — new migration.
- `apps/open-myanmar-content/src/bun/repositories/brand-profile-repository.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/repositories/templates-repository.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/repositories/images-repository.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/repositories/posts-repository.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/repositories/settings-repository.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/shared/dto.ts` — extend with new DTOs.
- `apps/open-myanmar-content/src/bun/db/test-db.ts` — minor extensions if helpers added.
