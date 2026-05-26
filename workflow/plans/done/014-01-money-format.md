# 014-01 — Money format (TDD)

Plan: `014-root-invoice-ux-fixes-1.md` · Blocked by: — · Parallel-safe with: 02, 03, 04

## Goal

`formatMoney` renders every amount as `<grouped-amount> <CODE>` (suffix), English digits, comma grouping — e.g. `1,000 MMK`, `1,000 USD`. No symbols (`K`/`$`), no Burmese numerals.

## Context

- Single source of truth: `apps/open-myanmar-invoice/src/lib/money.ts`. Every screen formats money through it (dashboard, invoice list/builder/summary, product list/selector, client list) — do NOT touch callers; they keep calling `formatMoney(amount, currency)`.
- Current bug: it uses `Intl.NumberFormat("my-MM", { style: "currency", currency, currencyDisplay: "narrowSymbol" })` → MMK shows `K` (a symbol) and `my-MM` renders Burmese numerals `၀-၉`.
- Decision (spec): suffix code form, English digits, for ALL `SUPPORTED_CURRENCIES` (`MMK, USD, EUR, GBP, JPY, THB, SGD, CNY`).
- Approach: format the number with English digits + grouping (e.g. `Intl.NumberFormat("en-US")` — comma grouping, Latin digits), then append `" " + code`. Drop `style: "currency"` entirely so no symbol/locale-digit leakage. Keep the existing contract: never throw on bad/non-finite input (fall back to `0`).
- Fraction digits: keep it simple — integer amounts render with no forced decimals (the app's amounts are whole-number MMK-style). Match current behavior (no `.00` was forced beyond Intl's currency default; new form uses plain number grouping, so default `maximumFractionDigits`). If a test reveals decimals matter, allow up to 2 — confirm via the test.
- **TDD** — follow `.claude/skills/tdd/SKILL.md`. Co-located `bun test`. No `money.test.ts` exists yet; create it. Pure util, no DB/DI needed.

## Steps

- [ ] Read `.claude/skills/tdd/SKILL.md` for the repo's red→green→refactor loop.
- [ ] RED: create `src/lib/money.test.ts` — first behavior: `formatMoney(1000, "MMK") === "1,000 MMK"`.
- [ ] GREEN: rewrite `formatMoney` to produce `<en-US grouped number> <code>`; make it pass.
- [ ] RED→GREEN, one behavior each:
  - [ ] `formatMoney(1250000, "MMK") === "1,250,000 MMK"` (grouping).
  - [ ] `formatMoney(1000, "USD") === "1,000 USD"` (code suffix for non-MMK, no `$`).
  - [ ] No Burmese numerals: result matches `/^[0-9,]/` (Latin digits) for a sample amount.
  - [ ] `formatMoney(0, "MMK") === "0 MMK"`.
  - [ ] Bad input safe: `formatMoney(NaN, "MMK")` and `formatMoney(Infinity, "MMK")` → `"0 MMK"` (never throws).
  - [ ] Unknown code still suffixes the raw code: `formatMoney(1000, "ZZZ") === "1,000 ZZZ"` (no throw).
- [ ] REFACTOR: keep `MONEY_LOCALE`-style constant if useful (now an `en-US` grouping locale); update the file's doc comment to describe the suffix-code form (drop the `style: "currency"`/`my-MM` rationale).
- [ ] Run `bun test src/lib/money.test.ts` green; `bun run typecheck` clean.

## Done when

- All behaviors above are green via `bun test`.
- `formatMoney` output is always `<latin-grouped-number> <CODE>`; never a symbol, never Burmese digits, never throws.
- `bun run typecheck` passes.

## Touches

- `apps/open-myanmar-invoice/src/lib/money.ts` — rewrite formatter + doc comment.
- `apps/open-myanmar-invoice/src/lib/money.test.ts` — new, co-located tests.
