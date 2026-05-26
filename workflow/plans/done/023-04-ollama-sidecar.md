# 023-04 — Ollama sidecar + model picker

Plan: `023-root-open-myanmar-content-v1.md` · Blocked by: 02 · Parallel-safe with: 03, 06

## Goal

Bundle platform-specific Ollama binaries inside the installer, spawn `ollama serve` as a lifecycle-managed sidecar (start with app, kill on quit + on `process.exit`), expose a typed HTTP client to the rest of the app, and ship a first-launch model picker (RAM-aware default) plus a Settings "AI Models" section to download/delete/switch models.

## Context

- **Sidecar pattern reference**: `apps/open-myanmar-speech/src/bun/tts/omnivoice/sidecar.ts` + how its lifecycle is registered in `apps/open-myanmar-speech/src/bun/index.ts` (`Electrobun.events.on("before-quit", …)` async kill + `process.on("exit", …)` sync fallback). Critical: Linux/system-quit doesn't fire `before-quit` — both hooks must exist.
- Ollama is an HTTP daemon (unlike OmniVoice which is a Python JSON-Lines worker). Default port `11434`. Override with `OLLAMA_HOST=127.0.0.1:11434` env var. The HTTP client lives in `src/bun/llm/ollama-client.ts` and talks to that base URL with `fetch`.
- Binary bundling:
  - `resources/ollama/darwin-arm64/ollama` (Mach-O), `resources/ollama/win32-x64/ollama.exe`.
  - Add a `scripts/fetch-ollama.ts` that downloads the official release tarball per platform on first build (or postinstall) into `resources/ollama/<plat-arch>/`; cache by version. Do NOT commit the binaries (>100MB); add to `.gitignore`. CI / release build must run the fetch script.
  - `scripts/post-build.ts` already exists (template) — extend it to copy the right platform's binary into the Electrobun bundle's `Resources/app/ollama/`. Mirror how the speech app's `post-build.ts` copies its `resources/omnivoice/` into the bundle.
  - At runtime, resolve the binary path via the same dev/prod pattern as `resolveOmniVoiceResourceDir` (DEV: walk up to `resources/ollama/<plat-arch>/`; PROD: `PATHS.RESOURCES_FOLDER/app/ollama/<binary>`).
- RAM detection: `os.totalmem()` → bytes → GB. Suggestion rule (pure function): `suggestDefaultModel(totalGb)`: `>=8 → "qwen2.5:7b"`, `<8 → "gemma3:4b"`. Pure → unit-test.
- Model storage: Ollama stores models under `~/.ollama/models` by default. Override with `OLLAMA_MODELS=<userData>/ollama-models` env var passed to the child so models live under app data dir (clean uninstall, isolated from any system Ollama install). Same env-injection pattern as omnivoice sidecar.
- Model download progress: Ollama's `/api/pull` endpoint streams JSON-Lines with `{status, completed, total}` per chunk. The HTTP client must expose an async iterator (or callback) so the renderer can show a progress bar. Mirror the streaming idiom from omnivoice's stdout pump (JSON-Lines reader).
- Generation API: `/api/chat` (preferred over `/api/generate` — supports system/user messages directly). Request: `{ model, messages, stream: false, options: { temperature, num_predict } }`. Response: `{ message: { content } }`. Phase 05 will own the prompt construction; this phase just exposes a typed `chat({ model, system, user, options })` method that returns the assistant text.
- Health probe: `GET /api/tags` returns installed models. Used by the sidecar manager to confirm readiness (poll with backoff after spawn until 200 or timeout 30s).
- **Transport-free seam**: `createOllamaSidecar(deps)` returns `{ start(), kill(), isRunning(), client }` where `deps` injects `spawn` + `fetch` + `binaryPath` + `modelsDir`. Pure-ish — process behavior NOT unit-tested but the policy (`suggestDefaultModel`, JSON-Lines parser, model-list parsing) IS. Mirrors speech app's split (sidecar.ts not unit-tested; detect.ts/presets.ts are).
- **TDD scope**:
  - `model-suggestion.ts` + `.test.ts` — pure RAM-based picker.
  - `ollama-client.test.ts` — uses a fake `fetch` to assert request URLs, body shape, JSON-Lines stream parsing, chat response unwrapping.
  - `installed-models-store.test.ts` (zustand) — adds/removes/switches active model, persists via settings repo.
  - Sidecar lifecycle (`createOllamaSidecar`) — NOT unit-tested (real process); covered manually + at Phase 10's e2e gate via spawning a real binary if feasible, else manual.
- Skills to consult in this phase: `.claude/skills/tdd/SKILL.md` for the testable bits.

## Steps

