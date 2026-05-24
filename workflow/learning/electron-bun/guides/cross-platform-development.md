> Source: https://github.com/blackboardsh/electrobun/blob/main/docs/src/content/docs/electrobun/guides/cross-platform-development.mdx · fetched 2026-05-24

# Cross-Platform Development

Build desktop apps for macOS, Windows, Linux from one codebase. Platform-specific considerations + best practices.

## Platform-Specific Issues

### Window Management

Some window options (e.g. frameless windows) work differently per OS.

### Webview Behavior

Webview hiding + passthrough vary by platform:

- **macOS**: hidden and passthrough are independent settings.
- **Windows & Linux**: setting hidden also auto-enables passthrough. No separate passthrough setting — clicks pass through hidden webviews to underlying content.

```
// Hide a webview (behavior differs by platform)
webviewSetHidden(webviewId, true);

// On macOS: webview is hidden but still intercepts clicks (unless passthrough is also enabled)
// On Windows/Linux: webview is hidden AND clicks pass through automatically

// Enable click passthrough (macOS only - no effect on Windows/Linux)
webviewSetPassthrough(webviewId, true);
```

### Linux

By default Linux uses GTK windows + GTKWebkit webviews — closest to a "system" webview managed/updated by the OS. Some distros lack it by default, so end users may need to install those deps.

GTK/GTKWebkit have severe limitations — can't handle Electrobun's advanced webview layering/masking.

Strongly recommend bundling CEF (set `bundleCEF: true` in `electrobun.config.ts`) for Linux distribution. Open `new BrowserWindow()`s and `<electrobun-webview>`s with `renderer="cef"` (pure x11 windows).

## Building for Multiple Platforms

Electrobun builds for the current host platform. For all platforms, use CI (e.g. GitHub Actions) with a runner per OS/arch. GitHub Actions provides free CI runners for open-source projects covering all supported platforms.

```
# On each CI runner, just run:
electrobun build --env=stable
```

Electrobun's [GitHub repo](https://github.com/blackboardsh/electrobun) includes a release workflow that builds natively per platform via a build matrix — recommended: each build runs on its native OS, avoiding cross-compilation and ensuring platform tools (code signing, icon utils) work.

### Architecture Considerations

| Platform | Architectures | Notes                        |
| -------- | ------------- | ---------------------------- |
| macOS    | x64, ARM64    | Universal binaries supported |
| Windows  | x64           | ARM64 runs via emulation     |
| Linux    | x64, ARM64    | Native support for both      |

## Windows Console Output

On Windows, apps build as GUI apps (Windows subsystem) so no console window appears for end users. Dev builds auto-attach to the parent console so you see `console.log`/debug in your terminal.

To inspect console output from a **canary**/**stable** build (e.g. debug a prod-only issue), set `ELECTROBUN_CONSOLE`:

```
# Launch a canary/stable build with console output visible
set ELECTROBUN_CONSOLE=1
.\MyApp.exe
```

With `ELECTROBUN_CONSOLE=1`, the launcher attaches to the parent console and inherits stdout/stderr like a dev build. No effect on macOS/Linux (console always available there).
