# 007-06 — Auth RPC handlers + client + migrate wiring

Plan: `007-root-feature-slice-auth.md` · Blocked by: 02, 03 · Parallel-safe with: —

## Goal

Connect the DB/service layer (03) to the renderer over the proven RPC boundary (02): real auth RPC schema, Bun handlers backed by `auth-service`, a renderer RPC client, and migrate-on-startup wired into `index.ts` against `Utils.paths.userData/app.db`.

## Context

This is the join between 02 (RPC works) and 03 (auth core exists). The `ping` spike from 02 is replaced by the real auth contract.

Build on the verified pattern from 02 (`BrowserView.defineRPC` / `Electroview` / confirmed `RPCSchema` import) and the DTOs from 03 (`src/shared/dto.ts`).

Replace the spike schema in `src/shared/types.ts` with the auth contract (reuse `User`/`Session` DTOs):

```ts
// src/shared/types.ts
bun: RPCSchema<{
  requests: {
    register: {
      params: { username: string; password: string };
      response: { token: string; user: User };
    };
    login: {
      params: { username: string; password: string };
      response: { token: string; user: User };
    };
    me: { params: { token: string }; response: { user: User | null } };
    logout: { params: { token: string }; response: { ok: true } };
  };
  messages: {};
}>;
```

(Decide error semantics: throw in the handler vs. return a result union. Pick one and keep it consistent — bilingual error _messages_ are resolved renderer-side in 07 from error codes/keys, so prefer returning/throwing a stable **code**, not a localized string.)

Bun side (`src/bun/index.ts` + `src/bun/rpc/auth-handlers.ts`):

- At startup, **wire the DB**: `mkdirSync(Utils.paths.userData, { recursive: true })`; `const db = createDb(join(Utils.paths.userData, "app.db"))`; `await runMigrations(db)` (from 03) — **before** the window loads. This is the line 03 deliberately left out.
- Compose with DI: `createAuthService(createUserRepository(db), createSessionRepository(db))`.
- `auth-handlers.ts` maps each RPC request to a service call.
- `BrowserView.defineRPC<AppRPC>` with these handlers; pass `rpc` to the existing `BrowserWindow` (non-sandboxed, per 02).

**⚠ Verify in the packaged `.app` (open risks):** `bun:sqlite` + Drizzle load in the bundled Bun runtime; `runMigrations` resolves the **bundled** migrations folder (copied by `post-build.ts` in 03) via `PATHS.RESOURCES_FOLDER`; `app.db` is created under `Utils.paths.userData` (not in the bundle). KB: `apis/utils.md`, `apis/paths.md`.

Renderer side (`src/features/auth/services/auth-api.ts`): thin client over `electroview.rpc.request.*` (from `src/lib/rpc.ts`, 02) exposing `register`/`login`/`me`/`logout`, returning DTOs. No React, no store here — 07 calls these.

## Steps

- [ ] `src/shared/types.ts` — replace `ping` with the auth `AppRPC` schema, importing DTOs from `@/shared/dto`.
- [ ] `src/bun/rpc/auth-handlers.ts` — `register`/`login`/`me`/`logout` handlers delegating to `auth-service`; stable error codes.
- [ ] `src/bun/index.ts` — startup: mkdir userData, `createDb(app.db)`, `await runMigrations(db)`, compose repos+service (DI), `BrowserView.defineRPC<AppRPC>(authHandlers)`, pass `rpc` to `BrowserWindow`. Remove the 02 ping handler.
- [ ] `src/features/auth/services/auth-api.ts` — client wrapping `electroview.rpc.request.{register,login,me,logout}`.
- [ ] Remove the temporary ping proof from 02 if still present.
- [ ] Dev test: from a scratch call (or the still-present home page) exercise register→login→me→logout end-to-end over RPC.
- [ ] **Prod test:** `bun run build` → launch `.app` → register a user → confirm `app.db` appears under the user app-data dir with migrations applied + a hash-only `users` row.
- [ ] `bun run typecheck` green.

## Done when

- Typed auth RPC works end-to-end in dev (register/login/me/logout) over `electroview.rpc.request.*`.
- Built `.app`: first launch creates `app.db` under `Utils.paths.userData`, applies bundled migrations; `bun:sqlite`+Drizzle load; passwords stored as hashes only.
- DI preserved through the wiring (handlers → service → repos → db); auth view non-sandboxed.
- 02 ping spike removed; `bun run typecheck` green.

## Touches

- `src/shared/types.ts` — auth RPC schema (replaces ping).
- `src/bun/rpc/auth-handlers.ts` — new handlers.
- `src/bun/index.ts` — DB init + migrate + DI compose + rpc wiring.
- `src/features/auth/services/auth-api.ts` — renderer RPC client.
