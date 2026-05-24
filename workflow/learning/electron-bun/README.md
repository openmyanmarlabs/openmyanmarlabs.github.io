# Electrobun Knowledge Base

Electrobun — ultra fast, tiny, cross-platform desktop app framework. TypeScript + Bun runtime, native webview renderer (CEF optional), bsdiff-based updates. Targets macOS, Windows, Linux.

Local agent reference: condensed mirror of the official docs. Fetched 2026-05-24 from [blackboardsh/electrobun](https://github.com/blackboardsh/electrobun). Read this index, follow ONE link to the reference you need.

## APIs

### apis/ (root)

- [bun](./apis/bun.md) — main process API, lifecycle
- [browser-window](./apis/browser-window.md) — native window management
- [browser-view](./apis/browser-view.md) — webview windows
- [webgpu](./apis/webgpu.md) — native GPU windows, WebGPU
- [utils](./apis/utils.md) — file system, OS utilities
- [context-menu](./apis/context-menu.md) — native context menus
- [application-menu](./apis/application-menu.md) — native menu bars
- [paths](./apis/paths.md) — resource and view paths
- [tray](./apis/tray.md) — system tray
- [updater](./apis/updater.md) — built-in update mechanism
- [events](./apis/events.md) — event system, handling
- [build-config](./apis/build-config.md) — build-time config at runtime
- [bundled-assets](./apis/bundled-assets.md) — assets via views:// schema
- [bundling-cef](./apis/bundling-cef.md) — CEF bundling across platforms
- [application-icons](./apis/application-icons.md) — app icons per platform

### apis/browser/

- [electroview-class](./apis/browser/electroview-class.md) — init Electrobun in browser
- [electrobun-webview-tag](./apis/browser/electrobun-webview-tag.md) — custom webview element
- [draggable-regions](./apis/browser/draggable-regions.md) — make HTML draggable
- [global-properties](./apis/browser/global-properties.md) — browser global properties
- [electrobun-wgpu-tag](./apis/browser/electrobun-wgpu-tag.md) — embed GPU surfaces

### apis/cli/

- [build-configuration](./apis/cli/build-configuration.md) — electrobun.config options
- [cli-args](./apis/cli/cli-args.md) — command line reference

## Guides

### guides/ (root)

- [quick-start](./guides/quick-start.md) — first app in minutes
- [what-is-electrobun](./guides/what-is-electrobun.md) — framework and benefits
- [hello-world](./guides/hello-world.md) — build first app step by step
- [creating-ui](./guides/creating-ui.md) — build user interfaces
- [bundling-and-distribution](./guides/bundling-and-distribution.md) — package and distribute
- [cross-platform-development](./guides/cross-platform-development.md) — macOS, Windows, Linux
- [compatability](./guides/compatability.md) — platform requirements
- [code-signing](./guides/code-signing.md) — sign and notarize
- [updates](./guides/updates.md) — update system, binary patches

### guides/architecture/

- [overview](./guides/architecture/overview.md) — Electrobun architecture
- [webview-tag](./guides/architecture/webview-tag.md) — how webviews work

---

Source: <https://github.com/blackboardsh/electrobun> · fetched 2026-05-24 · excludes changelog.
