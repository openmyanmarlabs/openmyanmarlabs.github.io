# 023-07 — stable-diffusion.cpp sidecar + AI image generation

Plan: `023-root-open-myanmar-content-v1.md` · Blocked by: 04, 06 · Parallel-safe with: 05

## Goal

Bundle stable-diffusion.cpp; opt-in SD-1.5 GGUF model download; detect Burmese prompts, translate via Ollama, user-confirm EN, spawn `sd` subprocess per call; save PNG into image library tagged `ai-generated`.

## Context

- Reference patterns:
  - `apps/open-myanmar-speech/src/bun/tts/omnivoice/setup.ts` — model download + extract + verify lifecycle (mirror for SD model download).
  - `apps/open-myanmar-speech/src/bun/tts/omnivoice/sidecar.ts` — subprocess wrap. SD is **per-invocation**, not long-lived → no JSON-Lines protocol; spawn, capture stdout/stderr, read PNG file on exit 0.
- `sd` CLI shape: `sd -m models/sd-v1-5.gguf -p "<prompt>" -o /tmp/out.png --steps 20 --cfg-scale 7 --sampling-method euler_a -W 512 -H 512`. Windows: CUDA binary vs CPU binary (pick at runtime; CPU may also take `-t <threads>`).
- Binary bundling:
  - `resources/sd/darwin-arm64/sd` (Metal), `resources/sd/win32-x64-cuda/sd.exe`, `resources/sd/win32-x64-cpu/sd.exe`.
  - `scripts/fetch-sd.ts` downloads from upstream releases (NOT committed).
  - `.gitignore` adds `resources/sd/`.
  - `scripts/post-build.ts` copies platform-correct set into `Resources/app/sd/`.
- Model download: `models/sd-v1-5-q4.gguf` (~2GB) via HTTP from HF mirror; streamed w/ progress; sha256 verify; stored under `<userData>/sd-models/`. NOT auto on launch — only on first SD use (user opt-in).
- Burmese detection: tiny pure helper `containsBurmese(text)` — match U+1000–U+109F (check `apps/open-myanmar-speech/src/bun/lib/chunk-text.ts` for existing range helper before duplicating).
- Translation: when Burmese detected, call Phase 04's `ollamaClient.chat` w/ system prompt:
  `"Translate the user's Myanmar/Burmese image-generation prompt into concise English suitable for Stable Diffusion. Output ONLY the English prompt, no preface."`
  Translated text → editable input → only after user clicks Generate, pass EN to `sd`.
- Output handling: subprocess writes PNG to `<userData>/sd-tmp/<uuid>.png`. On exit 0 → `Bun.file(path).bytes()` → `imageService.import({ filename, bytes, source: 'ai-generated', tags: ['ai-generated'] })` (Phase 06) → delete temp. Non-zero → capture stderr + typed error.
- Manual-mode (no text model installed, Phase 04): Burmese prompts can't translate → explicit inline error "Install a text model to translate Burmese prompts". EN prompts still work.
- UI: lives inside Image library page (Phase 06). "+ AI Generate" button opens modal: prompt textarea → "Translate" (shown only if Burmese) → editable EN field → "Generate Image" (disabled until EN confirmed) → progress / log tail → preview → auto-save to library.
- TDD per `.claude/skills/tdd/SKILL.md`:
  - Pure / DI-tested: `contains-burmese`, `sd-args`, `translate-prompt`, `sd-service`, `sd-handlers`.
  - Not unit-tested (real fs/network): `sd-runner`, `resolve-sd-binary`, `sd-model-setup` — manual verify.

## Steps

