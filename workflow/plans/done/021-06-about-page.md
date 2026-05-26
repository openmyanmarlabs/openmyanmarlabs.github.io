# 021-06 — About page

Plan: `021-root-invoice-filter-and-ux-fixes.md` · Blocked by: 01 · Parallel-safe with: 02, 03, 04, 05

## Goal

A new bilingual `/about` route (sidebar link after Settings) showing the Open Myanmar Labs intro + purpose, website/GitHub/creator-Facebook links (open in the system browser), the app name + running version, an inline Check-for-updates, and a license line.

## Context

- UI, not unit-tested — verify by running. Reuses existing RPC + store; needs the `about` + `nav.toAbout` keys from phase 01.
- **Route:** `src/routes/index.tsx` — `createHashRouter` with children under `<AppLayout/>` (~lines 22–36). Add `{ path: "/about", element: <AboutPage /> }` after `/settings`; import `AboutPage` from the new feature.
- **Sidebar:** `src/components/layout/sidebar.tsx` — `items` array (~lines 44–51); add `{ to: "/about", label: t.nav.toAbout, Icon: RiInformationLine }` after the Settings entry. Import `RiInformationLine` from `@remixicon/react` (same import style as `RiSettings3Line`).
- **Version:** reuse `updateApi.getUpdateContext()` (`src/features/update/services/update-api.ts` ~lines 39–57) → `{ version, platform }`. Fetch on mount (useEffect) into local state; show `t.about.versionLabel` + version (+ `t.about.appNameLabel` + the app title `t.nav.appTitle`).
- **Check-for-updates:** reuse `useUpdateStore` (`src/features/update/stores/update-store.ts`): `check()` sets `status` (`idle|checking|none|available`) + `decision`. Button (`t.about.check`) → `useUpdateStore.getState().check()`. Inline result: `checking` → `t.about.checking`; `none` → `t.about.upToDate`; `available` → `t.about.updateAvailable` + a Download button (`t.about.download`) → `updateApi.openExternal(decision.downloadUrl)`.
- **External links:** use `updateApi.openExternal(url)` for all four. URL constants in the page (not i18n):
  - Website `https://openmyanmarlabs.com`
  - GitHub `https://github.com/openmyanmarlabs/openmyanmarlabs.github.io`
  - Facebook `https://facebook.com/lwinmoepaing.dev`
  - (Download URL comes from `decision.downloadUrl`.)
- **Layout:** clean, on-brand, light-only; reuse the page shell + card styling seen in `settings-page.tsx` / dashboard `stat-card.tsx` (`mx-auto … max-w-…`, rounded-2xl bordered white cards, `Text` variants). Bilingual via `t.about.*`, Myanmar-first.
- **Tailwind v4:** consult the **`tailwind-docs-reader`** subagent before writing CSS; reuse existing card/section classes.

## Steps

- [ ] Create `src/features/about/pages/about-page.tsx` (+ `src/features/about/index.ts` re-export if it matches the feature-folder convention used by other features' `index.ts`).
- [ ] Build sections: org intro/purpose (`t.about.intro`); links card (website / GitHub / creator + Facebook) each via `openExternal`; app + version card (fetched via `getUpdateContext`); Check-for-updates with inline status; license line (`t.about.license`).
- [ ] Add the `/about` route in `routes/index.tsx`.
- [ ] Add the sidebar nav item after Settings (`RiInformationLine`, `t.nav.toAbout`).
- [ ] Fetch version on mount; wire the update-check button + inline result + Download (→ `openExternal(decision.downloadUrl)`).

## Done when

- `/about` is reachable from the sidebar (link sits after Settings); page renders bilingual (EN/MY toggle works).
- All four external links open in the system browser via `openExternal`.
- The version line shows the running version (from `getUpdateContext`).
- Check-for-updates runs the existing `check()`; result shows inline (up-to-date / update available → Download opens the release).
- Typecheck clean; app runs.

## Touches

- `apps/open-myanmar-invoice/src/features/about/pages/about-page.tsx` (new) + `src/features/about/index.ts` (new, optional).
- `apps/open-myanmar-invoice/src/routes/index.tsx` — `/about` route.
- `apps/open-myanmar-invoice/src/components/layout/sidebar.tsx` — nav item after Settings.
