> Source: https://github.com/blackboardsh/electrobun/blob/main/docs/src/content/docs/electrobun/guides/what-is-electrobun.mdx · fetched 2026-05-24

# What is Electrobun?

Desktop app framework. Build ultra-fast, tiny, cross-platform apps in TypeScript. Native performance + web dev simplicity.

## The Problem

Traditional frameworks force a DX-vs-performance tradeoff:

- **Electron:** great DX but huge bundles (150MB+), slow startup (2-5s), massive update downloads.
- **Native:** great perf but complex setup, platform-specific code, limited web integration.
- **Tauri:** better than Electron but still large updates + must learn Rust.

## The Solution

- **Ultra-small bundles:** ~14MB compressed (90%+ smaller than Electron).
- **Fast startup:** <50ms cold start vs 2-5s Electron.
- **Tiny updates:** 14KB patches via custom binary diff vs 100MB+ Electron.
- **Pure TypeScript:** main process + UI.
- **Web technologies:** HTML/CSS/JS, any frontend framework.
- **Native performance:** Zig bindings + Bun runtime.
- **Optional CEF:** bundle CEF (Chromium) when cross-platform consistency matters most.

## Performance Comparison

| Metric       | Electron  | Tauri   | Electrobun |
| ------------ | --------- | ------- | ---------- |
| Bundle Size  | 150MB+    | 25MB    | 14MB       |
| Update Size  | 100MB+    | 10MB    | 14KB       |
| Startup Time | 2-5s      | 500ms   | <50ms      |
| Memory Usage | 100-200MB | 30-50MB | 15-30MB    |

## Technical Architecture

- **Zig & native bindings:** native features (windows, system trays, app menus) written in C++ and Objc.
- **Bun runtime:** main process on Bun — fast TS execution + built-in bundling, no Node.js/V8 overhead.
- **System WebView:** by default uses OS native WebView (WebKit macOS, Edge WebView2 Windows, WebKitGTK Linux) instead of distributing Chromium.
- **Custom update system:** binary diff via SIMD-optimized BSDIFF in Zig — patches in kilobytes.
- **ZSTD self-extracting distributables:** CLI bundles app, compresses for smallest initial download.
- **Custom OOPIF:** "super iframes" in HTML for secure, isolated webviews across engines/platforms.

## Key Benefits

### Faster Development

- Fast builds — CLI uses pre-built binaries for target platform.
- Any web framework (React, SolidJS, Vue, Svelte, etc.).
- TypeScript throughout — no context switching.
- Built-in bundling and optimization.

### Better Distribution

- 14MB bundles vs 150MB+ Electron.
- Kilobyte updates vs megabyte downloads.
- Built-in code signing and notarization.
- Cross-platform builds from any OS.
- Built-in ZSTD self-extractor.

### Superior Performance

- Sub-50ms startup.
- Minimal memory footprint.
- Native-feeling responsiveness.
- Battery-efficient.

### Security First

- Process isolation by default.
- Secure, encrypted, typed RPC between processes.
- Custom `views://` schema for loading bundled assets in webviews.
- Minimal attack surface.

## When to Use Electrobun

- **Startup MVPs:** ship fast, small updates.
- **Developer tools:** IDEs, terminals, productivity apps needing native perf.
- **Cross-platform apps:** one codebase, native feel.
- **High-performance apps:** Electron too slow, native too complex.
- **Bandwidth-conscious apps:** frequent updates without friction.
- **Multi-tab browsers:** mix CEF and WebKit webviews.

## Getting Started

Follow the Hello World guide to create a project.
