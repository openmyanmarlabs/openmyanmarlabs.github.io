# 022-04 — About page

Plan: `022-root-electrobun-template-layout-shell.md` · Blocked by: 02 · Parallel-safe with: 03

## Goal

Replace the placeholder about page with a full 3-card about page: Open Myanmar Labs intro, external links, and version + update-check.

## Context

**Source pattern** (read before writing):
`apps/open-myanmar-invoice/src/features/about/pages/about-page.tsx` — 3-card layout:

1. Intro hero card (brand-gradient, Open Myanmar Labs description)
2. Links card (external links via `updateApi.openExternal()`)
3. Version + update card (`getUpdateContext()` for version string, `useUpdateStore` for update state/actions)

**Template utilities** — these all exist in the template already (used by `UpdateBanner`); import paths may differ from invoice, so grep before assuming:

- `updateApi.openExternal(url)` — opens URL in system browser via Bun RPC
- `getUpdateContext()` — returns `{ version, ... }`; call once on mount
- `useUpdateStore` — state: `updateAvailable`, `isChecking`; action: `check()`

**i18n — extend `content.ts` about section first:**

Read the current `content.ts` about section. The template has `about.title` and `about.body` already. Add any missing keys:
`subtitle`, `intro`, `websiteLabel`, `githubLabel`, `versionLabel`, `check`, `checking`, `upToDate`, `updateAvailable`, `download`, `license`

Suggested EN copy:

- `subtitle`: `"About Open Myanmar Labs & this app"`
- `intro`: `"Open Myanmar Labs builds free, open-source, bilingual (English + Burmese) apps for Myanmar."`
- `websiteLabel`: `"Website"`, `githubLabel`: `"Source code (GitHub)"`
- `versionLabel`: `"Version"`, `check`: `"Check for updates"`, `checking`: `"Checking…"`, `upToDate`: `"Up to date"`, `updateAvailable`: `"Update available"`, `download`: `"Download"`, `license`: `"MIT License"`

**External link values** (hardcode in component, not in content):

- Website: `"https://openmyanmarlabs.dev"` (placeholder)
- GitHub: `"https://github.com/openmyanmarlabs/electrobun-template"` (placeholder)

No unit tests for UI — verified by running the app.

## Steps

- [ ] Read `src/lib/i18n/content.ts` current `about` section; add missing keys listed above to both `my` and `en`.
- [ ] Rewrite `src/features/home/pages/about-page.tsx`:
  - Card 1 (intro hero): brand-gradient background, `t.about.title`, `t.about.subtitle`, `t.about.intro`
  - Card 2 (links): two rows using `updateApi.openExternal()` — website and GitHub; labels from `t.about.websiteLabel`, `t.about.githubLabel`
  - Card 3 (version + update): call `getUpdateContext()` on mount for version; show `t.about.versionLabel: <version>`; update button wired to `useUpdateStore.getState().check()` with loading/result states from `useUpdateStore`; `t.about.license` footer line
  - Centered `max-w-3xl` section, `rounded-2xl` bordered white cards (dark: variants)
- [ ] Run `bun run typecheck` — no errors.

## Done when

- About page shows all 3 cards with correct EN and MY copy.
- Website and GitHub buttons call `openExternal` (no navigation within app).
- Version string renders (non-empty) from `getUpdateContext()`.
- Update-check button triggers store action; button state reflects `isChecking`.
- `content.ts` TypeScript check passes (en matches my shape).

## Touches

- `apps/electrobun-template/src/features/home/pages/about-page.tsx` — rewrite
- `apps/electrobun-template/src/lib/i18n/content.ts` — extend about section
