# 011-01 — Drop authentication (login + register + sessions)

Plan: `011-root-open-myanmar-speech.md` · Blocked by: — · Parallel-safe with: —

## Goal

Remove the template's whole auth feature from `apps/open-myanmar-speech` — login, register, sessions, `users`/`sessions` tables, auth service/repos/guards — so the app compiles, tests pass, and dev-runs with **no login**. Router has no guards and no `bootstrap()` auto-login; `/` lands on a bare placeholder. (The branded main-screen shell + icon is phase 02.)

## Context

- Fork + rename already DONE (per spec): `app.name` "Open Myanmar Speech", `app.identifier`, `package.json`, window title, update key, README. **Do not re-fork.** This phase is pure removal.
- Mirror sibling `workflow/plans/done/010-01-scaffold-strip-auth.md` — it de-authed the same template. Same surface, same moves (it also did the fork; skip that part here).
- **Auth surface to remove** (mapped this session): `src/features/auth/` (whole slice), `src/stores/auth-store.ts`, `src/bun/services/auth-service.ts`(+`.test.ts`), `src/bun/rpc/auth-handlers.ts`(+`.test.ts`), `src/bun/repositories/user-repository.ts` + `session-repository.ts`, `src/components/layout/protected-route.tsx`, and the `users`/`sessions` tables in `src/bun/db/schema.ts`. Drop `seedAdminUser` from `src/bun/db/seed/seeds.ts` (keep `seedDefaultSettings`).
- RPC contract: `src/shared/types.ts` defines `AppRPC` (auth requests live here — strip `register`/`login`/`me`/`logout`, keep `webview.messages.triggerUpdateCheck` + update handlers). `src/bun/rpc/app-rpc.ts` registers handlers via `createAppRpc(...)`; `src/bun/index.ts` does DI composition (drop auth service/repo wiring). `src/lib/rpc.ts` is the renderer client. Strip auth from `src/shared/dto.ts` (`User`, `AuthResult`).
- Routing: `src/routes/index.tsx` uses `createHashRouter` with `GuestOnly`/`ProtectedRoute` guards + a `bootstrap()` auto-login call at module load — remove guards + bootstrap; route `/` → a **bare placeholder** under the existing `AppLayout` (keep it minimal — the real shell is phase 02). Drop `/login`, `/register`.
- i18n: remove the `auth.*` keys from `src/lib/i18n/content.ts`, keeping `en`/`my` symmetry. (The `main.*` namespace is added in phase 02.)
- **Keep:** `appMeta` + `settings` tables + the startup/seeding/backup/upgrade machinery (plan `009`) + the updater feature + i18n + theme. Drop the unused sample `categories` table only if trivially clean (else leave it — out of scope).
- After dropping tables: regenerate migrations (`bun run db:generate`). Fresh app, no users → the destructive migration is safe.

## Steps

- [ ] Delete the auth files listed above; remove `users`/`sessions` from `schema.ts`; drop `seedAdminUser` (+ its call site in startup/seeds).
- [ ] Strip auth from `src/shared/types.ts` (drop the four requests), `src/shared/dto.ts`, `src/bun/rpc/app-rpc.ts`, `src/bun/index.ts` DI, `src/lib/rpc.ts`. Keep update handlers wired.
- [ ] Rewrite `src/routes/index.tsx`: no guards, no `bootstrap()`; `/` → a bare placeholder under `AppLayout`. Drop `/login`, `/register`.
- [ ] Trim `src/lib/i18n/content.ts`: remove `auth.*` keys; keep `en`/`my` symmetry.
- [ ] `bun run db:generate` (regenerate migrations after schema drop).
- [ ] `bun install`; `bun run typecheck` clean; delete orphaned auth tests so `bun test` is green.
- [ ] Confirm it dev-runs (`run` skill / `bun run dev`): window opens straight to the bare placeholder, no login, no console errors.

## Done when

- App dev-runs (`bun run dev`) and builds (`bun run build`), opening straight to a bare placeholder — no login screen.
- No `auth`/`users`/`sessions`/`ProtectedRoute`/`GuestOnly` references remain (`grep` clean).
- `bun run typecheck` + `bun test` pass (update/i18n/theme/startup survive; auth tests gone).

## Touches

- `src/features/auth/**`, `src/stores/auth-store.ts`, `src/bun/services/auth-service.ts`, `src/bun/rpc/auth-handlers.ts`, `src/bun/repositories/{user,session}-repository.ts`, `src/components/layout/protected-route.tsx` — deleted.
- `src/bun/db/schema.ts`, `src/bun/db/seed/seeds.ts`, `src/bun/db/migrations/**` — drop users/sessions + admin seed; regenerate.
- `src/shared/types.ts`, `src/shared/dto.ts`, `src/bun/rpc/app-rpc.ts`, `src/bun/index.ts`, `src/lib/rpc.ts` — de-auth RPC + DI.
- `src/routes/index.tsx`, `src/lib/i18n/content.ts` — de-auth routing + remove `auth.*`.
