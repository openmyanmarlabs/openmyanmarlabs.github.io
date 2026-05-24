# Plan 005 — Electrobun + React 19 Template

Source: `workflow/specs/2026-05-24-electrobun-react-template.md`

## Summary

Scaffold a copy-to-start desktop template at `apps/electrobun-template/`: Electrobun shell (Bun main process) + React 19 UI built by **Vite**, HashRouter (2 routes), bilingual Burmese-first i18n (mirrors `landing/`), bundled Khithaungg woff2. Dev = window loads Vite dev server (HMR); prod = `vite build` → `dist/` copied into the bundle's `app/views/main/` by a `postBuild` hook → window loads `views://`. Ends with a runnable, unsigned `.app`.

## Phases

| #   | Phase                     | File                                         | Blocked by | Parallel-safe with |
| --- | ------------------------- | -------------------------------------------- | ---------- | ------------------ |
| 01  | Scaffold + toolchain      | `plans/todo/005-01-scaffold-toolchain.md`    | —          | —                  |
| 02  | Electrobun shell + build  | `plans/todo/005-02-electrobun-shell.md`      | 01         | 03                 |
| 03  | React UI · i18n · routing | `plans/todo/005-03-react-ui-i18n-routing.md` | 01         | 02                 |
| 04  | Integration + verify      | `plans/todo/005-04-integration-verify.md`    | 02, 03     | —                  |

Critical path: 01 → (02 ∥ 03) → 04. Phases 02 and 03 touch disjoint files (`src/bun/` + config/scripts vs `src/main-ui/`) — run concurrently.

## Key decisions (resolved from spec open questions)

- **Dev/prod URL switch** — bun entry reads `Bun.env.OML_DEV`; `true` → `http://localhost:5173`, else `views://main/index.html`. (Fallback if env doesn't propagate through `electrobun dev`: probe localhost reachability.)
- **Vite → Electrobun handoff** — `postBuild` hook (`scripts/post-build.ts`) copies the whole Vite `dist/` into the bundle's `app/views/main/`. Resilient to Vite's hashed filenames (KB confirms `copy` is file→file, no glob). Hook **no-ops when `dist/` absent** → dev builds don't fail.
- **Dev orchestration + readiness** — `scripts/dev.ts` (Bun): spawn `vite`, poll `http://localhost:5173` until 200, set `OML_DEV=true`, then spawn `electrobun dev`. One `bun start` runs both, no race.
- **Vite `base: "./"`** — relative asset URLs so the prod bundle works under the `views://` protocol.
- **No `build.views`** — Vite is the only view bundler; electrobun only bundles `src/bun/index.ts`.
- **Font** — reuse landing's Khithaungg woff2, weights **400 + 600** (lean for a template), in `public/fonts/`.

## Notes / risks

- **Exact `app/views` path inside `ELECTROBUN_BUILD_DIR` is undocumented in the KB.** Mitigation: the postBuild hook _discovers_ it (recursively finds the dir ending in `app/views` under `ELECTROBUN_BUILD_DIR`), not a hardcoded path. Verify during phase 04 by inspecting `build/`.
- **`electrobun` version** — KB hello-world shows `^0.0.1`; install latest via `bun add electrobun` and pin whatever resolves. Confirm the `ElectrobunConfig` type export name on the installed version.
- **Env propagation** — assumes `electrobun dev` passes parent env to the launched bun process. If not, switch the bun entry to the localhost-reachability probe (decided in phase 02, verified in phase 04).
- **`react-router` v7** — single package (no `react-router-dom`); `createHashRouter` + `RouterProvider` + `Link` import from `react-router`.
- **ApplicationMenu is macOS-only** (KB) — fine on this dev machine (darwin); note for future Linux/Win builds.
- Drop-zone: app gets its **own `git init`**; parent monorepo ignores `apps/*` (not a submodule). Don't commit it to the parent repo.
