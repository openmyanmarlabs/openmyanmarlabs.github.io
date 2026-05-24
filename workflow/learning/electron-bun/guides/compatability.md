> Source: https://github.com/blackboardsh/electrobun/blob/main/docs/src/content/docs/electrobun/guides/compatability.mdx · fetched 2026-05-24

# Compatibility

## Dependencies and Versions

| Dependency | Version  | Notes              |
| ---------- | -------- | ------------------ |
| Bun        | 1.3.0    |                    |
| Zig        | 0.13.0   |                    |
| CEF        | 125.0.22 | optionally bundled |

## Platform Support

### Development Platform

- **macOS**: required for building Electrobun apps (Intel + Apple Silicon).
- **Windows**: development support available.
- **Linux**: development support available.

### Target Platforms

| Platform | Architecture          | Status        | Notes                                     |
| -------- | --------------------- | ------------- | ----------------------------------------- |
| macOS    | ARM64 (Apple Silicon) | Stable        | Full support with system WebKit           |
| macOS    | x64 (Intel)           | Stable        | Full support with system WebKit           |
| Windows  | x64                   | Stable        | WebView2 (Edge) or bundled CEF            |
| Windows  | ARM64                 | Via Emulation | Runs x64 binary through Windows emulation |
| Linux    | x64                   | Stable        | WebKitGTK or bundled CEF                  |
| Linux    | ARM64                 | Stable        | WebKitGTK or bundled CEF                  |

### Webview Engines

System webviews and bundled engines:

| Platform | System Webview     | Bundled Option            |
| -------- | ------------------ | ------------------------- |
| macOS    | WebKit (WKWebView) | CEF (Chromium) - Optional |
| Windows  | WebView2 (Edge)    | CEF (Chromium) - Optional |
| Linux    | WebKitGTK          | CEF (Chromium) - Optional |
