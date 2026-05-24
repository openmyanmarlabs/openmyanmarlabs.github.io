# 007-03 — DB + repos + auth-service (DI)

Plan: `007-root-feature-slice-auth.md` · Blocked by: 01 · Parallel-safe with: 02, 04, 05

## Goal

Build the standalone main-process auth core: Drizzle/SQLite schema + migrations, DI'd repositories, and an `auth-service` (register / login / logout / `me`) — all importable, with `runMigrations()` + `createDb()` exported. **No wiring into `index.ts`, no RPC, no UI** here.

## Context

Pure Bun-side, offline, on-device. Uses built-ins: `bun:sqlite` (driver) + `Bun.password` (hashing) — no install beyond 01's `drizzle-orm`/`drizzle-kit`. Runs in the Bun main process; Drizzle's `drizzle-orm/bun-sqlite` driver wraps `bun:sqlite`.

**DI is a hard requirement (spec):** `auth-service(userRepo, sessionRepo)`; each repo takes the injected `db`; **no service imports a raw model/db directly.** Shape:

```
src/bun/db/
  connector.ts   # createDb(path) -> drizzle(new Database(path)); also runMigrations(db)
  schema.ts      # users, sessions tables
  migrate.ts     # resolves migrations folder (dev + prod) -> migrate(db, { migrationsFolder })
src/bun/repositories/
  user-repository.ts      # createUserRepository(db) -> { findByUsername, insert, ... }
  session-repository.ts   # createSessionRepository(db) -> { create, findByToken, deleteByToken, ... }
src/bun/services/
  auth-service.ts  # createAuthService(userRepo, sessionRepo) -> { register, login, logout, me }
```

Schema (spec §Auth):

- `users`: `id` (uuid/text PK), `username` (or email) UNIQUE, `passwordHash`, `createdAt`.
- `sessions`: `id` PK, `userId` FK, `token` UNIQUE, `createdAt`, `expiresAt`.

Service behavior (spec requirements):

- `register`: reject duplicate user; hash with `Bun.password.hash`; insert; **never store plaintext**.
- `login`: `Bun.password.verify`; on success create a session (token + expiry); return `{ token, user }`.
- `me(token)`: return the user for a valid, **unexpired** session; `null` otherwise.
- `logout(token)`: delete the session row.
- Return DTOs (`User`/`Session` without `passwordHash`) — define DTO shapes in `src/shared/dto.ts` so 06 reuses them across the RPC boundary.

**DB location + migrations (spec §Constraints + open Qs):**

- Runtime DB file: `join(Utils.paths.userData, "app.db")` — `mkdirSync(Utils.paths.userData, { recursive: true })` first. **Never** write inside the bundle / `PATHS.RESOURCES_FOLDER` (breaks codesign). KB: `apis/utils.md` (`Utils.paths.userData`), `apis/paths.md` (`PATHS.RESOURCES_FOLDER`, `PATHS.VIEWS_FOLDER`).
- Generate migrations with `drizzle-kit` into e.g. `src/bun/db/migrations/` (add a `drizzle.config.ts` for drizzle-kit + a `db:generate` script).
- **Migrations must reach the packaged app.** Vite's `dist/` doesn't include them and Electrobun's Bun bundler won't copy `.sql`. So: extend `scripts/post-build.ts` to copy `src/bun/db/migrations/` into the bundle's app-code dir (it already locates `appCodeDir` via the `app/bun` marker — copy to e.g. `appCodeDir/db/migrations`). `migrate.ts` resolves the folder for **both** envs: dev → project path (`src/bun/db/migrations`); prod → bundle path via `PATHS.RESOURCES_FOLDER` (or relative to the bun entry). ⚠ This dual-path resolution is the open risk — make it explicit + verify the dev path here; prod path is verified in 06.

**⚠ RISK — `bun:sqlite` + Drizzle in the runtime.** Verify the driver loads + a migration applies in dev here (write a tiny throwaway script or assert in `runMigrations`). Packaged-runtime verification happens in 06.

**Parallel-safety contract:** create only the files above + `src/shared/dto.ts` + `drizzle.config.ts`, and edit `scripts/post-build.ts` + `package.json` (scripts). **Do not touch `src/bun/index.ts`** (06 calls `runMigrations()`/wires the service) — that keeps this disjoint from 02.

## Steps

- [ ] `src/bun/db/schema.ts` — `users` + `sessions` (Drizzle `sqlite-core`).
- [ ] `drizzle.config.ts` + `package.json` `db:generate` script; generate the first migration into `src/bun/db/migrations/`.
- [ ] `src/bun/db/connector.ts` — `createDb(path)` = `drizzle(new Database(path))` (from `bun:sqlite` + `drizzle-orm/bun-sqlite`).
- [ ] `src/bun/db/migrate.ts` — `runMigrations(db)` resolving the migrations folder for dev + prod (`PATHS.RESOURCES_FOLDER`).
- [ ] `src/bun/repositories/{user,session}-repository.ts` — factory fns taking `db`.
- [ ] `src/bun/services/auth-service.ts` — `createAuthService(userRepo, sessionRepo)`; register/login/logout/me; `Bun.password` hashing.
- [ ] `src/shared/dto.ts` — `User`/`Session` DTOs (no `passwordHash`).
- [ ] Extend `scripts/post-build.ts` to copy `src/bun/db/migrations/` into the bundle app-code dir.
- [ ] Dev verification: a throwaway script creates the db at a temp path, runs migrations, registers + logs in + `me` + logout — assert hash-only storage. Remove the throwaway after.
- [ ] `bun run typecheck` green.

## Done when

- Schema + at least one generated migration exist; `runMigrations` applies them against a fresh SQLite file in dev.
- `auth-service`: register rejects duplicates + stores only a `Bun.password` hash; login verifies + returns `{ token, user }`; `me(token)` returns user for valid/unexpired session else null; logout deletes the session.
- DI honored: `createAuthService(userRepo, sessionRepo)`, repos take injected `db`, no direct model/db import in the service.
- DB path is `Utils.paths.userData/app.db` with mkdir-first; nothing writes inside the bundle.
- `post-build.ts` copies migrations into the bundle; dev migrate path resolves.
- `src/bun/index.ts` untouched; `bun run typecheck` green.

## Touches

- `src/bun/db/{schema,connector,migrate}.ts`, `src/bun/db/migrations/**` — new.
- `src/bun/repositories/*`, `src/bun/services/auth-service.ts` — new.
- `src/shared/dto.ts` — new DTOs.
- `drizzle.config.ts`, `package.json` — drizzle-kit config + `db:generate`.
- `scripts/post-build.ts` — also copy migrations into the bundle.
