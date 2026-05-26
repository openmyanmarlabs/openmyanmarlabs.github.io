# 023-03 — i18n my-default + brand profile + settings shell

Plan: `023-root-open-myanmar-content-v1.md` · Blocked by: 02 · Parallel-safe with: 04, 06

## Goal

Default UI language flips to Burmese, full bilingual content scaffold for the new app is in place, a "Brand profile" setup wizard runs on first launch (skippable), and a "Settings" page shell exists with a UI-language toggle slot reserved for Phase 04's model-management section.

## Context

- i18n inherited from template: `src/lib/i18n/content.ts` (a single string registry keyed by language), `src/stores/i18n-store.ts` (zustand, persists to `localStorage`). Default in template is `en` — flip default to `my` (set both the `defaultLanguage` constant in store and the persisted initial value).
- Pattern reference for routed pages: `apps/open-myanmar-invoice/src/features/company/**` (closest analog to a brand profile — single-row settings-like form).
- Pattern reference for native file open dialog (logo upload): Electrobun's `Utils.showOpenDialog` invoked from a bun-side RPC handler, then the path round-trips to the renderer. The renderer reads the file via a `loadImageBytes` RPC (see invoice app `src/bun/rpc/image-handlers.ts` if present, else mirror the export pattern but inverted). Don't try `<input type=file>` for an Electrobun-native feel — use the native dialog.
- Logo storage: copy the chosen file into `Utils.paths.userData/brand/logo.<ext>`; persist that absolute path into `brand_profile.logo_path` via the repository from Phase 02.
- Color pickers: simple controlled inputs of `type=color` initially (no external library); the spec just needs primary + secondary hex.
- Font dropdown options: `pyidaungsu | padauk | system` — actual font files bundled in `public/fonts/` (Phase 08 also depends on these for posters). For this phase, list the choices and persist; loading the woff2 files via `@font-face` in `src/styles/global.css` is OK now (small) — open question on licensing flagged in spec; placeholder OFL fonts acceptable for v1.
- **Tailwind**: this phase does NOT change Tailwind theme tokens. Tailwind work waits for Phase 08 (poster theming). Settings + brand pages use existing utility classes.
- Settings page is a shell with section headings — the "AI Models" section is rendered by Phase 04, the "Language" section is rendered here. Use a slot pattern: Settings page renders a sequence of `<SettingsSection>` components, and each phase mounts its own section.
- Brand setup wizard: a 3-step flow (Welcome → Logo+Colors+Font → Done), shown when `settings.brand_setup_completed !== true`. Skippable; "Skip for now" sets `brand_setup_completed=true` but leaves `brand_profile` empty (subsequent edits go through Settings → Brand). The wizard mounts inside the app layout, not a separate route — gates the home page. After completion, navigate to home.
- Routing: extend `src/routes/index.tsx` (react-router) with `/settings`, `/settings/brand`. The wizard is route-less — renders conditionally above home until completed.
- TDD: pure logic in this phase is minimal — `wizard-store.ts` (zustand) progression + the `useBrandProfile` data hook are testable. UI is verified manually. Test:
  - `wizard-store.test.ts`: step advancement, skip flag, persistence.
  - `brand-profile-service.test.ts` (if a service layer wraps the repo + file copy — yes, because file copy IS injected and testable): given input + a fake fs, copies logo + upserts repo with correct path.
- Skill reference: read `.claude/skills/tdd/SKILL.md` for logic tests; UI verification is manual.

## Steps

