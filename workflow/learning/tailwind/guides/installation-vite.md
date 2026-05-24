> Source: https://tailwindcss.com/docs/installation/using-vite · fetched 2026-05-24

# Install with Vite

Fastest path. Uses the dedicated `@tailwindcss/vite` plugin (not PostCSS).

## Steps

1. **Install** (bun shown; npm equivalent works):

   ```
   bun add tailwindcss @tailwindcss/vite
   ```

2. **Add the plugin** to `vite.config.ts`:

   ```typescript
   import { defineConfig } from "vite";
   import tailwindcss from "@tailwindcss/vite";

   export default defineConfig({
     plugins: [tailwindcss()],
   });
   ```

3. **Import Tailwind** in your CSS entry (one line):

   ```css
   @import "tailwindcss";
   ```

4. **Ensure the CSS is loaded** — link it in `index.html` `<head>`, or `import "./styles.css"` from your JS/TS entry. Then `bun run dev`.

That's it. No `tailwind.config.js`, no `content` array, no `postcss.config`. Configure (if needed) in CSS via `@theme` — see [theme](../apis/theme.md).

## Using this in the Electrobun template (this repo)

`apps/electrobun-template/` already has `vite.config.ts` with `@vitejs/plugin-react`, and `main.tsx` imports `src/main-ui/styles/global.css`. So integration is two edits:

- `vite.config.ts` → add `tailwindcss()` to `plugins` alongside `react()`:

  ```typescript
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";
  import tailwindcss from "@tailwindcss/vite";

  export default defineConfig({
    base: "./",
    plugins: [react(), tailwindcss()],
  });
  ```

- `src/main-ui/styles/global.css` → add `@import "tailwindcss";` at the top (keep the existing `@font-face` / KhitHaungg rules — Tailwind co-exists with hand-written CSS).

Vite bundles the CSS into `dist/`, so it works the same in dev (`localhost:5173`) and prod (`views://`). Keep `base: "./"` for relative asset URLs. Tailwind auto-detects classes in `src/main-ui/**` — no extra config (see [content-detection](./content-detection.md)).
