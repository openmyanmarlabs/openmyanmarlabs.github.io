# 010-01 — Scaffold + strip auth + icon

Plan: `010-root-open-myanmar-invoice.md` · Blocked by: — · Parallel-safe with: —

## Goal

`apps/open-myanmar-invoice` exists as a forked, renamed Electrobun app that builds + launches straight to a dashboard placeholder — no login, no auth code, no users/sessions tables.

## Context

- Fork source: `apps/electrobun-template` (React 19 + Vite 7 + Tailwind 4 + zustand + bun:sqlite/Drizzle + typed RPC + EN/MM i18n + updater). Copy the whole app dir.
- Config to rename: `electrobun.config.ts` (`app.name`, `app.identifier` — use `dev.openmyanmarlabs.open-myanmar-invoice`) and `package.json` (`name` → `@openmyanmarlabs/open-myanmar-invoice`). Keep `version` low (0.0.1).
- Build pipeline (don't break): Vite builds views → `scripts/post-build.ts` copies `dist/` → `views/main` and migrations → `app/db/migrations`. `@/` alias plugin in `electrobun.config.ts`. Leave both intact.
- **Auth surface to remove** (mapped this session): `src/features/auth/` (whole slice), `src/stores/auth-store.ts`, `src/bun/services/auth-service.ts`(+`.test.ts`), `src/bun/rpc/auth-handlers.ts`(+`.test.ts`), `src/bun/repositories/user-repository.ts` + `session-repository.ts`, `src/components/layout/protected-route.tsx`, and the `users`/`sessions` tables in `src/bun/db/schema.ts`.
- RPC contract: `src/shared/types.ts` defines `AppRPC` (auth requests live here — strip them, keep `webview.messages.triggerUpdateCheck` + update handlers). `src/bun/rpc/app-rpc.ts` registers handlers via `createAppRpc(...)`; `src/bun/index.ts` does DI composition (drop auth service wiring). `src/lib/rpc.ts` is the renderer client.
- Routing: `src/routes/index.tsx` uses `createHashRouter` with `GuestOnly`/`ProtectedRoute` + a `bootstrap()` auto-login call — remove guards + bootstrap; route `/` → dashboard placeholder under `AppLayout`.
- Icon: use the **`add-icon` skill** with a square source PNG (ask user for the invoice app logo; Open Myanmar Labs 1024px logo exists at repo root design-system if no invoice-specific art yet). It regenerates `icon.iconset` + wires mac/win/linux paths in `electrobun.config.ts`.
- Electrobun config/build reference: `workflow/learning/electron-bun/`.

## Steps

- [ ] Copy `apps/electrobun-template` → `apps/open-myanmar-invoice` (preserve `.gitignore`, `scripts/`, `drizzle.config.ts`, `tsconfig`, `vite.config`).
- [ ] Rename `app.name` ("Open Myanmar Invoice"), `app.identifier`, `package.json` `name`.
- [ ] Delete auth files listed above; remove `users`/`sessions` from `schema.ts`; delete the auth feature slice + store + repos.
- [ ] Strip auth from `src/shared/types.ts` (drop `register`/`login`/`me`/`logout` requests), `src/bun/rpc/app-rpc.ts`, `src/bun/index.ts` DI, `src/lib/rpc.ts`. Keep update handlers wired.
- [ ] Rewrite `src/routes/index.tsx`: no guards, no `bootstrap()`; `AppLayout` shell with `/` → `DashboardPlaceholder` page. Drop `/login`,`/register`.
- [ ] Trim `src/lib/i18n/content.ts`: remove `auth.*` keys (keep symmetry `en`/`my`).
- [ ] Run `add-icon` with the chosen source PNG.
- [ ] `bun install`; `bun run typecheck` clean; delete now-orphaned auth tests so `bun test` is green.
- [ ] Confirm it launches (use the **`run` skill**): window opens to the dashboard placeholder, no login screen, no console errors.

## Done when

- `apps/open-myanmar-invoice` builds (`bun run build`) and dev-runs, opening to a dashboard placeholder with the new app name + icon.
- No `auth`/`users`/`sessions`/`ProtectedRoute`/`GuestOnly` references remain (`grep` clean).
- `bun run typecheck` + `bun test` pass (update/i18n/theme survive; auth tests gone).

## Touches

- `apps/open-myanmar-invoice/**` — new app (copy of template).
- `electrobun.config.ts`, `package.json` — rename + icon paths.
- `src/shared/types.ts`, `src/bun/rpc/app-rpc.ts`, `src/bun/index.ts`, `src/lib/rpc.ts` — de-auth RPC.
- `src/routes/index.tsx`, `src/lib/i18n/content.ts` — de-auth routing + copy.
- `src/bun/db/schema.ts` — drop users/sessions.
- `icon.iconset/` — regenerated.