- [ ] Flip i18n default to `my`: edit `src/stores/i18n-store.ts` (`defaultLanguage = "my"`) and ensure no persisted `en` value silently overrides on first launch (drop persisted key on first migration: bump a version key inside the store).
- [ ] Extend `src/lib/i18n/content.ts` with new keys: brand wizard (welcome, logo upload, colors, font, skip, finish), settings (sections, language toggle, brand link), brand page (edit form labels, save toast). Every key has both `en` + `my`.
- [ ] Create `src/features/brand/repositories.ts` (re-export the repo) and `src/features/brand/services/brand-service.ts` with `createBrandService({ repo, fs, userDataDir })` — handles logo copy + upsert. Inject `fs` (`copyFile`, `mkdir`) so it's testable.
- [ ] TDD: `brand-service.test.ts` — covers logo copy to `userData/brand/`, upsert payload, error path (missing source file).
- [ ] Wire `createBrandService` into `src/bun/index.ts`; expose via RPC handler map `createBrandHandlers(service)` in `src/bun/rpc/brand-handlers.ts`. Pure handler map, transport-free. Pair `.test.ts` covering save / get / clear.
- [ ] Bind `brand-handlers` into `src/bun/rpc/app-rpc.ts` (`defineRPC` wrapper).
- [ ] Create `src/features/settings/` with: `pages/settings-page.tsx` (route `/settings`), `components/settings-section.tsx` (slot wrapper), `components/language-section.tsx` (UI lang toggle calling i18n-store).
- [ ] Create `src/features/brand/pages/brand-page.tsx` (route `/settings/brand`) — read brand profile, render form, save via RPC.
- [ ] Create `src/features/onboarding/components/brand-wizard.tsx` — 3-step flow; uses `wizard-store.ts` for state.
- [ ] TDD: `wizard-store.test.ts` — step transitions, skip path.
- [ ] In `src/routes/index.tsx`, add `/settings`, `/settings/brand`. In `src/components/layout/app-layout.tsx`, conditionally render `<BrandWizard />` over children when `!brand_setup_completed` (read via a `useSettings` hook from settings repo).
- [ ] Add a Settings nav item to `src/components/layout/sidebar.tsx`.
- [ ] Bundle Pyidaungsu + Padauk woff2 under `apps/open-myanmar-content/public/fonts/`; add `@font-face` rules to `src/styles/global.css`; add CSS classes `.font-pyidaungsu`, `.font-padauk`, `.font-system` for runtime selection. (Tailwind theme tokens come in Phase 08.)
- [ ] Manually verify: launch dev → wizard appears in Burmese → skip works → reach home → revisit `/settings/brand` → fill + save → reload → values persist.
- [ ] `bun test` green; `tsc --noEmit` green.

## Done when

- App launches in Burmese by default.
- First-launch shows brand wizard; "Skip" persists `brand_setup_completed=true`.
- `/settings` renders Language section; `/settings/brand` renders the editable brand profile.
- Saving a brand profile (logo + colors + font) writes the file to `userData/brand/` and a row to `brand_profile` (id=1).
- Switching UI language in Settings is immediate + persists across reload.
- `bun test` includes new wizard-store, brand-service, brand-handlers tests, all green.
- No Tailwind theme changes yet (deferred to Phase 08).

## Touches

- `apps/open-myanmar-content/src/stores/i18n-store.ts` — default flip to `my`.
- `apps/open-myanmar-content/src/lib/i18n/content.ts` — extend.
- `apps/open-myanmar-content/src/features/brand/{pages,components,services,repositories}/...` — new.
- `apps/open-myanmar-content/src/features/settings/{pages,components}/...` — new.
- `apps/open-myanmar-content/src/features/onboarding/components/brand-wizard.tsx` + `stores/wizard-store.ts` — new.
- `apps/open-myanmar-content/src/bun/rpc/brand-handlers.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/rpc/app-rpc.ts` — bind brand handlers.
- `apps/open-myanmar-content/src/bun/index.ts` — wire brand service.
- `apps/open-myanmar-content/src/routes/index.tsx` — add settings routes.
- `apps/open-myanmar-content/src/components/layout/{app-layout,sidebar}.tsx` — wizard gate + nav item.
- `apps/open-myanmar-content/src/styles/global.css` — @font-face rules.
- `apps/open-myanmar-content/public/fonts/*.woff2` — bundled fonts.
