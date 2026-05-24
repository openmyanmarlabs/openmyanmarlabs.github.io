> Source: https://tailwindcss.com/docs/dark-mode · fetched 2026-05-24

# Dark mode

## Default — system preference

`dark:` variant follows `prefers-color-scheme` automatically. No config:

```html
<div class="bg-white dark:bg-gray-800">
  <h3 class="text-gray-900 dark:text-white">…</h3>
  <p class="text-gray-500 dark:text-gray-400">…</p>
</div>
```

## Override — class strategy

Drive dark mode by a `.dark` class instead of system pref. Redefine the `dark` variant:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Then toggle the class on `<html>`:

```html
<html class="dark">
  <body>
    <div class="bg-white dark:bg-black">…</div>
  </body>
</html>
```

## Override — data-attribute strategy

```css
@import "tailwindcss";
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

```html
<html data-theme="dark">
  …
</html>
```

## Three-state toggle (light / dark / system)

Run inline in `<head>` to avoid FOUC:

```javascript
document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches),
);

localStorage.theme = "light"; // user picks light
localStorage.theme = "dark"; // user picks dark
localStorage.removeItem("theme"); // user picks "system"
```

> For this repo: pairs naturally with the i18n context pattern in `landing/`/`electrobun-template` — store the choice, toggle the class on `document.documentElement`.
