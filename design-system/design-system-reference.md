# Design System

Clean, minimal, "Apple-white". One sharp accent on lots of white; clean Apple-system sans headlines; calm, purposeful motion. Light by default, dark + accent bands for emphasis.

## Color

| Role              | Value                 |
| ----------------- | --------------------- |
| Surface (bg)      | `#ffffff`             |
| Panel (alt bg)    | `#f5f5f7`             |
| Text              | `#1d1d1f`             |
| Text muted        | `#6e6e73`             |
| Accent            | `#0071e3`             |
| Accent hover      | `#0077ed`             |
| Hairline (border) | `#d2d2d7`             |
| Success           | `#34c759`             |
| Danger            | `#ff3b30`             |
| Accent tint       | `rgba(0,113,227,.10)` |
| Success tint      | `rgba(52,199,89,.14)` |
| Overlay           | `rgba(0,0,0,.28)`     |

**Dark surfaces:** ink `#0f1216` / deeper `#0b0e11`; text `#f5f5f7` + muted `rgba(255,255,255,.6)`; hairline `rgba(255,255,255,.12)`; accent-on-dark `#5aa9ff`.
**Gradients:** brand mark `140deg #0071e3 → #34c759` · CTA band `155deg #0a84ff → #0071e3 → #0a5bbf`.

## Typography

- **Body:** system UI sans (San Francisco / Segoe / Roboto).
- **Display:** Apple system sans (`-apple-system` → SF Pro); same family as body, heavier weight.
- **Secondary script:** Noto Sans Myanmar (Burmese).
- **Numbers:** tabular figures.

| Step    | Size | Weight          |
| ------- | ---- | --------------- |
| display | 56   | 600 (`-0.02em`) |
| h1      | 32   | 600             |
| h2      | 24   | 600             |
| h3      | 20   | 600             |
| body    | 17   | 400             |
| small   | 15   | 400             |
| caption | 13   | 400             |

Line-height: heading `1.2`, body `1.5`.
Fluid headings (viewport-scaled, px): hero `44 → 92` · section `30 → 50` · stat `40 → 72`.

## Spacing

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64` (· `96` · `128`).

## Radius

`sm 8` · `md 12` · `lg 20` · `xl 28` · `pill 980 (full)`.

## Elevation

- sm `0 1px 3px rgba(0,0,0,.06)`
- md `0 4px 16px rgba(0,0,0,.08)`
- float — layered soft drop (hero cards)
- hover `0 6px 20px rgba(0,0,0,.1)` — surface raised on hover

## Motion

- Durations `150 / 250 / 400ms` · micro `200ms` (hover/press/toggle feedback).
- Ease (standard) `cubic-bezier(.4,0,.2,1)` · ease (reveal) `cubic-bezier(.22,1,.36,1)` · ease (spring) `cubic-bezier(.34,1.56,.64,1)` · ease (out-back) `cubic-bezier(.18,.89,.32,1.28)`.
- Scroll reveal: fade + ~24px lift, staggered, once.
- Micro-interactions (tasteful, purposeful):
  - **Hover** — surfaces lift `~2px` (cards `~4px`) into a raised shadow (`elevation-hover`); small controls nudge scale `~1.02`.
  - **Press** — scale `.98`, layered over hover.
  - **Toggle** — switch thumb springs across (spring stiffness/damping tokens); under reduced-motion it snaps.
- Honor reduced-motion everywhere: token durations collapse to ~0 + per-animation `useReducedMotion()` drops transforms/springs.

## Components

| Component | Spec                                                                                          |
| --------- | --------------------------------------------------------------------------------------------- |
| Button    | primary (accent pill) / secondary (panel) / ghost · sizes sm/md/lg · hover-lift + press-scale |
| Badge     | free (green) / soon (gray) / pro (blue) / neutral                                             |
| Card      | white surface, hairline border, optional shadow, rounded · opt-in `interactive` hover-lift    |
| Stat tile | small label + big value                                                                       |
| Count-up  | number animates up to value                                                                   |
| Switch    | controlled iOS-style toggle · two labels · sliding spring thumb · role=switch                 |
| Skeleton  | shimmer placeholder                                                                           |
| Sheet     | modal / bottom sheet                                                                          |
| Toast     | transient notification                                                                        |

## Principles

- One sharp accent; everything else neutral.
- Generous white space; hairlines over heavy rules.
- Atmosphere, not flat: soft radial wash + faint grain.
- Section rhythm: white → panel → white → ink → accent band → ink.
- Pills for actions; rounded cards everywhere.
- Numbers are first-class — tabular, large, animated.
- Calm, purposeful motion: one orchestrated reveal anchors each section; tasteful micro-animation (hover, press, toggle, scroll) adds tactility on top. Purposeful, not flashy — and always honor reduced-motion.
- Bilingual-ready (Latin + Burmese); shared tabular numerals.
