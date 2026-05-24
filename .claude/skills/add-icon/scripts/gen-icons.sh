#!/usr/bin/env bash
#
# gen-icons.sh — deterministic icon generation for an Electrobun app.
#
# Produces, from one square source PNG:
#   <app-dir>/icon.iconset/            (the 10 Apple-named sizes; consumed
#                                        directly by build.mac.icons, and the
#                                        256px PNG is reused for win/linux)
#   <app-dir>/public/tray-icon.png     (32px; Vite copies public/ -> dist/ ->
#                                        views://main/ via the post-build hook,
#                                        so the tray can load views://main/tray-icon.png)
#
# Only the pixel-pushing lives here — it's identical every run, so a script is
# more reliable than re-deriving sips calls each time. Wiring electrobun.config.ts
# and the Tray code is left to the SKILL (those files differ per app).
#
# Usage:
#   gen-icons.sh <source.png> <app-dir> [--no-tray]
#
# Source must be a square PNG >= 1024px (Apple's iconset tops out at 1024, so
# every generated size is a downscale — crisp, never upscaled).
#
# Deps: macOS `sips` (preinstalled). No iconutil/Xcode needed — Electrobun
# consumes the .iconset folder as-is.

set -euo pipefail

die() { echo "error: $*" >&2; exit 1; }

[[ $# -ge 2 ]] || die "usage: gen-icons.sh <source.png> <app-dir> [--no-tray]"

SRC="$1"
APP_DIR="$2"
MAKE_TRAY=1
[[ "${3:-}" == "--no-tray" ]] && MAKE_TRAY=0

command -v sips >/dev/null 2>&1 || die "sips not found (this script targets macOS)"
[[ -f "$SRC" ]] || die "source image not found: $SRC"
[[ -d "$APP_DIR" ]] || die "app dir not found: $APP_DIR"

# Validate square + size. Distorting a non-square logo into a square icon looks
# bad, so refuse rather than silently stretch.
W=$(sips -g pixelWidth  "$SRC" | awk '/pixelWidth/  {print $2}')
H=$(sips -g pixelHeight "$SRC" | awk '/pixelHeight/ {print $2}')
[[ -n "$W" && -n "$H" ]] || die "could not read dimensions of $SRC (is it a valid image?)"
[[ "$W" == "$H" ]] || die "source must be square; got ${W}x${H}. Crop/pad it to a square first."
# Apple's iconset tops out at 1024 (icon_512x512@2x), so requiring >= 1024 means
# every size is downscaled — never upscaled — i.e. crisp at all sizes.
(( W >= 1024 )) || die "source must be >= 1024px; got ${W}px. Provide a 1024x1024 (or larger) PNG so every icon size stays crisp."

ICONSET="$APP_DIR/icon.iconset"
mkdir -p "$ICONSET"

# name -> pixel size. sips -z forces exact HxW (safe: source is square).
emit() { # <size> <outfile>
  sips -z "$1" "$1" "$SRC" --out "$2" >/dev/null
  echo "  $2"
}

echo "iconset -> $ICONSET"
emit 16   "$ICONSET/icon_16x16.png"
emit 32   "$ICONSET/icon_16x16@2x.png"
emit 32   "$ICONSET/icon_32x32.png"
emit 64   "$ICONSET/icon_32x32@2x.png"
emit 128  "$ICONSET/icon_128x128.png"
emit 256  "$ICONSET/icon_128x128@2x.png"
emit 256  "$ICONSET/icon_256x256.png"
emit 512  "$ICONSET/icon_256x256@2x.png"
emit 512  "$ICONSET/icon_512x512.png"
emit 1024 "$ICONSET/icon_512x512@2x.png"

if (( MAKE_TRAY )); then
  PUBLIC="$APP_DIR/public"
  mkdir -p "$PUBLIC"
  echo "tray -> $PUBLIC"
  emit 32 "$PUBLIC/tray-icon.png"
  emit 64 "$PUBLIC/tray-icon@2x.png"
fi

echo "done."
