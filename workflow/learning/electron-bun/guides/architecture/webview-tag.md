> Source: https://github.com/blackboardsh/electrobun/blob/main/docs/src/content/docs/electrobun/guides/architecture/webview-tag.mdx · fetched 2026-05-24

# Webview Tag Architecture

## Overview

The `<electrobun-webview>` tag is Electrobun's Out-Of-Process IFrame (OOPIF) — a secure, isolated, performant way to embed web content. Unlike traditional iframes or Electron's deprecated `<webview>` tag, it offers full process isolation with seamless DOM integration.

> **Note:** For a deep dive into the implementation and philosophy, see the blog post: [Building a Better OOPIF](https://blackboard.sh/blog/building-a-better-oopif).

## Why Not Regular IFrames?

Standard iframes' limitations for desktop apps:

- **Security restrictions**: browsers prevent iframes loading cross-domain content.
- **Limited control**: can't fully customize behavior or bypass same-origin policies.
- **Performance constraints**: share the same process as the parent page.
- **Feature limitations**: restricted access to native APIs and advanced browser features.

## The OOPIF Advantage

- **Process isolation**: each webview runs in its own isolated process.
- **Security boundary**: complete separation between host and embedded content.
- **Performance**: independent resource allocation + crash protection.
- **Flexibility**: full control over content loading and permissions.

## How It Works

`<electrobun-webview>` is a layer positioned above the main window, synced with the DOM element's position/size. Provides:

1. **DOM Integration**: behaves like any DOM element — style, animate, position via CSS.
2. **Process Separation**: content runs in a fully isolated process, no cross-contamination.
3. **Transparent Layering**: transparency + layering effects without breaking host design.
4. **Native Performance**: direct rendering without iframe overhead.

## Key Features

### Full Isolation

Each `<electrobun-webview>` runs in its own process:

- Crash protection (one crash doesn't affect others).
- Memory isolation.
- Security boundaries between content sources.

### Seamless Communication

Fast IPC between: the Bun main process, the host webview, individual OOPIF webviews.

### Not Deprecated

Unlike Electron's `<webview>` tag (Chromium's deprecated implementation scheduled for removal Jan 2025), Electrobun's is built from the ground up and will keep being supported/improved.

## Usage Example

```
<electrobun-webview
  src="https://electrobun.dev"
  style="width: 100%; height: 500px;">
</electrobun-webview>
```

Integrates with your app's DOM while keeping full process isolation for security + performance.

## Architecture Benefits

- **Security**: full process isolation prevents XSS and other attacks.
- **Reliability**: crash isolation — one failing webview won't crash the app.
- **Performance**: independent resource allocation + rendering.
- **Flexibility**: full control without iframe limitations.
- **Future-proof**: not dependent on deprecated Chromium features.

See the [Building a Better OOPIF](https://blackboard.sh/blog/building-a-better-oopif) blog post for technical details + evolution.
