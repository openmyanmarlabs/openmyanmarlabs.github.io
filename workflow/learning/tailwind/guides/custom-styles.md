> Source: https://tailwindcss.com/docs/adding-custom-styles · fetched 2026-05-24

# Custom styles

## Arbitrary values & properties

One-off value with `[...]`:

```html
<div class="top-[117px] lg:top-[344px]"></div>
<div class="bg-[#bada55] text-[22px] before:content-['Festivus']"></div>
```

Arbitrary CSS property (Tailwind has no utility for it):

```html
<div class="[mask-type:luminance] hover:[mask-type:alpha]"></div>
<div class="[--scroll-offset:56px] lg:[--scroll-offset:44px]"></div>
```

Reference a CSS variable with **parens** (v4 syntax):

```html
<div class="fill-(--my-brand-color)"></div>
```

## Custom utilities — `@utility`

Define a custom utility. Works with all variants (`hover:`, `lg:`…).

```css
@utility content-auto {
  content-visibility: auto;
}
```

Complex (nesting allowed):

```css
@utility scrollbar-hidden {
  &::-webkit-scrollbar {
    display: none;
  }
}
```

### Functional utilities — `--value()` / `--modifier()`

Match a `name-*` pattern. Resolve against theme, bare, or arbitrary values:

```css
/* from theme namespace */
@utility tab-* {
  tab-size: --value(--tab-size-*);
}

/* bare value, typed */
@utility tab-* {
  tab-size: --value(integer);
}

/* arbitrary value, typed */
@utility tab-* {
  tab-size: --value([integer]);
}

/* support all three at once (stack the declarations) */
@utility tab-* {
  tab-size: --value([integer]);
  tab-size: --value(integer);
  tab-size: --value(--tab-size-*);
}
```

With a modifier (the `/...` part, e.g. `text-lg/7`) and a default:

```css
@utility text-* {
  font-size: --value(--text-*, [length]);
  line-height: --modifier(--leading-*, [length], [*]);
}

@utility tab-* {
  tab-size: --value(integer, --default(4));
}
```

Bare-value types: `number`, `integer`, `ratio`, `percentage`. Arbitrary-value types include: `color`, `length`, `angle`, `image`, `url`, `family-name`, `line-width`, `position`, `*`, and more.

## Custom variants — `@custom-variant`

```css
@custom-variant theme-midnight {
  &:where([data-theme="midnight"] *) {
    @slot;
  }
}
```

Shorthand:

```css
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

Multiple nested rules:

```css
@custom-variant any-hover {
  @media (any-hover: hover) {
    &:hover {
      @slot;
    }
  }
}
```

Usage: `theme-midnight:bg-black`.

## Base styles — `@layer base`

Element-level defaults (use theme vars for values):

```css
@layer base {
  h1 {
    font-size: var(--text-2xl);
  }
  h2 {
    font-size: var(--text-xl);
  }
}
```

## `@apply` + `@reference`

Inline existing utilities into hand-written CSS:

```css
.select2-dropdown {
  @apply rounded-b-lg shadow-md;
}
```

`@apply` needs Tailwind's context. In a **separate** stylesheet that doesn't `@import "tailwindcss"` (Vue/Svelte `<style>`, CSS modules), pull context in with `@reference` — it gives access to theme vars, custom utilities, and variants **without** duplicating CSS in the output:

```vue
<style>
@reference "../../app.css";
h1 {
  @apply text-2xl font-bold text-red-500;
}
</style>
```

Reference the default theme directly if you have no custom CSS:

```css
@reference "tailwindcss";
```
