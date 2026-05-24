> Source: https://github.com/blackboardsh/electrobun/blob/main/docs/src/content/docs/electrobun/guides/creating-ui.mdx · fetched 2026-05-24

# Creating UI

> **Note:** Continues from the Hello World guide — adding UI.

App currently opens a window loading a URL. Let's make a simple web browser.

Create `src/main-ui/` with `index.ts` (browser code). CLI auto-transpiles to JS, served at `views://main-ui/index.js`.

```typescript
import { Electroview } from "electrobun/view";

// Instantiate the electrobun browser api
const electrobun = new Electroview({ rpc: null });

window.loadPage = () => {
  const newUrl = document.querySelector("#urlInput").value;
  const webview = document.querySelector(".webview");

  webview.src = newUrl;
};

window.goBack = () => {
  const webview = document.querySelector(".webview");
  webview.goBack();
};

window.goForward = () => {
  const webview = document.querySelector(".webview");
  webview.goForward();
};
```

Create the HTML to load into the BrowserView (imports the transpiled JS):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Web Browser</title>
    <script src="views://main-ui/index.js"></script>
</head>
<body>
    <h1>My Web Browser</h1>
    <input type="text" id="urlInput" placeholder="Enter URL" />
    <button onclick="loadPage()">Go</button>
    <button onclick="goBack()">Back</button>
    <button onclick="goForward()">Forward</button>

    <electrobun-webview class="webview" width="100%" height="100%" src="https://electrobun.dev">

</body>
</html>
```

Update `electrobun.config.ts` to transpile the new TS and copy the HTML for `main-ui`:

```typescript
export default {
  app: {
    name: "My App",
    identifier: "dev.my.app",
    version: "0.0.1",
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
    },
    views: {
      "main-ui": {
        entrypoint: "src/main-ui/index.ts",
      },
    },
    copy: {
      "src/main-ui/index.html": "views/main-ui/index.html",
    },
  },
};
```

Update bun process to load the new HTML:

```typescript
import { BrowserWindow } from "electrobun/bun";

const win = new BrowserWindow({
  title: "Hello Electrobun",
  url: "views://main-ui/index.html",
});
```

`ctrl+c` then `bun start` to rebuild/launch. Type `https://google.com`, hit go, try back/forward.

Note: right-click copy/paste works in the input, but `cmd+c`/`cmd+v`/`cmd+a` don't. Add an Application Edit menu to enable those shortcuts:

```typescript
import { BrowserWindow, ApplicationMenu } from "electrobun/bun";

ApplicationMenu.setApplicationMenu([
  {
    submenu: [{ label: "Quit", role: "quit" }],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      {
        label: "Custom Menu Item  🚀",
        action: "custom-action-1",
        tooltip: "I'm a tooltip",
      },
      {
        label: "Custom menu disabled",
        enabled: false,
        action: "custom-action-2",
      },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "pasteAndMatchStyle" },
      { role: "delete" },
      { role: "selectAll" },
    ],
  },
]);

const win = new BrowserWindow({
  title: "Hello Electrobun",
  url: "views://main-ui/index.html",
});
```

Using roles for cut/copy/paste/selectAll makes those global keyboard shortcuts work in the URL input.

> **Note:** Congratulations! You just built a simple web browser in Electrobun.
