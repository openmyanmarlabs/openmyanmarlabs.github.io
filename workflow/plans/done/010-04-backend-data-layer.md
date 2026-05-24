# 010-04 — Backend data layer + image-pipeline RPC

Plan: `010-root-open-myanmar-invoice.md` · Blocked by: 02 · Parallel-safe with: 03

## Goal

The whole main-process data layer: repositories → services → transport-free RPC handlers for company, clients, products, invoices (incl. numbering + snapshots), plus the image-on-disk pipeline (`saveImage`/`getImage`). Units TDD'd; handlers shaped for the L1 e2e gate (phase 10).

## Context

- **TDD the repos + services** — read `.claude/skills/tdd/SKILL.md`: in-memory `bun:sqlite` + DI, co-located `*.test.ts`, `bun test`. **Do NOT import `src/bun/db/migrate.ts` in tests** (boots Electrobun runtime) — create tables from the schema directly or a test helper.
- **Handlers must be transport-free for e2e** — read `.claude/skills/backend-e2e/SKILL.md`. Pattern: pure `create<Feature>Handlers(service)` returning a plain map (no `electrobun/bun` import), + register them in the thin `src/bun/rpc/app-rpc.ts` wrapper. Mirror the template's existing `createAuthHandlers`-style seam (now removed, but the shape is the reference) + `update-handlers.ts`.
- DI composition point: `src/bun/index.ts` (`createXRepository(db)` → `createXService(repo)` → `createXHandlers(service)` → spread into `createAppRpc`).
- RPC contract: extend `src/shared/types.ts` `AppRPC.bun.requests` with the new requests; add renderer wrappers in `src/lib/rpc.ts` (+ optional per-feature `*-api.ts`). **This phase owns the RPC contract build-out** so UI phases (05/06/07) only append their thin call sites.
- Schema rows + types from phase 02. `Utils.paths.userData`, `Utils.paths` from `electrobun/bun`; startup dir creation goes in `src/bun/index.ts` (template already `mkdirSync`s userData + backups — add `images/`).
- **Snapshots:** invoice create/update copies the current `company` row → `company_snapshot` JSON and the chosen client → `client_snapshot` JSON (+ set nullable `client_id`). Items/taxes written to child tables (cascade). Editing a client/company later must not touch saved invoices (snapshot guarantees this — cover with a test).
- **Numbering:** service computes next `invoice_no` = `<company.invoice_prefix>-<(max numeric suffix)+1>` zero-padded; returned to the builder as a suggestion (user may override). Handle empty table (start at 1) + non-conforming existing numbers gracefully.
- **Image pipeline (RPC):**
  - `saveImage({ bytes, ext })` → `Bun.write(join(Utils.paths.userData, "images", \`${nanoid()}.${ext}\`), bytes)`→ return the **relative** path (e.g.`images/<id>.<ext>`); store that string in SQLite, never bytes. (`bun add nanoid`.)
  - `getImage({ path })` → resolve under userData → `Bun.file(abs).arrayBuffer()` → return bytes; validate the path stays inside `userData/images` (no traversal).
  - Renderer side (thin helper, e.g. `src/lib/images.ts`): `getImage` → `URL.createObjectURL(new Blob([bytes]))`; revoke on unmount. KB flags large-blob RPC overhead — fine for logos/photos; note for verify.

## Steps

- [ ] Repos (TDD): `company-repository` (get/upsert singleton), `client-repository` (CRUD + search + paginated list), `product-repository` (CRUD + search + paginated list), `invoice-repository` (create with items/taxes, list rows via single SELECT, get full detail, update, delete-cascade, max-invoice-no query, totals/counts for dashboard).
- [ ] Services (TDD): wrap repos; `invoice-service` owns numbering + snapshot assembly + persisting items/taxes atomically; `company-service`; `client-service`; `product-service`.
- [ ] Handlers (transport-free maps): `create{Company,Client,Product,Invoice,Image}Handlers(...)`; image handlers do `Bun.write`/`Bun.file` + path-safety check.
- [ ] Extend `src/shared/types.ts` `AppRPC` with all requests; wire renderer callers in `src/lib/rpc.ts` (+ per-feature api files if cleaner).
- [ ] DI in `src/bun/index.ts`; `mkdirSync(userData/images, {recursive:true})` at startup.
- [ ] Tests: snapshot immutability (edit client → old invoice detail unchanged); numbering (empty table, increment, override-safe, non-conforming existing); cascade delete (deleting invoice removes its items/taxes); image path-traversal rejected.

## Done when

- `bun test` green for all repos + services + handler logic; snapshot-immutability + numbering + cascade tests pass.
- All RPC requests defined in `AppRPC` and callable from the renderer (typecheck clean end-to-end).
- `userData/images/` created at startup; `saveImage` returns a relative path, `getImage` round-trips bytes; traversal blocked.
- Handlers are transport-free maps ready for the phase-10 L1 e2e suite.

## Touches

- `src/bun/repositories/{company,client,product,invoice}-repository.ts` (+ `.test.ts`).
- `src/bun/services/{company,client,product,invoice}-service.ts` (+ `.test.ts`).
- `src/bun/rpc/{company,client,product,invoice,image}-handlers.ts`, `app-rpc.ts`.
- `src/bun/index.ts` — DI + images dir.
- `src/shared/types.ts`, `src/lib/rpc.ts`, `src/lib/images.ts` (+ feature `*-api.ts`).
- `package.json` — `nanoid`.
