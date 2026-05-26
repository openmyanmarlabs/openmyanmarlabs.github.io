# 023-01 — Foundation: clone template + wipe auth + rename

Plan: `023-root-open-myanmar-content-v1.md` · Blocked by: — · Parallel-safe with: —

## Goal

`apps/open-myanmar-content/` is a working copy of `apps/electrobun-template/` with the auth feature surgically removed, renamed app identity, placeholder icon, and a green `bun test` + dev launch (home only, no auth references anywhere).

## Context

- Target dir `apps/open-myanmar-content/` exists but is empty.
- Source dir `apps/electrobun-template/` is the canonical scaffold (Bun + Electrobun + React 18 + Vite + Tailwind v4 + Drizzle + better-sqlite3 + zustand + @remixicon/react).
- Files to wipe (the entire auth surface):
  - `src/features/auth/**`
  - `src/stores/auth-store.ts`
  - `src/bun/repositories/user-repository.ts`, `session-repository.ts`
  - `src/bun/rpc/auth-handlers.ts` + `auth-handlers.test.ts`
  - `src/bun/services/auth-service.ts` + `auth-service.test.ts`
  - `src/components/layout/protected-route.tsx`
  - Auth-related rows in `src/bun/db/schema.ts` (users + sessions tables)
  - Auth migrations under `src/bun/db/migrations/` (first migration likely contains users; either drop the file or replace with a fresh `0000` baseline that has no auth tables — choose fresh baseline for a clean slate since no data exists yet)
  - Auth i18n keys in `src/lib/i18n/content.ts`
  - Auth references in `src/routes/index.tsx` (login/register/protected routes)
  - Auth references in `src/bun/index.ts` (the `createAuthService(createUserRepository(db), createSessionRepository(db))` wiring + `appRpc` arg)
  - Auth references in `src/bun/rpc/app-rpc.ts`
  - Auth seed (`src/bun/db/seed/` if present)
  - `prepareDatabase` deps still want `hashPassword` — keep as a no-op or remove from `PrepareDatabaseDeps` (simpler: leave hashPassword param as optional and pass undefined; cleanest: remove entirely from this app's `startup.ts`). Pick: **remove** for clarity.
- Files to keep (verbatim, then adapt minor refs):
  - All of `src/bun/db/*` (connector, migrate, startup, backup, upgrade-state, test-db) minus the schema rows for auth
  - `src/stores/{theme-store, i18n-store, sidebar-store}.ts`
  - `src/features/{home, update}/**`
  - `src/components/{ui/*, common/*, layout/app-layout, layout/app-bar, layout/sidebar}.tsx`
  - `src/lib/{cn, rpc, i18n/*}`
  - `src/shared/{dto, types, update}.ts`
  - `vite.config.ts`, `tsconfig.json`, `drizzle.config.ts`, `index.html`, `scripts/dev.ts`, `scripts/post-build.ts`, `public/**`
  - `icon.iconset/` — kept as placeholder; real branding deferred (see Notes/risks at root)
- Identity to rename in `electrobun.config.ts`:
  - `app.name` → `"Open Myanmar Content"`
  - `app.identifier` → `"dev.openmyanmarlabs.open-myanmar-content"`
  - `app.version` → `"0.0.1"`
  - macOS BrowserWindow `title` in `src/bun/index.ts` → `"Open Myanmar Content"`
- `package.json` `name` → `"open-myanmar-content"`
- Update banner needs a `versions.json` URL; reuse the landing-site convention from speech/invoice (`https://openmyanmarlabs.com/releases/open-myanmar-content/versions.json` or whichever pattern the other apps use — confirm by reading one of their `update-api.ts` files). Stub the URL constant; Phase 10 confirms the real one when shipping.
- Skill reference: this phase touches the Electrobun config and the sidecar registry but does NOT add new Electrobun APIs. Use `.claude/skills/add-icon/SKILL.md` ONLY if the user requests a real icon now; otherwise keep the inherited template icon untouched.
- TDD scope: the existing `bun test` suite (~263 tests in template, mirroring the invoice port memory) must stay green after auth tests are deleted along with their subjects. No new logic in this phase, so no new tests — just deletions.

## Steps

- [ ] Copy entire contents of `apps/electrobun-template/` into `apps/open-myanmar-content/` preserving structure; exclude `node_modules/`, `dist/`, `build/`, `bun.lock` (regen).
- [ ] Delete all auth files listed under Context.
- [ ] Edit `src/bun/db/schema.ts`: remove `users`, `sessions` table declarations + any auth-related indexes/relations.
- [ ] Reset Drizzle migrations: delete contents of `src/bun/db/migrations/`, regenerate baseline via `bunx drizzle-kit generate` against the auth-free schema → commit a single `0000_*` baseline.
- [ ] Edit `src/bun/rpc/app-rpc.ts`: remove `createAuthHandlers` import + binding; leave only the update handlers (and whatever else the template ships).
- [ ] Edit `src/bun/index.ts`: remove auth service / repos imports + wiring; remove `hashPassword` from the `prepareDatabase` call; pass the slimmer `appRpc`.
- [ ] Edit `src/bun/db/startup.ts`: remove `hashPassword` from `PrepareDatabaseDeps`; update any auth seed call.
- [ ] Delete auth seed file(s) under `src/bun/db/seed/` if present; if seed/index re-exports them, prune.
- [ ] Edit `src/routes/index.tsx`: remove login / register / protected routes; the root route should land on the existing home/hello page.
- [ ] Edit `src/lib/i18n/content.ts`: remove every auth-related key (login, register, password, etc.); keep app-shell + update + home + about keys.
- [ ] Edit `electrobun.config.ts`: update `app.name`, `app.identifier`, `app.version`.
- [ ] Edit `src/bun/index.ts` BrowserWindow `title`.
- [ ] Edit `package.json` `name`.
- [ ] Confirm landing-site `versions.json` URL pattern (read `apps/open-myanmar-invoice/src/features/update/services/update-api.ts` or speech's); patch this app's `update-api.ts` to point at `open-myanmar-content`'s release dir (stub URL — will not 200 until Phase 10).
- [ ] `cd apps/open-myanmar-content && bun install` then `bun test` — every remaining test green.
- [ ] `bun run dev` (electrobun) launches; home page renders; no console error mentioning auth/login/protected/user/session; no broken import; SQLite file initializes at `Utils.paths.userData/app.db`.

## Done when

- `apps/open-myanmar-content/` builds + launches; main window shows home; no auth UI / routes / RPC / DB tables / i18n keys remain (verified by `grep -r -iE '(login|register|auth|protected[- ]route|user-repo|session-repo)' src/` returning only false positives — e.g. comments about removed code are NOT acceptable; remove cleanly).
- `bun test` green.
- `bunx tsc --noEmit` (or whatever the template's typecheck script is) green.
- `drizzle-kit generate` produces no pending changes (schema and baseline migration in sync).
- Electrobun dev launch puts a window titled "Open Myanmar Content" on screen.
- `git status` shows the entire `apps/open-myanmar-content/` tree as net-new; no edits to the template app.

## Touches

- `apps/open-myanmar-content/**` — entire new tree (copied + edited).
- (No edits anywhere else; landing-site changes deferred to Phase 10.)