- [ ] Read `.claude/skills/tdd/SKILL.md`; skim `apps/open-myanmar-speech/src/bun/tts/omnivoice/sidecar.ts` + `apps/open-myanmar-speech/src/bun/index.ts` for the lifecycle wiring pattern.
- [ ] Write `scripts/fetch-ollama.ts` — downloads platform binaries to `resources/ollama/<plat-arch>/`. Document in `apps/open-myanmar-content/README.md` (a one-liner — concise).
- [ ] Extend `scripts/post-build.ts` to copy the matching platform binary into the bundle (`Resources/app/ollama/`).
- [ ] Add `resources/ollama/` to `.gitignore`.
- [ ] Pure logic + tests (red→green→refactor):
  - [ ] `src/bun/llm/model-suggestion.ts` + `.test.ts` — `suggestDefaultModel(totalGb): ModelId`.
  - [ ] `src/bun/llm/ollama-client.ts` + `.test.ts` — `createOllamaClient({ fetch, baseUrl })` exposes `listModels()`, `pullModel(name, onProgress)`, `deleteModel(name)`, `chat({ model, system, user, options })`. Tests use a fake `fetch` returning canned streams.
- [ ] `src/bun/llm/ollama-sidecar.ts` — `createOllamaSidecar({ binaryPath, modelsDir, host, spawn, fetch })` → `{ start(), kill(), isRunning(), client }`. NOT unit-tested.
- [ ] `src/bun/llm/resolve-ollama-binary.ts` — dev/prod path resolver mirroring `resolveOmniVoiceResourceDir`.
- [ ] Wire into `src/bun/index.ts`:
  - Resolve binary, set `OLLAMA_MODELS` to `<userData>/ollama-models`, call `createOllamaSidecar`.
  - `await sidecar.start()`.
  - Register `Electrobun.events.on("before-quit", () => sidecar.kill())` and `process.on("exit", () => sidecar.kill())`.
- [ ] RPC handler map `src/bun/rpc/llm-handlers.ts` (transport-free, deps inject `client`) exposing:
  - `listModels()`
  - `pullModel({ name })` — kicks off the pull, returns an event stream id (or use Electrobun events for progress emission — read invoice app for streaming RPC precedent; if none, use polling: `pullProgress({ id })`).
  - `deleteModel({ name })`
  - `setActiveModel({ name })` — writes to settings repo.
  - `getActiveModel()`
  - `getRamSuggestion()` — uses `os.totalmem()` + `suggestDefaultModel`.
  - Paired `.test.ts` with fake client + fake settings repo.
- [ ] Bind in `src/bun/rpc/app-rpc.ts`.
- [ ] First-launch model picker UI: `src/features/onboarding/components/model-picker.tsx` — shown when `first_run_completed !== true` AND brand wizard already done (or stacked after wizard — pick: stacked, model picker is its own page after wizard finishes). Picker displays RAM-based recommendation (highlighted) plus the other option, plus "Skip — I'll set up later" (manual-mode path per spec).
- [ ] Settings "AI Models" section: `src/features/settings/components/models-section.tsx` — list installed, download progress bars, delete, radio for active.
- [ ] Wire `models-section.tsx` into the existing Settings page slot from Phase 03.
- [ ] Manual verify: dev launch → after brand wizard see model picker → pick small model → download progress visible → finish → Settings → AI Models shows installed model → switch active works → quit app → confirm Ollama process is gone (`pgrep ollama` returns nothing on mac; Task Manager check on win).

## Done when

- `bun test` green; new behaviors covered by tests for model-suggestion, ollama-client, llm-handlers, installed-models-store.
- Dev launch starts Ollama, `curl http://localhost:11434/api/tags` returns 200 from the bun process side.
- Killing the Electrobun app stops the Ollama process (mac + win).
- Settings page can install + delete + switch models.
- First-run picker shows the RAM-appropriate default and lets user skip into manual mode.
- `OLLAMA_MODELS` env points the daemon at `<userData>/ollama-models` — verified by inspecting the dir after pulling a model.
- macOS + Windows builds bundle their respective binaries via `post-build.ts` (verified by inspecting the produced `.app` / installer in Phase 10 — for this phase, dev build verified).

## Touches

- `apps/open-myanmar-content/scripts/fetch-ollama.ts` — new.
- `apps/open-myanmar-content/scripts/post-build.ts` — extend.
- `apps/open-myanmar-content/.gitignore` — `resources/ollama/`.
- `apps/open-myanmar-content/src/bun/llm/model-suggestion.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/llm/ollama-client.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/llm/ollama-sidecar.ts` — new.
- `apps/open-myanmar-content/src/bun/llm/resolve-ollama-binary.ts` — new.
- `apps/open-myanmar-content/src/bun/index.ts` — wire sidecar lifecycle.
- `apps/open-myanmar-content/src/bun/rpc/llm-handlers.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/rpc/app-rpc.ts` — bind llm handlers.
- `apps/open-myanmar-content/src/features/onboarding/components/model-picker.tsx` — new.
- `apps/open-myanmar-content/src/features/onboarding/stores/onboarding-store.ts` — track first-run progression (wizard done, model picker done).
- `apps/open-myanmar-content/src/features/settings/components/models-section.tsx` — new.
- `apps/open-myanmar-content/src/features/settings/stores/installed-models-store.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/features/settings/pages/settings-page.tsx` — mount models section.
- `apps/open-myanmar-content/src/components/layout/app-layout.tsx` — extend onboarding gate to include model picker step.
- `apps/open-myanmar-content/src/lib/i18n/content.ts` — keys for model picker + settings AI Models section.
- `apps/open-myanmar-content/README.md` — one-line note about `bun run fetch-ollama` (dev setup).
