# 008-04 — Bun RPC + menu wiring

Plan: `008-root-update-version-strategy.md` · Blocked by: 03 · Parallel-safe with: 01, 02

## Goal

Bun side of the update check: an RPC to give the renderer its version+platform, an RPC to open a URL in the system browser, and a "Check for Updates…" app-menu item that pushes a message to the webview. Keep the transport-free seam so the handlers are unit-testable.

## Context

- **Transport-free seam (read `.claude/skills/tdd/SKILL.md`)** — mirror the existing auth split:
  - `src/bun/rpc/auth-handlers.ts` = pure map, NO `electrobun/bun` import → testable.
  - `src/bun/rpc/auth-rpc.ts` = `BrowserView.defineRPC<AppRPC>({ handlers: { requests, messages } })` wrapper, imports electrobun → out of tests.
- This feature has no service/DB chain, so **no full backend-e2e (L1) suite** — but still use injected deps so the handler is a cheap unit test (no `electrobun/bun` in the handler module).
- Exact APIs (from local KB `workflow/learning/electron-bun/`):
  - **Version**: `Updater.getLocalInfo()` → `Promise<{ version, hash, baseUrl, channel, name, identifier }>` (all strings). Reads the _bundled_ `version.json`. (`apis/updater.md`)
  - **Open URL**: `Utils.openExternal(url: string): boolean` — opens default browser. Import `{ Utils } from "electrobun/bun"`. (`apis/utils.md`)
  - **Menu**: items use `action: string` (not a callback). Listen globally: `Electrobun.events.on("application-menu-clicked", (e) => e.data.action)`. App menus are **unsupported on Linux**. (`apis/application-menu.md`)
  - **Bun→webview message**: define under `webview.messages` in the RPC schema; send from bun via `win.webview.rpc.send.<name>(payload)`. (`apis/browser-view.md`, `apis/browser/electroview-class.md`)
- `Updater.getLocalInfo()` throws/has no `version.json` in `electrobun dev`. The real impl injected into the handler must try/catch and fall back (e.g. `electrobun.config` version or `"0.0.0"`) so dev never throws.
- Platform map: `process.platform` → `"darwin"→"macos"`, `"win32"→"win"`, else `"linux"`. Use the `Platform` type from `src/shared/update.ts` (phase 03).
- Current RPC is composed once in `src/bun/index.ts` via `createAuthRpc(authService)` → `new BrowserWindow({ rpc })`. You must merge the new requests/messages into that single `defineRPC` object (one RPC per window). Add a `createAppRpc` (or extend the existing wrapper) that spreads both `createAuthHandlers` and `createUpdateHandlers` into `requests`.

## Steps

- [ ] Extend `src/shared/types.ts` `AppRPC`: add `bun.requests.getUpdateContext` (`params: {}` → `response: UpdateContext`), `bun.requests.openExternal` (`params: { url: string }` → `response: { ok: boolean }`), and `webview.messages.triggerUpdateCheck` (`{}`). Import `UpdateContext` from `@/shared/update`.
- [ ] Create `src/bun/rpc/update-handlers.ts` — pure `createUpdateHandlers(deps: { getLocalVersion: () => Promise<string>; getPlatform: () => Platform; openExternal: (url: string) => boolean })` returning `{ getUpdateContext: async () => ({ version: await deps.getLocalVersion(), platform: deps.getPlatform() }), openExternal: ({ url }) => ({ ok: deps.openExternal(url) }) }`. NO `electrobun/bun` import.
- [ ] TDD `src/bun/rpc/update-handlers.test.ts` (read tdd skill): `getUpdateContext` returns injected version+platform; `openExternal` forwards the url to the injected fn and returns its `ok`.
- [ ] Compose the real deps where electrobun is allowed (in `auth-rpc.ts`→rename/extend to `app-rpc.ts`, or a new `update-rpc.ts` + merge in index.ts): `getLocalVersion` = `Updater.getLocalInfo().version` with try/catch fallback; `getPlatform` = map `process.platform`; `openExternal` = `Utils.openExternal`. Merge `createUpdateHandlers(...)` into the same `defineRPC` `requests` as the auth handlers.
- [ ] In `src/bun/index.ts`: add a "Check for Updates…" item (`action: "check-for-updates"`) to the existing `ApplicationMenu.setApplicationMenu([...])` (e.g. under a Help submenu or the app submenu). Keep the existing Quit/Edit menus.
- [ ] In `index.ts`, after creating the window, register `Electrobun.events.on("application-menu-clicked", (e) => { if (e.data.action === "check-for-updates") win.webview.rpc.send.triggerUpdateCheck({}); })`. (Capture the `BrowserWindow` instance to reach its `webview`.)
- [ ] `bun test` + `bun run typecheck` green.

## Done when

- `bun test` green for `update-handlers.test.ts` (injected version/platform + openExternal forwarding).
- `bun run typecheck` passes; `AppRPC` carries `getUpdateContext`, `openExternal`, and `webview.messages.triggerUpdateCheck`.
- `update-handlers.ts` has no `electrobun/bun` import; the electrobun-backed deps live only in the transport wrapper.
- App still launches (`bun run dev`); menu shows "Check for Updates…"; clicking it sends `triggerUpdateCheck` (renderer consumes it in phase 05). Dev launch does not throw despite no bundled `version.json`.

## Touches

- `src/shared/types.ts` — add update RPC requests + webview message to `AppRPC`.
- `src/bun/rpc/update-handlers.ts` — new pure handler map.
- `src/bun/rpc/update-handlers.test.ts` — new unit tests (TDD).
- `src/bun/rpc/auth-rpc.ts` → `app-rpc.ts` (or new `update-rpc.ts`) — compose real deps + merge handlers into one `defineRPC`.
- `src/bun/index.ts` — menu item + `application-menu-clicked` listener + send message; updated RPC composition call.
