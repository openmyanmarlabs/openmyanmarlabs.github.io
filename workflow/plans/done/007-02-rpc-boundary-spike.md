# 007-02 — RPC boundary spike

Plan: `007-root-feature-slice-auth.md` · Blocked by: 01 · Parallel-safe with: 03, 04, 05

## Goal

Prove a typed Electrobun RPC round-trip works between the Bun main process and the **Vite-bundled** renderer — in both dev (`localhost`) and a built `.app` (`views://`) — establishing the boundary pattern everything else builds on.

## Context

**This is a de-risk spike, the riskiest unknown in the plan.** The Electrobun KB documents RPC only for `build.views` (Bun-bundled) views; this template bundles the renderer with **Vite** and loads it over `views://main/index.html` (prod) / `http://localhost:5173` (dev). Whether RPC's auto-injected native bridge reaches a Vite-built view is **not documented** — prove it here with a trivial `ping` before building auth on it. If it fails in either dev or prod, **stop and escalate to the user**; the fallback is Electrobun `build.views` (larger change), not a silent re-architecture.

KB refs (read before coding):

- `workflow/learning/electron-bun/apis/browser-window.md` — `BrowserWindow` options incl. `rpc`, `sandbox`, `url`.
- `workflow/learning/electron-bun/apis/browser-view.md` — `BrowserView.defineRPC<T>({ maxRequestTime, handlers: { requests, messages } })`; `win.webview.rpc.request.*` / `.send.*`.
- `workflow/learning/electron-bun/apis/browser/electroview-class.md` — renderer side: `Electroview.defineRPC<T>({ handlers })`, `new Electroview({ rpc })`, `electroview.rpc.request.*(...)` (awaitable).

Exact shapes (verbatim from KB):

```ts
// src/shared/types.ts — type-only, imported by BOTH sides
import { type RPCSchema } from "???"; // ⚠ import path NOT in KB — see risk below
export type AppRPC = {
  bun: RPCSchema<{
    requests: { ping: { params: { msg: string }; response: string } };
    messages: {};
  }>;
  webview: RPCSchema<{ requests: {}; messages: {} }>;
};
```

```ts
// src/bun/rpc/ — handlers; wired into the window in src/bun/index.ts
const rpc = BrowserView.defineRPC<AppRPC>({
  maxRequestTime: 5000,
  handlers: { requests: { ping: ({ msg }) => `pong:${msg}` }, messages: {} },
});
new BrowserWindow({ /* …existing opts… */ url, rpc }); // do NOT set sandbox:true
```

```ts
// src/lib/rpc.ts — renderer client (module singleton; do NOT init in main.tsx)
import { Electroview } from "electrobun/view";
import { type AppRPC } from "@/shared/types";
const rpc = Electroview.defineRPC<AppRPC>({
  handlers: { requests: {}, messages: {} },
});
export const electroview = new Electroview({ rpc });
```

**⚠ RISK — `RPCSchema` import path.** The KB never shows it (comes from `rpc-anywhere`). Before writing `shared/types.ts`, find the real export: check installed `node_modules/electrobun` type exports and `node_modules/rpc-anywhere`. Use the confirmed path; do not guess-and-commit.

**Parallel-safety contract:** this phase touches `src/shared/types.ts` (new), `src/lib/rpc.ts` (new), `src/bun/rpc/` (new), and **edits `src/bun/index.ts`** (add `rpc` to `BrowserWindow`). It must **not** touch `main.tsx` (instantiate `Electroview` in `lib/rpc.ts` instead) and must **not** touch the DB files — that keeps it disjoint from 03/04/05.

## Steps

- [ ] Confirm the `RPCSchema` import path from installed deps; note it in the phase.
- [ ] `src/shared/types.ts` — minimal `AppRPC` with a `ping` request (type-only).
- [ ] `src/bun/rpc/index.ts` (or `ping-handlers.ts`) — `BrowserView.defineRPC<AppRPC>` with the `ping` handler.
- [ ] `src/bun/index.ts` — import the rpc object, pass `rpc` to the existing `new BrowserWindow({...})`. Confirm `sandbox` is **not** `true`.
- [ ] `src/lib/rpc.ts` — `Electroview.defineRPC` + `export const electroview = new Electroview({ rpc })`.
- [ ] Temporarily call `electroview.rpc.request.ping({ msg: "hi" })` from the home page (or `main.tsx` effect) and render/log the result — a visible proof point. Remove or keep behind a dev flag after verifying.
- [ ] Verify round-trip in **dev**: `bun start` → UI shows/logs `pong:hi`.
- [ ] Verify round-trip in **prod**: `bun run build` → launch the `.app` → same `pong:hi` over `views://`.
- [ ] `bun run typecheck` green.

## Done when

- `ping` returns `pong:hi` in **both** `bun start` (localhost) and the built `.app` (`views://`).
- Confirmed `RPCSchema` import path recorded; `shared/types.ts` compiles on both sides.
- Auth window is non-sandboxed; RPC object passed via `BrowserWindow({ rpc })`.
- `bun run typecheck` green.
- If prod round-trip fails → spike documented as failed + user escalated (do not proceed to 06).

## Touches

- `src/shared/types.ts` — new, minimal RPC schema.
- `src/bun/rpc/` — new ping handler.
- `src/bun/index.ts` — pass `rpc` to `BrowserWindow` (no other edits).
- `src/lib/rpc.ts` — new `Electroview` client singleton.
- Home page / entry — temporary ping call (proof), removed/flagged after.
