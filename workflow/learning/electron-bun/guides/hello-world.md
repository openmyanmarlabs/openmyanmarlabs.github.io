> Source: https://github.com/blackboardsh/electrobun/blob/main/docs/src/content/docs/electrobun/guides/hello-world.mdx · fetched 2026-05-24

# Hello World

> **Note:** Electrobun installs a specific version of bun as a dependency in `node_modules`.

> **Note:** Assumes bun installed globally. With node.js or another package manager, adjust terminal commands and package.json scripts.

## Step 0: Init templates

Build hello world from scratch (this guide). To be up and running in seconds, use starter templates: `hello-world`, `photo-booth`, multi-tabbed `web-browser`. Run `bunx electrobun init` and choose a template.

## Step 1: Initialize your project folder

Create a folder, e.g. `/electrobun-test`. In it run `bun init .`. Prompted for package name — use `my-app`; entrypoint not needed, hit enter.

## Step 2: Install Electrobun as a dependency

```
bun install electrobun
```

## Step 3: Add package.json scripts to build and run

```javascript
{
  "name": "my-app",
  "devDependencies": {
    "@types/bun": "latest"
  },
  "peerDependencies": {
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "electrobun": "^0.0.1"
  },
  "scripts": {
    "start": "electrobun dev",
    "dev": "electrobun dev --watch"
  }
}
```

> **Note:** Modified the default bun package.json: removed `"type": "module"` and `"module": "index.ts"` (not needed); added two npm scripts using the electrobun CLI now in `node_modules/.bin`.

## Step 4: Hello World

Create `src/bun/index.ts`:

```javascript
import { BrowserWindow } from "electrobun/bun";
const win = new BrowserWindow({
  title: "Hello Electrobun",
  url: "https://electrobun.dev",
});
```

## Step 5: Configure Electrobun

Tell the CLI where the bun entrypoint is. Create `electrobun.config.ts` at project root:

```javascript
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
  },
};
```

## Step 6: Run your app

Run `bun start` — a window pops up and loads the site. Stop with `cmd+c`.
