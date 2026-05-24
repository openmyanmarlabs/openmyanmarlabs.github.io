> Source: https://tailwindcss.com/docs/functions-and-directives · fetched 2026-05-24

# Directives & functions

Quick reference. Deep dives: [theme](./theme.md), [custom-styles](../guides/custom-styles.md), [content-detection](../guides/content-detection.md), [dark-mode](../guides/dark-mode.md).

## Directives

### `@import`

Inline a CSS file, including Tailwind itself.

```css
@import "tailwindcss";
```

### `@theme`

Define design tokens that generate utilities. See [theme](./theme.md).

```css
@theme {
  --color-avocado-500: oklch(0.84 0.18 117.33);
  --breakpoint-3xl: 120rem;
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
}
```

### `@source`

Register source files outside automatic detection (or safelist with `inline()`). See [content-detection](../guides/content-detection.md).

```css
@source "../node_modules/@my-company/ui-lib";
```

### `@utility`

Add a custom utility (variant-aware). See [custom-styles](../guides/custom-styles.md).

```css
@utility tab-4 {
  tab-size: 4;
}
```

### `@variant`

Apply a Tailwind variant inside your own CSS.

```css
.my-element {
  background: white;
  @variant dark {
    background: black;
  }
}
```

### `@custom-variant`

Define a new variant.

```css
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

### `@apply`

Inline existing utility classes into custom CSS.

```css
.select2-dropdown {
  @apply rounded-b-lg shadow-md;
}
```

### `@reference`

Make theme vars / custom utilities / variants available to `@apply` in a stylesheet that doesn't import Tailwind (Vue/Svelte `<style>`, CSS modules) — no duplicated output.

```css
@reference "../../app.css";
/* or */
@reference "tailwindcss";
```

### `@plugin`

Load a JS plugin — package name or local path.

```css
@plugin "@tailwindcss/typography";
```

## Functions

### `--alpha()`

Apply opacity to a color (compiles to `color-mix`).

```css
.x {
  color: --alpha(var(--color-lime-300) / 50%);
}
/* → color-mix(in oklab, var(--color-lime-300) 50%, transparent) */
```

### `--spacing()`

Spacing value from the theme scale.

```css
.x {
  margin: --spacing(4);
} /* → calc(var(--spacing) * 4) */
```

In arbitrary values:

```html
<div class="py-[calc(--spacing(4)-1px)]"></div>
```

### `theme()`

Access a theme value by dot path. **Deprecated** — prefer CSS theme variables (`var(--…)`).

```css
.x {
  margin: theme(spacing.12);
}
```
