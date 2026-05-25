---
name: add-icon
description: >-
  Add or update an Electrobun app's icon/logo in this monorepo from a single
  square source PNG. Generates the macOS icon.iconset (all 10 sizes), wires the
  mac/win/linux icon paths into that app's electrobun.config.ts, and optionally
  sets up a template (monochrome) system-tray icon, then verifies. Use this
  whenever the user wants to set, change, replace, or update an app's icon, logo,
  app icon, dock/taskbar icon, installer icon, or tray/menu-bar icon for an
  Electrobun app under apps/* — e.g. "update the logo in electrobun", "set the
  app icon for electrobun-template", "give my app an icon from this png", "add a
  tray icon". Reach for it even if they don't say "iconset" or name a config
  field — the trigger is the intent to put a custom icon on an Electrobun app.
  Not for web favicons or non-Electrobun packages.
---

# add-icon

Put a custom icon on an Electrobun app from one square PNG. Two halves:

1. **Deterministic pixels** — `scripts/gen-icons.sh` resizes the source into the
   `icon.iconset` folder + tray PNGs. Always run the script; never hand-resize.
2. **Code-aware wiring** — edit that app's `electrobun.config.ts` (and, for a
   tray, `src/bun/index.ts`). Configs differ per app, so edit by reading, not by
   blind find-replace.

## Inputs

- **Source PNG** — square, ≥1024px. (Apple's iconset tops out at 1024, so this
  guarantees every size is a downscale — crisp, never upscaled.) Ask for the path
  if not given.
- **App name** — a dir under `apps/`. Target is `apps/<app-name>/`. If the user
  named one app, use it; if ambiguous, list `apps/*` and ask.

Validate before doing work: source exists + is square (the script enforces this
and refuses non-square rather than stretching), and `apps/<app-name>/electrobun.config.ts`
exists. If either fails, stop and tell the user.

## Step 1 — generate the icon files

```bash
.claude/skills/add-icon/scripts/gen-icons.sh <source.png> apps/<app-name> \
  [--no-tray | --tray-only] [--tray-scale <frac>]
```

Flags:

- `--no-tray` — iconset only (user wants just the app/bundle icon).
- `--tray-only` — tray PNGs only, leave the iconset alone (just resizing/retouching
  the tray — what you want when only the menu-bar icon is wrong).
- `--tray-scale <frac>` — glyph size as a fraction of the tray canvas. Default
  `0.6` (60%). Lower = smaller glyph / more padding.

The script writes:

- `apps/<app-name>/icon.iconset/` — the 10 Apple-named PNGs (full-bleed). Skipped with `--tray-only`.
- `apps/<app-name>/public/tray-icon.png` (32px canvas) + `tray-icon@2x.png` (64px canvas) — skipped with `--no-tray`.

**Tray icons are padded, not full-bleed.** A menu-bar glyph that fills its canvas
renders oversized next to the bar. So the tray PNGs crop the source to its alpha
bounding box, scale that glyph to `--tray-scale` of the canvas, and center it on a
transparent square. The padding is what sets the on-bar size — shrink the glyph by
lowering `--tray-scale`, don't touch the `Tray({ width, height })` (those stay at
the canvas size). The bbox crop normalizes whatever internal padding the source
already had, so the scale is honest across different logos.

It prints what it created. macOS only (`sips` for the iconset). The tray glyph is
cropped+centered with Python/Pillow when present; without Pillow it falls back to
`sips` resize + transparent pad (still centered, just not bbox-cropped, so the
visible glyph reads a touch smaller than the scale).

## Step 2 — wire the bundle icon into electrobun.config.ts

Read `apps/<app-name>/electrobun.config.ts`. Inside the existing `build: { ... }`
object (it already has a `bun` key — keep it), add the three platform keys. Reuse
the iconset's 256px PNG for win/linux so there's one source of truth:

```ts
build: {
  bun: { /* ...leave as-is... */ },
  mac:   { icons: "icon.iconset" },
  win:   { icon:  "icon.iconset/icon_256x256.png" },
  linux: { icon:  "icon.iconset/icon_256x256.png" },
},
```

Notes:

- Paths are relative to the app root (Electrobun runs from there) — **not** the repo root.
- If a `mac`/`win`/`linux` block already exists, update the icon key in place; don't duplicate.
- `build.mac.icons` is plural (`icons`); win/linux are singular (`icon`). Easy to get wrong.
- A PNG given to win is auto-converted to `.ico` at build time — fine to reuse the iconset PNG.

## Step 3 — wire the tray icon (skip if `--no-tray`)

Only for apps that should have a system-tray / menu-bar presence. Style default:
**template (monochrome)** on macOS — a black/white image derived from the PNG's
alpha that adapts to light/dark menu bars. See the alpha caveat below.

In the app's bun entrypoint (`src/bun/index.ts` in the template), import `Tray`
and create it after the window exists. The tray image loads over `views://` —
in this monorepo's template the bundled UI lives under `views://main/` (Vite's
`public/` is copied there by the post-build hook), so the path is
`views://main/tray-icon.png`:

