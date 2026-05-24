# Tailwind CSS v4 Knowledge Base

Tailwind CSS v4 — utility-first CSS framework, fully rewritten. New high-perf engine (Oxide): full builds up to 5x faster, incremental 100x+. **CSS-first config** (design tokens live in CSS, no `tailwind.config.js` required). Built on modern CSS: cascade layers, `@property`, `color-mix()`, `oklch` colors, container queries built in. Auto content detection (no `content` array). Vite plugin is the fast path.

Local agent reference: condensed mirror of the official docs. Fetched 2026-05-24 from [tailwindcss.com/docs](https://tailwindcss.com/docs). Latest release at fetch time: **v4.3** (2026-05-08); rewrite landed in **v4.0** (Jan 2025). Read this index, follow ONE link to the reference you need.

## Guides

- [what-is-tailwind-v4](./guides/what-is-tailwind-v4.md) — what v4 is, engine, browser reqs, install paths
- [installation-vite](./guides/installation-vite.md) — install with `@tailwindcss/vite` (the path for the Electrobun template)
- [content-detection](./guides/content-detection.md) — automatic class scanning, `@source`, safelisting, dynamic-class gotcha
- [dark-mode](./guides/dark-mode.md) — default `prefers-color-scheme`, class/data-attribute override, toggle
- [custom-styles](./guides/custom-styles.md) — arbitrary values, `@utility`, `@custom-variant`, base styles, `@apply`/`@reference`

## APIs

- [theme](./apis/theme.md) — `@theme`, theme-variable namespaces, override/replace, `@theme inline`, referencing vars
- [directives-and-functions](./apis/directives-and-functions.md) — every CSS directive + function: `@import`, `@theme`, `@source`, `@utility`, `@variant`, `@custom-variant`, `@apply`, `@reference`, `@plugin`, `--alpha()`, `--spacing()`, `theme()`

---

Source: <https://tailwindcss.com/docs> · fetched 2026-05-24 · v4 (latest v4.3).
