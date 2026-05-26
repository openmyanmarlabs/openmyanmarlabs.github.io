# Spec — Feature-slice restructure + local auth app (2026-05-24)

One-line: Restructure `apps/electrobun-template/` into a feature-slice architecture and turn it into a real offline local-auth app — Drizzle/SQLite in the Bun main process, typed RPC to a React renderer, zustand state, zod + react-hook-form, hand-rolled Tailwind UI primitives.
Source: `workflow/ideas/electron/restructure-feature-slice-template.md`

## Goal

Reorganize the renderer into a feature-slice layout (`features/`, `components/{ui,common,layout}/`, `stores/`, `lib/`, `routes/`, `hooks/`, `styles/`) flattened to `src/`, alongside `src/bun/` (main) and `src/shared/` (cross-process contracts). Add a working **local auth** feature: register / login / logout with protected routes and persisted auto-login, backed by **SQLite via Drizzle ORM** running in the Bun main process and reached from the webview over **Electrobun typed RPC**. Migrate i18n + theme to **zustand**. Keep it offline-first and bilingual (Burmese-first).

## Users / context

Developers using this as the canonical OML desktop-app starting point, and end-users who register/sign in locally. Runs fully offline on-device (macOS WebView); all data in a local SQLite file under the per-user app-data dir. Default UI language Burmese (`my`); dark mode retained.

## Scope

**In:**

- **Directory restructure (flatten renderer to `src/`):**
  ```
  src/
  ├── bun/                      # main process (Bun)
  │   ├── index.ts              # window + RPC wiring + migrate-on-startup
  │   ├── db/                   # connector.ts (drizzle+bun:sqlite), schema.ts, migrate.ts
  │   ├── repositories/         # user-repository.ts, session-repository.ts
  │   ├── services/             # auth-service.ts (DI: takes repos, Bun.password)
  │   └── rpc/                  # auth-handlers.ts
  ├── shared/                   # cross-process: types.ts (RPC schema), dto.ts (User/Session DTOs)
  ├── features/
  │   ├── auth/                 # pages/ components/ validations/(zod) services/(RPC client)
  │   └── home/                 # pages/ ← existing hello + about, now protected
  ├── components/
  │   ├── ui/                   # hand-rolled primitives: button.tsx, input.tsx, text.tsx
  │   ├── common/               # navbar.tsx, language-toggle.tsx, theme-toggle.tsx
  │   └── layout/               # app-layout.tsx, protected-route.tsx
  ├── hooks/
  ├── stores/                   # zustand: i18n-store.ts, theme-store.ts, auth-store.ts
  ├── lib/                      # cn.ts, rpc.ts (Electroview client), i18n/content.ts
  ├── routes/                   # index.tsx (router config + guards)
  ├── styles/                   # global.css (moved from main-ui/styles)
  └── main.tsx                  # renderer entry
  ```
  Update `index.html` entry (`/src/main.tsx`), `vite.config.ts`, `tsconfig.json` includes; `electrobun.config.ts` keeps `build.bun.entrypoint = "src/bun/index.ts"`.
- **Path alias** `@/` → `src/` (vite + tsconfig `paths`) — deep tree otherwise yields ugly relative imports.
- **Deps:** `drizzle-orm`, `drizzle-kit` (dev), `zustand`, `zod`, `react-hook-form`, `@hookform/resolvers`, `clsx`, `tailwind-merge`. SQLite via built-in `bun:sqlite`; hashing via built-in `Bun.password`.
- **Auth (main process):** Drizzle schema for `users` (id, username/email, passwordHash, createdAt) + `sessions` (id, userId, token, createdAt, expiresAt). `auth-service.ts` does register (hash + insert), login (verify + create session), logout (delete session), `me(token)` (validate → user). **DI:** services receive injected repositories; repositories receive the injected db connector — no service imports a raw model/db directly.
- **Auth (renderer):** `/login` + `/register` pages (public) with react-hook-form + zod; `/` + `/about` protected (redirect to `/login` when unauthenticated). `auth/services/` client calls the main process via RPC. `auth-store` (zustand) holds current user + session token.
- **RPC boundary:** typed schema in `src/shared/types.ts`; `BrowserView.defineRPC` on the Bun side (passed as `rpc` to `BrowserWindow`), `Electroview.defineRPC` + `new Electroview({ rpc })` in the renderer (`lib/rpc.ts`). Auth calls use `rpc.request.*` (awaitable).
- **Persistence:** session token persisted client-side (localStorage) + `sessions` row in DB; on launch the renderer calls `me(token)` to auto-login. Logout clears both. DB file at `join(Utils.paths.userData, "app.db")` (mkdir first).
- **State migration:** rewrite i18n + theme as zustand stores, preserving `<html lang>` + `.dark` sync and the no-FOUC head script. Add `auth-store`.
- **UI primitives:** hand-rolled `button`/`input`/`text` (Tailwind v4 + `cn()` from clsx + tailwind-merge). A `navbar` (common) carries the language + theme toggles + logout.
- **Bilingual:** UI labels AND zod validation/error messages in both `my` + `en`, resolved through the i18n store.

**Out (non-goals):**