```ts
import Electrobun, { /* ...existing..., */ Tray } from "electrobun/bun";

// ...after mainWindow is created...

const tray = new Tray({
  title: "", // menu-bar text; "" = icon only
  image: "views://main/tray-icon.png",
  template: true, // macOS: adapt to light/dark. false = full color
  width: 32,
  height: 32,
});

// Minimal menu: built lazily on first click (Electrobun pattern).
const showTrayMenu = () => {
  tray.setMenu([
    { type: "normal", label: "Show Window", action: "show-window" },
    {
      type: "normal",
      label: "Check for Updates…",
      action: "check-for-updates",
    },
    { type: "divider" },
    { type: "normal", label: "Quit", action: "quit" },
  ]);
};

tray.on("tray-clicked", (e) => {
  const action = (e.data as { action: string }).action;
  if (action === "") return showTrayMenu(); // bare icon click → open menu
  if (action === "show-window") mainWindow.focus?.();
  if (action === "check-for-updates")
    mainWindow.webview.rpc?.send.triggerUpdateCheck({});
  if (action === "quit") Utils.quit();
});
```

Adapt action handlers to what the app actually has (e.g. only forward
`check-for-updates` if that RPC exists — the template has it). Keep the tray menu
small; it's a shortcut surface, not the main UI.

## Step 4 — verify

Typecheck always; full build if practical:

```bash
cd apps/<app-name> && bun run typecheck
```

A full `bun run build` (`vite build && electrobun build`) is the real proof the
icon embeds into the bundle/installer, but it's slow and may need signing creds —
run it if the user wants the strongest confirmation, otherwise confirm the
generated files exist + typecheck passes and say a build is the final check.

After a successful build you can sanity-check the bundle icon on macOS:
`build/*/.../*.app/Contents/Resources/AppIcon.icns` (or the app shows it in Finder).

## Gotchas

- **Template tray needs alpha, not color.** A macOS template image is defined by
  the PNG's _opacity_ (transparent vs opaque), rendered as a single adaptive
  color — not by the logo's hues. A full-color, fully-opaque square logo becomes
  a solid black square. If the source is a transparent monochrome glyph it looks
  great; if it's a busy/opaque logo, either tell the user to supply a dedicated
  transparent silhouette for the tray, or set `template: false` (full color).
- **Dev shows the STALE tray, not the new one.** `views://main/tray-icon.png`
  resolves from the bundle, and this monorepo's dev flow (`scripts/dev.ts` →
  `electrobun dev --watch` → `post-build`) fills the bundle by copying `dist/` —
  but `dist/` is only refreshed by `vite build`, which the dev server never runs.
  So a freshly regenerated `public/tray-icon.png` does **not** reach the running
  app: it keeps loading the old icon baked into `dist/` from the last full build.
  To see a regenerated tray in dev: copy the new PNGs into `dist/` (and the live
  bundle's `…/app/views/main/`), then **restart** (the `Tray` image is set once at
  construction). A prod `bun run build` does this correctly on its own.
  ```sh
  cp public/tray-icon.png public/tray-icon@2x.png dist/
  ```
- **Rebuild is required for the bundle icon.** It's embedded at build time —
  config/asset changes don't show until a rebuild. The tray image is set once when
  the `Tray` is constructed, so a regenerated `tray-icon.png` needs an app
  **restart** (or a `tray.setImage(...)` call) to appear — no full rebuild, but a
  live dev session won't hot-swap it.
- **Tray too big/small? Change the padding, not the window.** On-bar size is set by
  how much of the canvas the glyph fills — re-run with a different `--tray-scale`
  (default `0.6` = 60%). Leave `Tray({ width: 32, height: 32 })` matching the
  canvas; shrinking those distorts/clips instead of resizing the glyph.
- **`.icon` (Icon Composer) files need full Xcode (`actool`).** This skill uses
  the `.iconset` folder route on purpose — works with just Command Line Tools.
- **Source must be square and ≥1024px.** The script refuses non-square or
  too-small input rather than distorting/upscaling it. Crop/pad and use a 1024px+
  export.

## Quick reference

| What                                    | Where                                                            | When it applies              |
| --------------------------------------- | ---------------------------------------------------------------- | ---------------------------- |
| Bundle icon (dock, switcher, installer) | `build.mac.icons` / `build.win.icon` / `build.linux.icon`        | build-time, rebuild to apply |
| Tray / menu-bar icon                    | `Tray({ image, template, ... })` in `src/bun/index.ts`           | runtime                      |
| Tray asset path                         | `apps/<app>/public/tray-icon.png` → `views://main/tray-icon.png` | via post-build copy          |
