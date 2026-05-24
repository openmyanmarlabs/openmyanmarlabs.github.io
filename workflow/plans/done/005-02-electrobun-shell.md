# 005-02 — Electrobun shell + build wiring

Plan: `005-root-electrobun-react-template.md` · Blocked by: 01 · Parallel-safe with: 03

## Goal

The Bun main process opens a window, a basic app menu, the dev/prod URL switch, `electrobun.config.ts`, the `post-build.ts` hook that copies Vite's `dist/` into the bundle, and the `dev.ts` orchestrator. After this phase the shell can open a window (pointing at localhost in dev once phase 03's UI exists).

## Context

KB reference (read cold): `workflow/learning/electron-bun/apis/browser-window.md`, `apis/application-menu.md`, `apis/cli/build-configuration.md`, `apis/cli/cli-args.md`, `apis/paths.md`, `apis/bundled-assets.md`.

Confirmed APIs:

- Import `{ BrowserWindow, ApplicationMenu }` from `"electrobun/bun"`.
- `BrowserWindow({ title, url, frame: { width, height, x, y } })` — **width/height/x/y nest in `frame`**, not top-level. `url` accepts any URL incl. `http://localhost:5173` and `views://main/index.html`.
- `ApplicationMenu.setApplicationMenu([{ submenu: [{ label: "Quit", role: "quit" }] }, { label: "Edit", submenu: [{ role: "undo" }, { role: "redo" }, { type: "separator" }, { role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectAll" }] }])`. macOS-only (fine here).
- `electrobun.config.ts`: `export default { ... } satisfies ElectrobunConfig` (`import type { ElectrobunConfig } from "electrobun"`). Sections: `app { name, identifier, version }`, `build { bun: { entrypoint }, ... }`, `scripts { postBuild }`. **No `build.views`** — Vite is the bundler. **No `build.copy`** — the postBuild hook handles the Vite output (hashed filenames make static `copy` brittle).
- `electrobun dev [--watch]` = build (dev env, runs hooks) + run. `electrobun build` = build per config. `views://` resolves to `RESOURCES_FOLDER/app/views/`. postBuild hook env: `ELECTROBUN_BUILD_DIR`, `ELECTROBUN_BUILD_ENV`, `ELECTROBUN_APP_NAME`.

Decisions (from root): dev/prod URL via `Bun.env.OML_DEV`; postBuild copies `dist/` → discovered `app/views/main/`, no-op if `dist/` absent; `dev.ts` polls Vite readiness then launches electrobun.

## Steps

- [ ] `src/bun/index.ts`:
  - `const isDev = Bun.env.OML_DEV === "true";`
  - `const url = isDev ? "http://localhost:5173" : "views://main/index.html";`
  - `ApplicationMenu.setApplicationMenu([...])` (Quit + Edit roles per Context).
  - `new BrowserWindow({ title: "Electrobun Template", url, frame: { width: 1000, height: 700, x: 200, y: 200 } })`.
- [ ] `electrobun.config.ts`: `app` (name `"Electrobun Template"`, identifier `"dev.openmyanmarlabs.electrobun-template"`, version `"0.0.1"`), `build.bun.entrypoint = "src/bun/index.ts"`, `scripts.postBuild = "scripts/post-build.ts"`. Use `satisfies ElectrobunConfig` if the type exists on the installed version; else plain `export default`.
- [ ] `scripts/post-build.ts`: read `ELECTROBUN_BUILD_DIR`; if `dist/` missing → log + exit 0 (dev). Else recursively locate the dir ending in `app/views` under `ELECTROBUN_BUILD_DIR` (KB: `views://` → `RESOURCES_FOLDER/app/views/`); copy `dist/**` → `<that>/main/`. Use Bun/`node:fs` recursive copy. Log the resolved target path.
- [ ] `scripts/dev.ts`: spawn `vite` (Bun.spawn, inherit stdio); poll `fetch("http://localhost:5173")` every ~200ms until OK (timeout ~15s); then `Bun.spawn(["bunx","electrobun","dev","--watch"], { env: { ...Bun.env, OML_DEV: "true" }, stdio: inherit })`. On `SIGINT` kill both children.

## Done when

- `src/bun/index.ts`, `electrobun.config.ts`, `scripts/post-build.ts`, `scripts/dev.ts` exist and `bun run typecheck` passes (with phase 01 deps).
- `post-build.ts` exits cleanly (no-op) when `dist/` absent.
- Code reviewed against KB signatures (frame nesting, import paths, menu shape) — no guessed APIs.

## Touches

- `apps/electrobun-template/src/bun/index.ts` — new (main process).
- `apps/electrobun-template/electrobun.config.ts` — new.
- `apps/electrobun-template/scripts/post-build.ts` — new (dist → views copy).
- `apps/electrobun-template/scripts/dev.ts` — new (Vite + electrobun orchestrator).