- No remote auth / network / sync / multi-device. Local + offline only.
- No password reset, email verification, OAuth, roles/permissions/RBAC.
- No real shadcn/ui or Radix — primitives are hand-rolled.
- No features beyond `auth` + `home` (the moved hello/about).
- No automated tests (DI makes them possible later; not in scope now).
- No changes to codesigning/notarization/distribution; no CI.
- Don't touch `landing/` or other apps; change confined to `apps/electrobun-template/`.

## Requirements

- [ ] Renderer flattened to `src/` per the tree above; `src/main-ui/` removed; all imports updated; app builds.
- [ ] `@/` alias resolves in both Vite and tsc.
- [ ] `index.html` loads `/src/main.tsx`; `electrobun.config.ts` bun entrypoint unchanged; `tsconfig` includes cover `src`.
- [ ] Deps installed: drizzle-orm, drizzle-kit, zustand, zod, react-hook-form, @hookform/resolvers, clsx, tailwind-merge.
- [ ] Drizzle schema + a migration exist; migrations applied on app startup against `Utils.paths.userData/app.db` (dir mkdir'd first); DB never written inside the bundle.
- [ ] `auth-service` register: rejects duplicate user; stores only a `Bun.password` hash (never plaintext).
- [ ] login: verifies hash, creates a session, returns token + user.
- [ ] `me(token)`: returns the user for a valid, unexpired session; null otherwise.
- [ ] logout: deletes the session; renderer clears stored token + auth-store.
- [ ] DI honored: `auth-service(userRepo, sessionRepo)`; repos take the injected `db`; no direct model/db import in services.
- [ ] Typed RPC wired: shared schema in `src/shared/types.ts`; Bun handlers via `BrowserView.defineRPC`; renderer client via `Electroview`. Auth UI view is **not** sandboxed.
- [ ] Routes: `/login` + `/register` public; `/` + `/about` redirect to `/login` when unauthenticated; authenticated users hitting `/login` go to `/`.
- [ ] Auto-login: quit + relaunch while logged in restores the session (via persisted token + `me`); logout returns to `/login` and survives relaunch.
- [ ] i18n + theme are zustand stores; `<html lang>` + `.dark` still sync; no FOUC on launch; language + dark-mode toggles still work.
- [ ] Forms use react-hook-form + zodResolver; field + form errors shown; labels + error messages bilingual (my/en).
- [ ] UI primitives (`button`/`input`/`text`) hand-rolled with `cn()`; used by the auth forms + navbar.
- [ ] `bun run typecheck` passes; `bun run build` yields a runnable `.app`; `bun start` HMR works.

## Constraints

- **Electrobun RPC:** schema type shared via `src/shared/types.ts` (type-only import on both sides). `sandbox: true` disables RPC — keep the auth view non-sandboxed. Refs: `workflow/learning/electron-bun/apis/browser-window.md`, `apis/browser-view.md`, `apis/browser/electroview-class.md`.
- **DB location:** `Utils.paths.userData` (`electrobun/bun`), not auto-created (mkdir recursive); never write inside `PATHS.RESOURCES_FOLDER` (breaks codesign). Ref: `apis/utils.md`, `apis/paths.md`.
- **Offline-first:** no network at any point; all auth + data on-device.
- **Tailwind v4 / dark mode:** preserve the existing CSS-first setup + class-strategy dark mode + no-FOUC script (consult `tailwind-docs-reader` for any CSS work).
- **Bilingual:** my source-of-truth, `Content = typeof my`, `en: Content` symmetry (compile-enforced); default `my`.
- **Conventions:** kebab-case filenames, PascalCase exports, auto-prettier, `git switch`, Conventional Commits, app is its own git repo (gitignored by parent).

## Acceptance — done when

- Fresh `bun install && bun run build` → runnable `.app`; first launch creates `app.db` under the user app-data dir and applies migrations.
- Register a new user → land in the protected app; restart → still logged in (auto-login).
- Logout → back to `/login`; restart → still logged out. Re-login works. Wrong password is rejected with a bilingual error.
- Direct-navigating to a protected route while logged out redirects to `/login`.
- Passwords are stored only as hashes (inspect `app.db`).
- Language toggle (my/en) + dark-mode toggle work across all screens; Burmese renders in KhitHaungg; no FOUC.
- `bun run typecheck` green; `bun start` HMR updates the window.

## Open questions

- **Vite-bundled view + Electrobun RPC** isn't a documented combo (this template bundles the renderer with Vite, not `build.views`). The first integration step must prove RPC's auto-injected preload reaches the Vite-built view loaded over `views://`; if it doesn't, fall back to Electrobun's `build.views` for the renderer (larger change). The `RPCSchema` import path also isn't in the KB (from `rpc-anywhere`) — confirm at build.
- **`bun:sqlite` in the bundled Bun runtime** is a strong inference, not KB-documented — verify it loads in the packaged `.app` (and Drizzle's bun-sqlite driver with it).
- **Drizzle migrations in a packaged app** — migration files are read-only in the bundle but the DB is in userData; confirm the runtime migrate step resolves the bundled migrations path (via `PATHS.RESOURCES_FOLDER` / `build.copy`) in both dev and prod.
- **localStorage persistence** across relaunches in the WebView (auto-login depends on it) — verify; if it doesn't persist, store the token via RPC in userData instead.
- **i18n content placement** — central (`lib/i18n/content.ts`) vs per-feature copy. Spec assumes central with feature namespaces; revisit if features should own their copy.
- **`core/` from the idea** is mapped to `src/shared/` (cross-process contracts); confirm that naming is acceptable.
