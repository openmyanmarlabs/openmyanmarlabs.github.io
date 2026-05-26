# Plan 023 — Open Myanmar Content v1

Source: `workflow/specs/open-myanmar-content/2026-05-26-v1.md`

## Summary

Build the v1 of `apps/open-myanmar-content`: an offline, bilingual desktop app (macOS + Windows) where Burmese SMEs generate FB/IG captions via a local Ollama text sidecar, render brand-styled image posters from 20+ templates (native-rasterize, mirrors invoice app), and optionally generate decorative backgrounds via a local stable-diffusion.cpp sidecar. Starts by cloning `apps/electrobun-template`, ripping out the auth feature wholesale, then layering content domain on top (schema → brand/UI shell → AI sidecars → templates+caption → image library → posters → history → e2e+sign+release).

## Phases

| #   | Phase                                            | File                                               | Blocked by | Parallel-safe with |
| --- | ------------------------------------------------ | -------------------------------------------------- | ---------- | ------------------ |
| 01  | Foundation: clone + wipe auth + rename           | `plans/todo/023-01-foundation-clone-wipe-auth.md`  | —          | —                  |
| 02  | Domain schema + repositories (TDD)               | `plans/todo/023-02-schema-repositories.md`         | 01         | —                  |
| 03  | i18n my-default + brand profile + settings shell | `plans/todo/023-03-i18n-brand-settings.md`         | 02         | 04, 06             |
| 04  | Ollama sidecar + model picker                    | `plans/todo/023-04-ollama-sidecar.md`              | 02         | 03, 06             |
| 05  | Templates + caption generator + custom CRUD      | `plans/todo/023-05-templates-caption-generator.md` | 02, 04     | 06, 07             |
| 06  | Image library: import + browse + crop            | `plans/todo/023-06-image-library.md`               | 02         | 03, 04, 05, 07     |
| 07  | stable-diffusion.cpp sidecar + AI image gen      | `plans/todo/023-07-sd-sidecar-image-gen.md`        | 04, 06     | 05                 |
| 08  | Brand posters: 20+ templates + native-rasterize  | `plans/todo/023-08-brand-posters.md`               | 03, 05, 06 | 07                 |
| 09  | Post history page                                | `plans/todo/023-09-post-history.md`                | 05, 08     | —                  |
| 10  | Backend-e2e gate + sign + release                | `plans/todo/023-10-e2e-sign-release.md`            | 01–09      | —                  |

Critical path: 01 → 02 → 04 → 05 → 08 → 09 → 10 (the longest dependency chain). Wave 3 fans 03/04/06 out together; wave 4 runs 05/07 in parallel.

## Notes / risks

- **Scope warning.** v1 as written is a multi-month build. Two sidecars (Ollama + stable-diffusion.cpp), two platforms (mac+win), code-signing on both, 20+ poster designs, an image library, a brand system, and a history page — all gated by a single release. Do not start this without scoping conviction; deferring SD image gen and/or trimming posters to 6–8 would compress weeks of work.
- **Open spec questions still unresolved** (lifted from the spec; surface again before each becomes load-bearing):
  - Who authors the 12 monthly festival prompt scaffolds? Phase 05 will block if no source.
  - Pyidaungsu / Padauk redistributable in installer? Phase 03 picks fonts; Phase 10 ships them.
  - **20+ poster designs — are mockups drafted or is design work in v1?** If design is in scope, Phase 08 is the schedule risk pivot point.
  - Landing-site `versions.json` URL for `open-myanmar-content` (Phase 01 stub + Phase 10 wire).
  - Ollama registry reachable from Myanmar — test before release (Phase 10).
  - SD.cpp Windows CUDA-vs-CPU detection — needs prototype (Phase 07).
  - Content guardrails for politically sensitive Myanmar topics (Phase 05 + Phase 10 sanity check).
- **Sidecar lifecycle.** Mirrors `apps/open-myanmar-speech` exactly — register `kill()` on Electrobun `before-quit` plus a sync `process.on("exit")` fallback (Linux/system-quit doesn't fire `before-quit`). Phase 04 sets the pattern; Phase 07 reuses it.
- **Poster rendering.** Mirrors `apps/open-myanmar-invoice` — bytes produced in the renderer via `html-to-image`, written to disk via a transport-free `create<Feature>Handlers` map (`src/bun/rpc/export-handlers.ts` precedent). Phase 08 follows that seam.
- **Tailwind v4 brand theming.** Posters override `--color-primary` / `--color-secondary` on a wrapper element at runtime; `@theme` declares the tokens; `bg-primary/20` works because `--alpha()` resolves at browser time. See `workflow/learning/tailwind/apis/theme.md` + `apis/directives-and-functions.md`. Phase 08 cites these.
- **Manual GUI verify is unautomatable.** The clean-install acceptance walk (relaunch persistence, no-FOUC, fonts on Windows, real FB paste) is recorded as Phase 10's manual `verify`-skill step — not something the executor can claim green via `bun test`.
- **Foundation is destructive in `src/bun/db/schema.ts`.** Auth tables (users, sessions) and migrations leave once. The seed db / migrate script must compile clean after the rip — verified by Phase 01's gate before Phase 02 lands new tables.
- **Existing `apps/open-myanmar-content/` directory is empty.** Phase 01 populates it; no merge-with-existing logic needed.
- **Plan id stub `versions.json` entry already exists** for `open-myanmar-content` in the landing site (`landing/data/apps.ts` referenced in memory note). Phase 10 confirms; Phase 01 only needs a placeholder `0.0.1` record on the updates registry.
