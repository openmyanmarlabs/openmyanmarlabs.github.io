# 017-03 — Color picker upgrade

Plan: `017-root-<slug>.md` · Blocked by: — · Parallel-safe with: 01, 02

## Goal

Replace the native `<input type="color">` in DesignModal with a curated swatch grid + react-colorful gradient picker, keeping the hex text input.

## Context

- Color section lives in `apps/open-myanmar-invoice/src/features/invoices/components/design-modal.tsx` lines 78–92.
- Current UI: native `<input type="color">` (size-11) + hex text field side-by-side inside `<div className="flex items-center gap-3">`.
- `commitHex(value)` (line 55–58) validates `/^#[0-9a-fA-F]{6}$/` then calls `onColorChange(hex)` → writes to zustand builder store → live preview updates.
- `HEX_RE` constant already defined at line 30.
- `color` prop is the committed hex from the store; `hexDraft` is local draft state.
- App is **light-only** — no dark-mode classes needed in new UI.
- Library: **react-colorful** — `HexColorPicker` from `"react-colorful"`. Props: `color` (string), `onChange` (callback). Outputs valid 6-char hex. 2 KB, no CSS import needed (inline styles). Not yet in `package.json`.

## Steps

- [ ] `cd apps/open-myanmar-invoice && bun add react-colorful`
- [ ] Open `design-modal.tsx`; add import: `import { HexColorPicker } from "react-colorful";`
- [ ] Define `SWATCHES` constant (module-level, before the component):
  ```ts
  const SWATCHES = [
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#64748b",
    "#2563eb",
    "#4f46e5",
    "#0f766e",
    "#1e293b",
  ];
  ```
- [ ] Replace the `<div className="flex items-center gap-3">` block (lines 78–92) with three stacked parts inside a `<div className="flex flex-col gap-3">`:
  1. **Swatch grid** — `<div className="grid grid-cols-8 gap-2">` containing `SWATCHES.map(...)`. Each swatch button: `size-7 rounded-lg cursor-pointer ring-offset-1 transition-all` + selected ring `ring-2 ring-brand-500` when `swatch.toLowerCase() === color.toLowerCase()`, else `ring-transparent hover:scale-110`. Click calls `commitHex(swatch)`.
  2. **HexColorPicker** — `<HexColorPicker color={HEX_RE.test(hexDraft) ? hexDraft : color} onChange={commitHex} className="w-full" />`
  3. **Hex text input** — keep unchanged: `value={hexDraft}`, `onChange={(e) => commitHex(e.target.value)}`, same Tailwind classes as current.
- [ ] Remove native `<input type="color">` entirely (no remnants).
- [ ] Run `bun run typecheck` from `apps/open-myanmar-invoice`; fix any type errors (react-colorful ships its own types).
- [ ] Smoke-test in dev: pick a swatch → invoice preview updates; drag HexColorPicker → preview updates live; type hex manually → preview updates on valid input.

## Done when

- DesignModal renders swatch grid (16 colors), HexColorPicker gradient picker, and hex text input.
- No `<input type="color">` remains in the component.
- Clicking a swatch applies the color to the live invoice preview immediately.
- Dragging HexColorPicker hue/saturation updates the preview live.
- Hex text field still accepts manual hex entry and validates before committing.
- `bun run typecheck` passes with no errors.

## Touches

- `apps/open-myanmar-invoice/src/features/invoices/components/design-modal.tsx` — remove native color input; add SWATCHES constant, HexColorPicker import, swatch grid, and gradient picker.
- `apps/open-myanmar-invoice/package.json` — adds `react-colorful` dependency.
- `apps/open-myanmar-invoice/bun.lockb` — updated by `bun add`.
