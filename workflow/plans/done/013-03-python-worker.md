# 013-03 — Python MLX worker + preset clip

Plan: `013-root-qwen3-tts-engine.md` · Blocked by: — · Parallel-safe with: 01, 02, 05

## Goal

Write the MLX Python synthesis worker for Qwen3-TTS and copy the bootstrap voice-preset clip into `resources/qwen3-tts/`.

## Context

- **Mirror pattern:** `resources/omnivoice/worker.py` — long-lived Python process, JSON-Lines over stdio. Loads model once on first request; prints ready banner after load. Per request: read one JSON line from stdin, write WAV to `outPath`, reply one JSON line to stdout.
- **Ready banner:** `{"type":"ready","ok":true,"sampleRate":24000}` — printed after model is loaded.
- **Request fields:** `id`, `text`, `refClip`, `refText`, `speed`, `instruction`, `outPath`.
- **Reply (ok):** `{"id":"...","ok":true,"outPath":"...","sampleRate":24000}`.
- **Reply (error):** `{"id":"...","ok":false,"error":"..."}`.
- **Synthesis package:** `mlx-audio` (not the `omnivoice` PyPI package). Expected API shape:
  ```python
  from mlx_audio.tts.generate import generate
  generate(
      model="Qwen/Qwen3-TTS-12Hz-0.6B-Base",
      text=...,
      ref_audio=...,
      ref_text=...,
      speed=...,
      output=outPath,
      # instruction kwarg: check mlx-audio source at implementation time
      # (may be "prompt" or "instruction" — add a comment with the confirmed kwarg name)
  )
  ```
- **`instruction` handling:** pass to `generate` when non-empty; omit the kwarg entirely when empty string. Check mlx-audio source/docs for the exact kwarg name at implementation time and leave a `# confirmed: kwarg=<name>` comment.
- **Preset clip source:** `resources/omnivoice/presets/male-clear-natural.wav` + `.txt` — copy to `resources/qwen3-tts/presets/`. Bootstrap only; can swap later without touching other phases.
- **Bundle pickup:** `scripts/post-build.ts` copies all of `resources/` into the bundle — no changes needed. The new `resources/qwen3-tts/` dir is picked up automatically.
- **Standalone manual test (L3):** requires `mlx-audio` installed in a local Python env. Not automated.

## Steps

- [ ] Create `resources/qwen3-tts/presets/` directory.
- [ ] Copy `resources/omnivoice/presets/male-clear-natural.wav` → `resources/qwen3-tts/presets/male-clear-natural.wav`.
- [ ] Copy `resources/omnivoice/presets/male-clear-natural.txt` → `resources/qwen3-tts/presets/male-clear-natural.txt`.
- [ ] Write `resources/qwen3-tts/worker.py`:
  - Reads JSON lines from stdin in a loop.
  - Loads model lazily on first request (singleton); prints ready banner after load.
  - Per request: extracts `id`, `text`, `refClip`, `refText`, `speed`, `instruction`, `outPath`.
  - Calls `mlx_audio.tts.generate.generate(...)` — passes `instruction` kwarg only when non-empty (confirm kwarg name against mlx-audio source; add confirming comment).
  - Writes WAV to `outPath`.
  - Replies success or error JSON line to stdout.
  - Wraps synthesis in try/except; replies error JSON on any exception.
- [ ] Manually test standalone: `python resources/qwen3-tts/worker.py` — pipe a test JSON line via stdin, confirm WAV written to `outPath` and correct JSON reply on stdout. (Requires mlx-audio in local env — L3 manual check only.)

## Done when

- `resources/qwen3-tts/presets/male-clear-natural.wav` exists (copied from OmniVoice presets).
- `resources/qwen3-tts/presets/male-clear-natural.txt` exists (copied from OmniVoice presets).
- `resources/qwen3-tts/worker.py` reads JSON-Lines from stdin, synthesizes via mlx-audio, writes WAV to `outPath`, replies JSON-Lines to stdout.
- Worker prints `{"type":"ready","ok":true,"sampleRate":24000}` banner after model load.
- Worker passes `instruction` to generate when non-empty; omits it when empty string.
- Worker replies `{"id":"...","ok":false,"error":"..."}` on any exception (no crash/silent hang).

## Touches

- `resources/qwen3-tts/worker.py` — new MLX synthesis worker.
- `resources/qwen3-tts/presets/male-clear-natural.wav` — new (copied binary asset).
- `resources/qwen3-tts/presets/male-clear-natural.txt` — new (copied asset).
