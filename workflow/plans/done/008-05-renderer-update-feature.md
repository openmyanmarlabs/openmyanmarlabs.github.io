# 008-05 — Renderer update feature + UI + i18n

Plan: `008-root-update-version-strategy.md` · Blocked by: 03, 04 · Parallel-safe with: —

## Goal

The renderer side: fetch the registry, run the check (on launch + on the menu-triggered message), and show the bilingual "update available" banner whose button opens the platform installer. Silent-fail on any error.

## Context

- Depends on phase 03 (`src/shared/update.ts` types + `src/features/update/lib/evaluate-update.ts`) and phase 04 (RPC contract: `getUpdateContext`, `openExternal`, `webview.messages.triggerUpdateCheck`).
- **Renderer RPC**: call bun via `electroview.rpc.request.*` (see `src/lib/rpc.ts` singleton + `src/features/auth/services/auth-api.ts` thin-wrapper pattern). `electroview.rpc` is non-null by the time user/effect code runs.
- **Subscribe to bun→webview message**: add a `messages.triggerUpdateCheck` handler in `src/lib/rpc.ts`'s `Electroview.defineRPC({ handlers: { requests: {}, messages: { triggerUpdateCheck: () => useUpdateStore.getState().check() } } })`. (Renderer import is `electrobun/view`.)
- **i18n**: bilingual copy lives in `src/lib/i18n/content.ts` — `my` is the source of truth (`Content = typeof my`), `en` typed `Content` so keys stay symmetric. Add an `update` key group to BOTH. Components read copy via `useT()` (`src/stores/i18n-store.ts`); current lang also picks `notes[lang]`.
- **Mount point**: `AppLayout` only wraps authenticated routes — mount `<UpdateBanner/>` at the app root (around `<RouterProvider>` in `src/main.tsx`) so it shows on any screen, incl. login.
- **Config URL**: read `import.meta.env.VITE_OML_VERSIONS_URL` (default `https://openmyanmarlabs.com/versions.json` — keep name in sync with phase 02's `.env.example`).
- Pure decision logic is already tested in phase 03; this phase is wiring + UI, **not** unit-tested — verified by running the app (root plan's manual `verify` walk). Keep the store thin: it orchestrates (fetch → `evaluateUpdate` → set state); it must not re-implement the compare.
- **Silent-fail**: any throw (offline, 404, bad JSON, RPC error) → catch, leave state "no update", never surface an error, never block.

## Steps

- [ ] `src/features/update/services/update-api.ts`: `getUpdateContext()` → `electroview.rpc.request.getUpdateContext({})`; `fetchRegistry()` → `fetch(VITE_OML_VERSIONS_URL).then(r => r.json())` typed `VersionsRegistry`; `openExternal(url)` → `electroview.rpc.request.openExternal({ url })`.
- [ ] `src/features/update/stores/update-store.ts` (zustand): state `{ status: "idle"|"checking"|"available"|"none"; decision?: UpdateDecision; dismissed: boolean }`; `check()` = get context + registry, look up `registry["electrobun-template"]`, run `evaluateUpdate(...)`, set `available`/`none` (wrap in try/catch → silent `none`); `dismiss()` sets `dismissed: true`.
- [ ] `src/features/update/components/update-banner.tsx`: render only when `status === "available"` and `!dismissed`; bilingual via `useT()`; show `decision.notes[lang]` when present; **Download** button → `update-api.openExternal(decision.downloadUrl)`; **Dismiss** button hidden when `decision.mandatory` (mandatory = non-dismissable, still never blocks).
- [ ] Add `update` copy group to `src/lib/i18n/content.ts` (`my` + `en`): e.g. `title`, `body`/`available`, `download`, `dismiss`, `menuCheck` ("Check for Updates…").
- [ ] Wire **launch check**: fire `useUpdateStore.getState().check()` once at startup (e.g. in `main.tsx`, alongside how auth `bootstrap()` is fired at module load).
- [ ] Wire **menu-triggered check**: add the `triggerUpdateCheck` message handler in `src/lib/rpc.ts` → `useUpdateStore.getState().check()`.
- [ ] Mount `<UpdateBanner/>` at app root in `main.tsx` (outside the router).
- [ ] `bun run typecheck` passes; then run the app and do the manual `verify` walk (see root plan Notes).

## Done when

- `bun run typecheck` passes.
- Running the app with registry `version` > local → bilingual banner appears (on login screen too); Download opens `downloads[platform]` (or `release_dir` fallback) in the system browser.
- Registry `version` ≤ local → no banner.
- "Check for Updates…" menu item re-runs the check (banner appears if outdated).
- `mandatory: true` → no Dismiss button; banner still never blocks the app.
- Offline / 404 / malformed JSON → app launches normally, no banner, no error surfaced.

## Touches

- `src/features/update/services/update-api.ts` — registry fetch + RPC calls.
- `src/features/update/stores/update-store.ts` — check/dismiss orchestration.
- `src/features/update/components/update-banner.tsx` — bilingual banner UI.
- `src/lib/i18n/content.ts` — add `update` copy group (en + my).
- `src/lib/rpc.ts` — subscribe to `triggerUpdateCheck` message.
- `src/main.tsx` — launch check + mount `<UpdateBanner/>` at root.