- [ ] Read `.claude/skills/tdd/SKILL.md`.
- [ ] `scripts/fetch-sd.ts` — platform binary downloader; add `resources/sd/` to `.gitignore`.
- [ ] Extend `scripts/post-build.ts` — copy SD binaries into bundle by platform.
- [ ] TDD `src/bun/lib/contains-burmese.ts` (+ `.test.ts`) — pure; U+1000–U+109F.
- [ ] TDD `src/bun/sd/sd-args.ts` (+ `.test.ts`) — pure CLI arg builder for `sd` (prompt, w, h, steps, cfg, sampler, seed, output path, model path).
- [ ] `src/bun/sd/sd-runner.ts` — `createSdRunner({ binaryPath, spawn })` async `run(args): { pngPath }`. Spawn, await exit, capture stderr. NOT unit-tested.
- [ ] `src/bun/sd/resolve-sd-binary.ts` — dev vs prod path resolver; on win32 pick CUDA vs CPU (probe `nvidia-smi` or `sd --version`).
- [ ] `src/bun/sd/sd-model-setup.ts` — `downloadSdModel({ destDir, onProgress, fetch })` mirroring omnivoice `setup.ts` (stream + sha256 verify). NOT unit-tested; manual verify.
- [ ] TDD `src/bun/services/translate-prompt.ts` (+ `.test.ts`) — `translateBurmeseToEnglish({ client, text })` builds chat messages w/ canonical system prompt; returns trimmed content.
- [ ] TDD `src/bun/services/sd-service.ts` (+ `.test.ts`) — `createSdService({ runner, imageService, tmpDir, fs })` `generate({ prompt, width, height, seed? })` → arg build → runner → read PNG → `imageService.import` → returns image row. Fake runner + imageService.
- [ ] TDD `src/bun/rpc/sd-handlers.ts` (+ `.test.ts`) — `detectLanguage`, `translatePrompt`, `generateImage`, `getSdModelStatus`, `downloadSdModel` (polling token). Pure handler factory `createSdHandlers(deps)` per backend-e2e seam.
- [ ] Bind in `src/bun/rpc/app-rpc.ts`; wire SD runner + service in `src/bun/index.ts`.
- [ ] UI: `src/features/images/components/ai-generate-modal.tsx` — prompt textarea, translate flow, EN confirm, generate progress, preview.
- [ ] UI: add "+ AI Generate" button on images page (Phase 06).
- [ ] Settings → AI Models: add SD model row (status + download / delete).
- [ ] i18n keys: prompt-language hints, translate button label, "Install a text model first" error.
- [ ] Manual verify (mac M3): opt-in download (~10min for 2GB) → Burmese prompt → translate → confirm EN → generate ≤10s → library entry tagged `ai-generated`.
- [ ] Manual verify (win-CUDA + win-CPU): CPU path ≤60s acceptable.
- [ ] `bun test` green; `tsc --noEmit` green.

## Done when

- `sd` subprocess produces PNG from prompt; saved into image library w/ `source='ai-generated'`.
- Burmese detected → translated → user confirms EN → generated.
- SD model opt-in download shows progress; stored `<userData>/sd-models/`.
- Settings → AI Models shows SD installed/not.
- Manual-mode + Burmese prompt → clear inline "Install a text model first" error.
- `bun test` green for: `contains-burmese`, `sd-args`, `translate-prompt`, `sd-service`, `sd-handlers`.
- `tsc --noEmit` green.

## Touches

- `apps/open-myanmar-content/scripts/fetch-sd.ts` — new.
- `apps/open-myanmar-content/scripts/post-build.ts` — extend (copy SD binaries).
- `apps/open-myanmar-content/.gitignore` — add `resources/sd/`.
- `apps/open-myanmar-content/src/bun/lib/contains-burmese.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/sd/sd-args.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/sd/sd-runner.ts` — new (no test).
- `apps/open-myanmar-content/src/bun/sd/resolve-sd-binary.ts` — new (no test).
- `apps/open-myanmar-content/src/bun/sd/sd-model-setup.ts` — new (no test).
- `apps/open-myanmar-content/src/bun/services/translate-prompt.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/services/sd-service.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/rpc/sd-handlers.ts` + `.test.ts` — new.
- `apps/open-myanmar-content/src/bun/rpc/app-rpc.ts` — bind SD handlers.
- `apps/open-myanmar-content/src/bun/index.ts` — wire runner + service.
- `apps/open-myanmar-content/src/features/images/components/ai-generate-modal.tsx` — new.
- `apps/open-myanmar-content/src/features/images/pages/images-page.tsx` — add "+ AI Generate" button.
- `apps/open-myanmar-content/src/features/settings/components/models-section.tsx` — SD model row.
- `apps/open-myanmar-content/src/lib/i18n/content.ts` — extend keys.
