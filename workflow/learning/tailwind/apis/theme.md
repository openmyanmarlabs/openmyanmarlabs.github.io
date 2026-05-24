> Source: https://tailwindcss.com/docs/theme · fetched 2026-05-24

# Theme (`@theme`)

CSS-first configuration. Theme variables are design tokens that **also generate utility classes**.

## `@theme` basics

Top-level only (not nested). Define a token → get utilities:

```css
@import "tailwindcss";

@theme {
  --color-mint-500: oklch(0.72 0.11 178);
}
```

→ generates `bg-mint-500`, `text-mint-500`, `fill-mint-500`, `border-mint-500`, …

> Use `@theme` for tokens that should map to utilities. Use plain `:root` for CSS variables that should **not** generate utilities.

## Namespaces

Each namespace controls a family of utilities/variants:

| Namespace                                     | Generates                                   |
| --------------------------------------------- | ------------------------------------------- |
| `--color-*`                                   | `bg-*`, `text-*`, `border-*`, `fill-*`, …   |
| `--font-*`                                    | `font-sans`, `font-serif`, …                |
| `--text-*`                                    | font-size: `text-xl`, `text-2xl`            |
| `--font-weight-*`                             | `font-bold`, `font-semibold`                |
| `--tracking-*`                                | letter-spacing: `tracking-wide`             |
| `--leading-*`                                 | line-height: `leading-tight`                |
| `--breakpoint-*`                              | **responsive variants** `sm:`, `md:`, `lg:` |
| `--container-*`                               | container-query variants `@sm:`; `max-w-md` |
| `--spacing` / `--spacing-*`                   | padding/margin/width/height/gap, etc.       |
| `--radius-*`                                  | `rounded-sm`, `rounded-lg`                  |
| `--shadow-*`                                  | `shadow-md`, `shadow-xl`                    |
| `--inset-shadow-*`                            | `inset-shadow-xs`                           |
| `--drop-shadow-*`                             | `drop-shadow-md`                            |
| `--blur-*`                                    | `blur-md`                                   |
| `--aspect-*`                                  | `aspect-video`                              |
| `--ease-*`                                    | `ease-out`, `ease-in-out`                   |
| `--animate-*`                                 | `animate-spin`, `animate-bounce`            |
| `--perspective-*`, `--zoom-*`, `--tab-size-*` | matching utilities                          |

## Extend vs override vs replace

Extend — just add a variable:

```css
@theme {
  --font-script: "Great Vibes", cursive; /* → font-script */
}
```

Override one default:

```css
@theme {
  --breakpoint-sm: 30rem; /* sm: now triggers at 30rem */
}
```

Replace a whole namespace — reset with `*: initial`, then define only yours (default `bg-red-500` etc. disappear):

```css
@theme {
  --color-*: initial;
  --color-white: #fff;
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
}
```

Reset the **entire** theme (`--*: initial`) for a fully custom system:

```css
@theme {
  --*: initial;
  --spacing: 4px;
  --font-body: Inter, sans-serif;
  --color-lagoon: oklch(0.72 0.11 221.19);
}
```

## `@theme inline`

Use when a token's value points at another CSS variable, so the utility emits the value directly (avoids cascade-scoping surprises):

```css
@theme inline {
  --font-sans: var(--font-inter);
}
```

→ `.font-sans { font-family: var(--font-inter); }`

## Keyframes in `@theme`

Co-locate `@keyframes` with the animation token:

```css
@theme {
  --animate-fade-in-scale: fade-in-scale 0.3s ease-out;

  @keyframes fade-in-scale {
    0% {
      opacity: 0;
      transform: scale(0.95);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
}
```

## Referencing theme vars in CSS / JS

All tokens compile to real CSS variables at `:root` (e.g. `--color-red-50`, `--text-base`, `--shadow-xl`). Use anywhere:

```css
@layer components {
  .typography h1 {
    font-size: var(--text-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-gray-950);
  }
}
```

```html
<div class="rounded-[calc(var(--radius-xl)-1px)]"></div>
```

```javascript
const shadow = getComputedStyle(document.documentElement).getPropertyValue(
  "--shadow-xl",
);
```

## Sharing a theme

Put `@theme` in its own file and import it (works across a monorepo or as an npm package):

```css
/* app.css */
@import "tailwindcss";
@import "../brand/theme.css";
```
