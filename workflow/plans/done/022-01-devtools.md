# 022-01 — Devtools dev mode

Plan: `022-root-electrobun-template-layout-shell.md` · Blocked by: — · Parallel-safe with: 02

## Goal

Auto-open the browser inspector when `electrobun dev` runs; suppress it in production builds.

## Context

Electrobun exposes `BuildConfig.get()` on the Bun side — it returns the `runtime` object verbatim from `electrobun.config.ts`. `process.env.ELECTROBUN_BUILD_ENV` is `"dev"` during `electrobun dev` and `"canary"`/`"stable"` for release builds — it is resolved **at build time**, so write it in config, not in the Bun entry.

API: `win.webview.openDevTools()` — fire-and-forget, no options. Docs:

- `workflow/learning/electron-bun/apis/build-config.md`
- `workflow/learning/electron-bun/apis/browser-view.md` (lines 494–519)
- `workflow/learning/electron-bun/apis/cli/build-configuration.md` (lines 725–739 for `ELECTROBUN_BUILD_ENV`)

Current `bun/index.ts` does not call `BuildConfig.get()` — add it after `BrowserWindow` creation. The `win` variable is the `BrowserWindow` instance; its `webview` property is the default `BrowserView`.

## Steps

- [ ] In `apps/electrobun-template/electrobun.config.ts`, add a `runtime` key to the default export:
  ```ts
  runtime: {
    isDev: process.env.ELECTROBUN_BUILD_ENV === "dev",
  },
  ```
- [ ] In `apps/electrobun-template/src/bun/index.ts`, import `BuildConfig` from `"electrobun/bun"` (add to existing import).
- [ ] After the `new BrowserWindow(...)` call, add:
  ```ts
  const buildConfig = await BuildConfig.get();
  if (buildConfig.runtime?.isDev) {
    win.webview.openDevTools();
  }
  ```
- [ ] Run `bun run typecheck` in the template app — no errors.

## Done when

- `electrobun dev` launches and the DevTools inspector window opens automatically.
- A production build (`electrobun build`) does **not** open devtools.
- TypeScript compiles clean.

## Touches

- `apps/electrobun-template/electrobun.config.ts`
- `apps/electrobun-template/src/bun/index.ts`
