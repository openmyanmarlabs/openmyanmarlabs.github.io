# Plan 007 — Feature-slice restructure + local auth app

Source: `workflow/specs/2026-05-24-restructure-feature-slice-template.md`

## Summary

Flatten `apps/electrobun-template/` renderer from `src/main-ui/` to a feature-slice `src/` (features/, components/{ui,common,layout}/, stores/, lib/, routes/, hooks/, styles/) alongside `src/bun/` (main) + `src/shared/` (contracts). Add an offline **local auth** feature: Drizzle/SQLite in the Bun main process (DI'd repos + service), typed Electrobun RPC to a React renderer, zustand for i18n/theme/auth, react-hook-form + zod (bilingual), hand-rolled Tailwind UI primitives, protected routes + auto-login.

Approach: scaffold first (01), then **de-risk the two unknowns in parallel** — prove the Vite-view↔Electrobun RPC combo (02) and build the standalone main-process DB/service layer (03) — while UI primitives (04) and zustand state (05) proceed independently. Wire DB→RPC (06), then build the auth UI + routing on top (07).

## Phases

| #   | Phase                                       | File                                        | Blocked by | Parallel-safe with |
| --- | ------------------------------------------- | ------------------------------------------- | ---------- | ------------------ |
| 01  | Scaffold + restructure                      | `plans/todo/007-01-scaffold-restructure.md` | —          | —                  |
| 02  | RPC boundary spike                          | `plans/todo/007-02-rpc-boundary-spike.md`   | 01         | 03, 04, 05         |
| 03  | DB + repos + auth-service (DI)              | `plans/todo/007-03-db-auth-service.md`      | 01         | 02, 04, 05         |
| 04  | UI primitives + `cn()`                      | `plans/todo/007-04-ui-primitives.md`        | 01         | 02, 03, 05         |
| 05  | zustand i18n + theme migration              | `plans/todo/007-05-zustand-i18n-theme.md`   | 01         | 02, 03, 04         |
| 06  | Auth RPC handlers + client + migrate wiring | `plans/todo/007-06-auth-rpc-wiring.md`      | 02, 03     | —                  |
| 07  | Auth feature UI + routing guards            | `plans/todo/007-07-auth-feature-routing.md` | 04, 05, 06 | —                  |

**Critical path:** 01 → (02 ‖ 03) → 06 → 07. Wave 2 `{02, 03, 04, 05}` is fully parallel (disjoint files — see Notes). 04 + 05 feed 07.

## Notes / risks

- **Parallel-safety is deliberate, not accidental.** To keep wave 2 disjoint: 02 wires RPC into `src/bun/index.ts` but 03 must **not** touch `index.ts` — 03 only exports `runMigrations()` / `createDb()`, and 06 calls them at startup. 02 instantiates `Electroview` in `lib/rpc.ts` (module singleton), **not** in `main.tsx`, so it never collides with 05's provider removal in `main.tsx`. If an executor deviates from this, the wave is no longer parallel-safe.
- **RISK — Vite view + Electrobun RPC is undocumented** (spec open Q). The KB documents RPC only for `build.views` (Bun-bundled) views over `views://`; this template bundles the renderer with Vite. **02 is a spike that must prove a round-trip works in both `bun start` (dev, localhost) and a `bun run build` `.app` (prod, `views://`) before anything is built on it.** If it fails, fall back to Electrobun `build.views` for the renderer (larger change) — escalate to the user, don't silently re-architect.
- **RISK — `RPCSchema` import path unknown.** Used in every KB example but its import line is never shown (it comes from `rpc-anywhere`). 02 must confirm the real export path against installed `electrobun` / `rpc-anywhere` before writing it into `src/shared/types.ts`.
- **RISK — `bun:sqlite` + Drizzle in the packaged runtime.** Strong inference, not KB-documented. 03 verifies it loads in dev; 06 verifies it loads in the built `.app`.
- **RISK — Drizzle migrations in a bundle.** Migration `.sql` files aren't in Vite's `dist/` and aren't auto-bundled into the Bun app-code. 03 generates them + extends `scripts/post-build.ts` to copy them into the bundle; `migrate.ts` must resolve the folder in **both** dev (project path) and prod (`PATHS.RESOURCES_FOLDER` / bundle path). 06 verifies prod migrate-on-startup against `Utils.paths.userData/app.db`.
- **RISK — localStorage persistence in the WebView** (auto-login depends on it). 07 verifies token survives relaunch; if not, fall back to storing the token in userData via RPC.
- **Accepted decisions:** idea's `core/` → `src/shared/` (cross-process contracts). i18n content stays central (`lib/i18n/content.ts`) with feature namespaces; auth keys added in 07. Auth view stays **non-sandboxed** (`sandbox: true` disables RPC).
- Nothing executed — phases sit in `plans/todo/`. App is its own git repo (gitignored by parent); `git switch`, Conventional Commits, auto-prettier on Write/Edit.
