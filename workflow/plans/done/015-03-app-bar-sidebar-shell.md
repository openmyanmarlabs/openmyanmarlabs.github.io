# 015-03 — App-bar + sidebar shell refinement

Plan: `015-root-invoice-ux-fixes-2.md` · Blocked by: — · Parallel-safe with: 01, 02, 04

## Goal

Move the collapse toggle from the app bar into the top of the sidebar rail; reduce the app bar
to brand (logo mark + title) + language toggle only; refine both surfaces (frontend-design).
Collapse + persistence behavior unchanged.

## Context

- `app-bar.tsx` currently holds the collapse toggle (`:32–46`), the brand (`:48–56`), and the
  `LanguageToggle` (`:58–61`). Remove the toggle from here.
- `sidebar.tsx` is the rail: expanded `w-60` (icon + label), collapsed `w-[4.5rem]` (icons +
  `title`/`aria-label`). It reads `useSidebarStore` (`collapsed`); the store also has `toggle`.
  Add the toggle control at the TOP of the rail (its own row above `<nav>`), wired to `toggle`.
- **Store unchanged** — `sidebar-store.ts` persists `collapsed` to localStorage (round 1) and
  is already unit-tested. Don't change its behavior → no new tests.
- **Title:** the app bar already renders `{t.nav.appTitle}`. The English-only flip (set
  `my.nav.appTitle`) is owned by phase 04 (the `content.ts` editor). This phase makes NO
  `content.ts` edit — just keep rendering the wired title.
- Reuse the existing remix icons (`RiSidebarFoldLine` / `RiSidebarUnfoldLine`) and labels
  (`t.nav.collapseSidebar` / `t.nav.expandSidebar`). Keep `RiBillFill` brand mark (placeholder).
- **frontend-design** (executor can't invoke the skill — bake intent into steps): keep the
  app's Apple/HIG soft-surface language already in `sidebar.tsx` (soft brand-tinted active pill,
  subtle hover, generous spacing); light-only (dormant `dark:` classes may remain). No new nav
  targets; collapsed rail stays icons-only with `aria-label`/`title`.
- Renderer-only → verify by running.

## Steps

- [ ] `app-bar.tsx`: remove the collapse toggle button + its `useSidebarStore` usage; keep the
      brand mark + title (left) and `LanguageToggle` (right). Keep the slim `h-14` bar; rebalance
      left padding now that the toggle is gone.
- [ ] `sidebar.tsx`: add a toggle row at the top of the rail (above `<nav>`), wired to the store
      `toggle`; show the unfold icon when collapsed, fold icon when expanded; `aria-pressed` +
      `aria-label`/`title` from `t.nav.{collapse,expand}Sidebar`. Align it to the rail in both
      collapsed (centered) and expanded states.
- [ ] Polish both: active pill (`bg-brand-50`/`text-brand-700`), hover (`hover:bg-neutral-100`),
      consistent padding/spacing; keep the `transition-[width]` collapse animation. Optional: a
      subtle divider between the toggle and the nav.
- [ ] Verify: the rail toggle collapses/expands; relaunch remembers the state; the app bar shows
      only brand + language; active route highlighted; `bun run typecheck` passes.

## Done when

- The collapse toggle lives at the top of the sidebar; the app bar shows only brand + language.
- Collapse-to-icons + expand still works and persists across relaunch.
- Both surfaces visibly refined; light-only; `bun run typecheck` passes.

## Touches

- `src/components/layout/app-bar.tsx` — drop the toggle; brand + language only.
- `src/components/layout/sidebar.tsx` — toggle at top of rail + polish.
- `src/components/layout/app-layout.tsx` — only if spacing needs a tweak.
