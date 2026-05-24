# Plan 008 — Update Version Strategy

Source: `workflow/specs/2026-05-24-update-version-strategy.md`

## Summary

Central `versions.json` on the org site + a notify-only in-app update check for `electrobun-template`. Renderer fetches the registry, compares (semver) against its own version (from a bun RPC reading `Updater.getLocalInfo()`), and shows a bilingual "update available" banner whose button opens the platform installer via `Utils.openExternal`. Check fires on launch and from a "Check for Updates…" app-menu item (bun→webview message). Plus `.env`/`.env.example` scaffolding. No auto-install.

## Phases

| #   | Phase                                  | File                                           | Blocked by | Parallel-safe with |
| --- | -------------------------------------- | ---------------------------------------------- | ---------- | ------------------ |
| 01  | Registry artifact + release hosting    | `plans/todo/008-01-registry-artifact.md`       | —          | 02, 03             |
| 02  | `.env` scaffolding (app)               | `plans/todo/008-02-env-scaffolding.md`         | —          | 01, 03             |
| 03  | Update-eval logic + shared types (TDD) | `plans/todo/008-03-update-eval-logic.md`       | —          | 01, 02             |
| 04  | Bun RPC + menu wiring                  | `plans/todo/008-04-bun-rpc-menu.md`            | 03         | 01, 02             |
| 05  | Renderer update feature + UI + i18n    | `plans/todo/008-05-renderer-update-feature.md` | 03, 04     | —                  |

Critical path: **03 → 04 → 05**. Phases 01 + 02 run in parallel alongside the whole path (disjoint files: `landing/` vs app config vs app `src/`).

## Notes / risks

- **Manual `verify` walk (not executor-checkable)** — the cross-process wiring can't be unit-tested: launch the app and confirm (a) banner appears when registry version > local, (b) "Check for Updates…" menu item re-triggers it, (c) download button opens the right URL in the system browser, (d) offline/404/bad-JSON → app launches clean, no banner. Use the `verify`/`run` skill after phase 05.
- **No L1 backend-e2e gate** — this feature has no service/DB chain (RPC just returns host info + opens a URL), so the full `backend-e2e` suite is overkill. The thin bun handler is covered by an injected-deps unit test in phase 04; keep the transport-free seam (`createUpdateHandlers(deps)`) anyway so it stays testable.
- **`getLocalInfo()` in dev** — reads the _bundled_ `version.json`, which doesn't exist in `electrobun dev`. Phase 04's handler must try/catch and fall back (e.g. to `electrobun.config` version or `"0.0.0"`) so dev never throws.
- **Banner mount point** — `AppLayout` only wraps authenticated routes; mount `<UpdateBanner/>` at the app root (around `RouterProvider` in `main.tsx`) so it shows on any screen, incl. login.
- **Version source of truth (open)** — `electrobun.config.ts` (`0.0.1`) and `package.json` (`0.0.0`) disagree. Pick one before the first real release; registry `version` must match what `getLocalInfo()` returns.
- **`VITE_` config sync** — phase 02 documents `VITE_OML_VERSIONS_URL` / `VITE_OML_RELEASE_BASE`; phase 05 must read the same names (default to the prod `.com` URLs).
- **Binary bloat (open)** — installers in `landing/public/release/` commit binaries into the Pages repo. Phase 01 only reserves the path; revisit Git LFS / GitHub Releases when real binaries land.
- **win/linux (open)** — Electrobun builds host-arch only; first release may be macOS-only (missing platform URLs → button falls back to `release_dir`). App menus are unsupported on Linux (menu-triggered check won't exist there — launch check still works).
