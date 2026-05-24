> Source: https://tailwindcss.com/blog/tailwindcss-v4 · fetched 2026-05-24

# What is Tailwind CSS v4

All-new version optimized for performance and flexibility. Not a config tweak — a rewrite.

## Headline features

- **New engine (Oxide).** Full builds up to **5x faster**, incremental builds **100x+** (microseconds). v4.2 added another ~3.8x recompile speedup.
- **CSS-first configuration.** Configure in your CSS with `@theme`, not a `tailwind.config.js`. See [theme](../apis/theme.md).
- **Zero-config content detection.** No `content` array — Tailwind auto-scans source files (respects `.gitignore`, skips `node_modules`/binaries/CSS). See [content-detection](./content-detection.md).
- **One-line import.** `@import "tailwindcss";` replaces the three `@tailwind base/components/utilities;` directives.
- **Built-in tooling.** `@import` handling, vendor prefixing, and nesting work out of the box — no `postcss-import` or `autoprefixer`.
- **Modern CSS foundation.** Cascade layers (`@layer`), registered custom properties (`@property`), `color-mix()`, native `oklch` color palette (wider gamut).
- **First-class container queries.** `@sm:`, `@md:` etc. built in — no plugin.
- **CSS theme variables.** Every token is exposed as a real CSS variable at `:root` (e.g. `var(--color-blue-500)`) — usable anywhere, in JS too.

## Browser requirements

v4 targets modern browsers and **will not work** on older ones:

- Safari **16.4+**
- Chrome **111+**
- Firefox **128+**

## Install paths

| Setup          | Package                | Notes                                                                 |
| -------------- | ---------------------- | --------------------------------------------------------------------- |
| **Vite**       | `@tailwindcss/vite`    | Recommended, fastest. See [installation-vite](./installation-vite.md) |
| PostCSS        | `@tailwindcss/postcss` | `plugins: { "@tailwindcss/postcss": {} }`                             |
| CLI            | `@tailwindcss/cli`     | `npx @tailwindcss/cli -i in.css -o out.css`                           |
| Webpack/Rspack | `@tailwindcss/webpack` | Added v4.2                                                            |

Utility-class mental model is the familiar one — `bg-*`, `flex`, `p-4`, responsive/state variants. What's distinctive to v4 is CSS-first configuration, the Oxide engine, and modern-CSS output.
