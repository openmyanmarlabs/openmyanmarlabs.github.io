# 019-01 — Chart.js install + registration

Plan: `019-root-report-page.md` · Blocked by: — · Parallel-safe with: 02, 03

## Goal

Add Chart.js + react-chartjs-2 to the invoice app and provide a single registration
module the chart components import, so `<Bar>` / `<Doughnut>` render without runtime
"not a registered scale/controller" errors.

## Context

- App: `apps/open-myanmar-invoice` (React 19, Vite renderer). Deps live in its
  `package.json` (see existing `react-day-picker`, `react-colorful` entries).
- Runtime is **Bun** — install with `bun add` from the app dir.
- react-chartjs-2 v5 does **not** auto-register. Either import from `chart.js/auto`
  (pulls everything) or register explicitly. Use **explicit** registration to keep the
  renderer bundle lean — only what the two charts need.
- This is a setup phase: no unit tests (a registration side-effect module isn't
  meaningfully unit-testable). Verified by: install resolves + the module type-checks +
  the chart components in phase 04 render.

## Steps

- [ ] From `apps/open-myanmar-invoice`, run `bun add chart.js@^4.4.0 react-chartjs-2@^5.3.0`.
- [ ] Confirm peer deps resolve cleanly against React 19 (react-chartjs-2 v5 supports it).
      If `bun add` warns on peers, note the resolved versions in the phase outcome.
- [ ] Create `src/features/reports/lib/register-charts.ts` — registers exactly the
      controllers/elements/scales/plugins the two charts use:

  ```ts
  // Side-effect module: import once before rendering any chart. Explicit
  // registration (not chart.js/auto) keeps the renderer bundle lean.
  import {
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    DoughnutController,
    Legend,
    LinearScale,
    Tooltip,
  } from "chart.js";

  Chart.register(
    BarController,
    BarElement,
    DoughnutController,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
  );
  ```

- [ ] Verify the app still type-checks / builds (`bun run` build or the project's
      typecheck) with the new module present.

## Done when

- `chart.js` + `react-chartjs-2` are in `apps/open-myanmar-invoice/package.json` and
  installed (lockfile updated).
- `src/features/reports/lib/register-charts.ts` compiles and registers the bar +
  doughnut stack.
- No TypeScript errors introduced; existing build/tests unaffected.

## Touches

- `apps/open-myanmar-invoice/package.json` — add chart.js + react-chartjs-2.
- `apps/open-myanmar-invoice/src/features/reports/lib/register-charts.ts` — new.
