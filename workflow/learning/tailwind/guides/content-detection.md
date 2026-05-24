> Source: https://tailwindcss.com/docs/detecting-classes-in-source-files · fetched 2026-05-24

# Content detection

v4 auto-scans your project for class names — **no `content` array**.

## How it works

Treats source files as **plain text** (no real parsing) — looks for tokens that could be class names. Scans every file **except**:

- files in `.gitignore`
- `node_modules/`
- binary files (images, video, zip)
- CSS files
- common lock files

So in the Electrobun template, `src/main-ui/**/*.tsx` is picked up automatically.

## `@source` — register extra sources

For files outside the default scan (e.g. a UI lib in `node_modules`):

```css
@import "tailwindcss";
@source "../node_modules/@acmecorp/ui-lib";
```

Set the scan base path with `source()`:

```css
@import "tailwindcss" source("../src");
```

Disable auto-detection and list sources manually:

```css
@import "tailwindcss" source(none);
@source "../admin";
@source "../shared";
```

## Safelisting — `@source inline()`

Force-generate classes that never literally appear in source (safelisting):

```css
@source inline("underline");
```

Brace expansion generates many at once — variants and ranges:

```css
@source inline("{hover:,focus:,}underline");
@source inline("{hover:,}bg-red-{50,{100..900..100},950}");
```

## Excluding

```css
@source not "../src/components/legacy"; /* ignore a path */
@source not inline("{hover:,focus:,}bg-red-{50,{100..900..100},950}"); /* block classes */
```

## Dynamic-class gotcha

Tailwind can't see interpolated class strings. **Don't** build class names from fragments:

```jsx
// ❌ never detected
<button className={`bg-${color}-600 hover:bg-${color}-500`}>
```

Map props to complete, static class names instead:

```jsx
// ✅ detected
const colorVariants = {
  blue: "bg-blue-600 hover:bg-blue-500 text-white",
  red: "bg-red-500 hover:bg-red-400 text-white",
};
<button className={colorVariants[color]}>
```
