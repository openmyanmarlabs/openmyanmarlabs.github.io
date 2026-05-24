# 010-03 — Calculations (TDD)

Plan: `010-root-open-myanmar-invoice.md` · Blocked by: 01 · Parallel-safe with: 02, 04

## Goal

Pure invoice-math module (subtotal, % + flat taxes, total, truncate-2-decimal) ported from the original `utils/match.js`, fully unit-tested, with no DB or React dependency.

## Context

- **This is the first/easiest TDD target — drive it test-first.** Read `.claude/skills/tdd/SKILL.md` first: one behavior at a time, red→green→refactor, co-located `*.test.ts`, `bun test`. No SQLite/DI needed here (pure functions).
- Functional source of truth: `workflow/learning/invoice-maker/guides/06-calculations.md`. Original logic:
  - `sumProductTotal(items)` — Σ per line `quantity × amount`, each line truncated to 2 decimals, then summed.
  - Percentage tax (**max one**): `amount = value/100 × subtotal`, recomputed whenever items change. A 2nd `percentage` tax is refused (return/flag — surface as a validation error the builder can toast).
  - Flat tax (unlimited): `value === amount` (static).
  - `total = subtotal + Σ(all tax amounts)`, truncate-2-decimal.
  - **Truncate trick (not rounding):** `value.toFixed(4).slice(0, -2)` → 2 decimals truncated (`12.349 → "12.34"`). Integers bypass (kept numeric, so whole amounts don't render `.00`).
- Place under `src/lib/calc/` (renderer-importable pure module) — the builder (08) imports it; no Electrobun/DB imports so it's trivially testable.
- Type the inputs to match the schema row shapes where practical (item: `{amount, quantity}`; tax: `{type, value, amount}`), but keep functions pure/standalone.

## Steps (red → green → refactor, one behavior each)

- [ ] Test: single line `qty×amount` truncates to 2 decimals → implement `truncate2`.
- [ ] Test: `sumProductTotal` over multiple lines (incl. a fractional line proving truncation, and an integer line proving no `.00`).
- [ ] Test: percentage tax amount = `value/100 × subtotal`; recompute when subtotal changes.
- [ ] Test: adding a 2nd percentage tax is refused (error/flag).
- [ ] Test: flat tax `amount === value`; multiple flats allowed.
- [ ] Test: `total = subtotal + Σ taxes`, truncated; mixed %+flat case.
- [ ] Test: edge cases — empty items (0), zero-qty line, large decimals matching the original's truncation exactly.
- [ ] Refactor to a clean exported API once green.

## Done when

- All behaviors above green under `bun test`; numbers match the original's truncate-not-round semantics exactly.
- Module is pure (no DB/React/Electrobun imports) and exports a stable API the builder can consume.

## Touches

- `src/lib/calc/invoice-math.ts` — the pure functions.
- `src/lib/calc/invoice-math.test.ts` — co-located tests.
