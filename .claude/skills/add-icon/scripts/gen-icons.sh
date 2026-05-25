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
# The bundle/dock icon is full-bleed (it owns its whole canvas). The TRAY icon is
# NOT: a menu-bar glyph that fills its canvas renders oversized next to the bar,
# so the tray PNGs put a small glyph (default 60% of the canvas) centered on a
# transparent square. The padding is what controls the on-bar size — tune it with
# --tray-scale. The glyph is first cropped to its alpha bounding box so the result
# is independent of whatever internal padding the source already has.
#
# Only the pixel-pushing lives here — it's identical every run, so a script is
# more reliable than re-deriving sips/PIL calls each time. Wiring
# electrobun.config.ts and the Tray code is left to the SKILL (those files differ
# per app).
#
# Usage:
#   gen-icons.sh <source.png> <app-dir> [--no-tray | --tray-only] [--tray-scale <frac>]
#
#   --no-tray       iconset only, skip the tray PNGs
#   --tray-only     tray PNGs only, skip the iconset (e.g. just resizing the tray)
#   --tray-scale F  glyph size as a fraction of the tray canvas (default 0.6, 60%)
#
# Source must be a square PNG >= 1024px (Apple's iconset tops out at 1024, so
# every generated size is a downscale — crisp, never upscaled).
#
# Deps: macOS `sips` (preinstalled). The tray glyph is best cropped+centered with
# Python/Pillow when present (precise, bbox-normalized); without Pillow it falls
# back to sips resize + transparent pad (still centered, just not bbox-cropped).

set -euo pipefail

die() { echo "error: $*" >&2; exit 1; }

[[ $# -ge 2 ]] || die "usage: gen-icons.sh <source.png> <app-dir> [--no-tray|--tray-only] [--tray-scale <frac>]"

SRC="$1"; shift
APP_DIR="$1"; shift

MAKE_ICONSET=1
MAKE_TRAY=1
TRAY_SCALE="0.6"   # glyph occupies ~60% of the tray canvas; the rest is transparent padding

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-tray)    MAKE_TRAY=0 ;;
    --tray-only)  MAKE_ICONSET=0 ;;
    --tray-scale) shift; TRAY_SCALE="${1:-}"; [[ -n "$TRAY_SCALE" ]] || die "--tray-scale needs a value" ;;
    *)            die "unknown arg: $1" ;;
  esac
  shift
done

(( MAKE_ICONSET || MAKE_TRAY )) || die "--no-tray and --tray-only together leave nothing to do"

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

# name -> pixel size. sips -z forces exact HxW (safe: source is square).
emit() { # <size> <outfile>
  sips -z "$1" "$1" "$SRC" --out "$2" >/dev/null
  echo "  $2"
}

if (( MAKE_ICONSET )); then
  ICONSET="$APP_DIR/icon.iconset"
  mkdir -p "$ICONSET"
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
fi

if (( MAKE_TRAY )); then
  PUBLIC="$APP_DIR/public"
  mkdir -p "$PUBLIC"
  echo "tray (glyph ~${TRAY_SCALE} of canvas, transparent padding) -> $PUBLIC"

  HAVE_PIL=0
  command -v python3 >/dev/null 2>&1 && python3 -c "import PIL" >/dev/null 2>&1 && HAVE_PIL=1

  if (( HAVE_PIL )); then
    # Best path: crop to the glyph's alpha bbox (normalizes the source's own
    # padding), scale so its longest side = scale*canvas, center on a transparent
    # canvas. Result is a small, consistently-padded menu-bar icon.
    python3 - "$SRC" "$TRAY_SCALE" "$PUBLIC/tray-icon.png" "$PUBLIC/tray-icon@2x.png" <<'PY'
import sys
from PIL import Image

src, scale = sys.argv[1], float(sys.argv[2])
outs = [(32, sys.argv[3]), (64, sys.argv[4])]

base = Image.open(src).convert("RGBA")
bbox = base.split()[3].getbbox() or (0, 0, base.width, base.height)
glyph = base.crop(bbox)

for size, out in outs:
    target = max(1, round(size * scale))
    w, h = glyph.size
    if w >= h:
        nw, nh = target, max(1, round(h * target / w))
    else:
        nh, nw = target, max(1, round(w * target / h))
    g = glyph.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(g, ((size - nw) // 2, (size - nh) // 2), g)
    canvas.save(out)
    print(f"  {out}  (glyph {nw}x{nh} on {size}x{size})")
PY
  else
    # Fallback (no Pillow): resize the whole source to scale*canvas, then sips-pad
    # to the full canvas. sips pad keeps the added border transparent for PNGs, so
    # the glyph still ends up centered with transparent padding — just not
    # bbox-cropped, so the visible glyph is a touch smaller than scale.
    echo "  (Pillow not found — using sips resize + transparent pad; glyph not bbox-cropped)"
    pad_tray() { # <canvas-size> <outfile>
      local g; g=$(awk -v s="$1" -v sc="$TRAY_SCALE" 'BEGIN{printf "%d", (s*sc)+0.5}')
      (( g >= 1 )) || g=1
      local tmp; tmp=$(mktemp -t tray).png
      sips -z "$g" "$g" "$SRC" --out "$tmp" >/dev/null
      sips -p "$1" "$1" "$tmp" --out "$2" >/dev/null
      rm -f "$tmp"
      echo "  $2  (glyph ${g}x${g} on $1x$1)"
    }
    pad_tray 32 "$PUBLIC/tray-icon.png"
    pad_tray 64 "$PUBLIC/tray-icon@2x.png"
  fi
fi

echo "done."
