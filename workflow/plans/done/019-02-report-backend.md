# 019-02 — Report backend data layer

Plan: `019-root-report-page.md` · Blocked by: — · Parallel-safe with: 01, 03

## Goal

Add the bun-side surface the report page needs: a `reportInvoices` repo query (non-draft
in range), two pure service functions (`buildReportStats`, `toExportRow`), the
`reportStats` + `exportInvoices` RPC handlers, a `"json"` kind on the existing
`saveExport` pipeline, and the renderer-side `reportApi` wrappers — all test-covered.

## Context

Pure backend change (plus the renderer RPC wrappers in `lib/rpc.ts`). The stack mirrors
the existing dashboard/export work:
`shared/types.ts` (RPC contract) → `invoice-handlers.ts` (transport-free map) →
`invoice-service.ts` (logic) → `invoice-repository.ts` (Drizzle SQL) → SQLite.
Export IO: `export-handlers.ts` + `export-paths.ts` (pure filename) → `app-rpc.ts` binds
the real Bun IO.

**Patterns to follow (read these first):**

- `invoice-repository.ts` — `dashboardStats()` / `list()` show the Drizzle aggregate +
  `and(gte(...), lte(...))` date-range idiom. Import `inArray` from `drizzle-orm` for the
  status filter. Status ints: **1 Draft / 2 Unpaid / 3 Paid**.
- `invoice-service.ts` — `suggestInvoiceNo()` is the precedent for an **exported pure
  function** tested directly (no DB). Add `buildReportStats` + `toExportRow` the same way.
  Snapshot parsing precedent: `clientNameFromRow` in `features/invoices/lib/invoice-row.ts`
  (try/catch JSON.parse, fall back gracefully). The client snapshot is a serialized
  `ClientRow` → its address field is **`billingAddress`** (map to `clientAddress`).
- `export-handlers.ts` / `export-paths.ts` — `ExportKind` union + `extForKind` +
  `buildExportFilename` (already generic over kind; just widen the type). The handler
  writes raw bytes — JSON rides the same `number[]` byte pipeline (renderer utf-8 encodes
  in phase 05).
- `invoice-handlers.test.ts` — the **L1 backend-e2e** pattern (in-memory db + real
  repo+service+handler map, no wire). `export-handlers.test.ts` — fakes for downloads dir /
  writeFile / reveal.
- TDD: drive these with `bun test`, co-located `*.test.ts`, red→green per behavior.
  Follow `.claude/skills/tdd/SKILL.md`. Tests use **in-memory SQLite** (`createTestDb`) —
  do NOT import `migrate.ts` (it boots the Electrobun runtime). For the assembled-stack
  gate follow `.claude/skills/backend-e2e/SKILL.md`.

**Shapes to define (exact names — consumed by phases 04/05):**

```ts
export type ReportParamsDTO = { fromDate?: number; toDate?: number };
export type ReportMonthlyDTO = { month: string; total: number; paid: number }; // "YYYY-MM"
export type ReportStatsDTO = {
  totalBalance: number; // Σ total_amount, non-draft
  paidAmount: number; // Σ total_amount where status = 3
  invoiceCount: number; // count non-draft
  paidCount: number;
  unpaidCount: number;
  monthly: ReportMonthlyDTO[];
};
export type ExportRowDTO = {
  invoiceNo: string;
  status: "paid" | "unpaid";
  totalAmount: number;
  createdDate: string; // ISO
  dueDate: string | null; // ISO | null
  clientName: string;
  clientEmail: string;
  clientMobile: string;
  clientAddress: string; // from snapshot.billingAddress
};
```

## Steps

- [ ] **`shared/types.ts`** — add `ReportParamsDTO`, `ReportMonthlyDTO`, `ReportStatsDTO`,
      `ExportRowDTO`. Add RPC requests under `bun.requests`:
  - `reportStats: { params: ReportParamsDTO; response: ReportStatsDTO }`
  - `exportInvoices: { params: ReportParamsDTO; response: ExportRowDTO[] }`
  - Widen `saveExport` params `kind` from `"pdf" | "image"` to `"pdf" | "image" | "json"`.

- [ ] **`invoice-repository.ts`** — add:

  ```ts
  reportInvoices({ fromDate, toDate }: { fromDate?: number; toDate?: number }): InvoiceRow[];
  ```

  WHERE `status in (2,3)` (`inArray(invoices.status, [2, 3])`) AND optional
  `gte/lte(invoices.createdDate, …)` (guard each bound). `orderBy(asc(invoices.createdDate))`.

- [ ] **`invoice-service.ts`** — add two **exported pure functions** + wire two methods:
  - `toExportRow(row: InvoiceRow): ExportRowDTO` — status 3→"paid" else "unpaid";
    `createdDate`/`dueDate` epoch-ms → ISO (`new Date(ms).toISOString()`; `dueDate` null →
    null); parse `clientSnapshot` (try/catch) → `clientName/email/mobile` and
    `billingAddress → clientAddress`; null/malformed snapshot → all four `""`.
  - `buildReportStats(rows: InvoiceRow[], fromDate: number, toDate: number): ReportStatsDTO`
    — `rows` are already non-draft. Rollup: `totalBalance` = Σ totalAmount; `paidAmount` =
    Σ where status 3; `invoiceCount` = rows.length; `paidCount`/`unpaidCount` by status.
    `monthly`: enumerate **local** calendar months from `fromDate`'s month to `toDate`'s
    month inclusive, zero-filled; bucket each row by its local `YYYY-MM`; per month
    `total` = Σ totalAmount, `paid` = Σ where status 3.
  - `reportStats(opts: ReportParamsDTO)` = `buildReportStats(invoiceRepo.reportInvoices(opts), opts.fromDate!, opts.toDate!)`.
  - `exportInvoices(opts: ReportParamsDTO)` = `invoiceRepo.reportInvoices(opts).map(toExportRow)`.

- [ ] **`invoice-handlers.ts`** — add to the map:
  - `reportStats: (params: ReportParamsDTO) => service.reportStats(params)`
  - `exportInvoices: (params: ReportParamsDTO) => service.exportInvoices(params)`

- [ ] **`export-paths.ts`** — widen `extForKind` + `buildExportFilename` `kind` param to
      `"pdf" | "image" | "json"`; `extForKind` returns `"json"` for json.

- [ ] **`export-handlers.ts`** — widen `ExportKind` to include `"json"`. No other logic
      change (bytes are written as-is).

- [ ] **`lib/rpc.ts`** — add `reportApi`:

  ```ts
  export const reportApi = {
    stats: (params: ReportParamsDTO = {}) => bun().reportStats(params),
    exportInvoices: (params: ReportParamsDTO = {}) =>
      bun().exportInvoices(params),
  };
  ```

  Widen `exportApi.save` `kind` to `"pdf" | "image" | "json"`. Import the new DTO types.

- [ ] **Tests (TDD, red→green; co-located).** Follow `.claude/skills/tdd/SKILL.md`
      (in-memory SQLite, no `migrate.ts`).

  `invoice-service.test.ts` — pure-fn behaviors (no DB needed):
  - `toExportRow`: status 3 → `"paid"`, status 2 → `"unpaid"`; createdDate/dueDate → ISO;
    dueDate null → null; valid snapshot → name/email/mobile + billingAddress→clientAddress;
    null snapshot → four `""`; malformed snapshot JSON → four `""`.
  - `buildReportStats`: rollup totals + counts; `monthly` spans the full range zero-filled
    (a month with no rows → `{ total: 0, paid: 0 }`); per-month total vs paid split; rows
    bucketed by local month.

  `invoice-repository.test.ts` — `reportInvoices` excludes draft (status 1), includes
  status 2 + 3, respects `fromDate`/`toDate`, orders ascending by `createdDate`.

  `export-paths.test.ts` — `extForKind("json") === "json"`;
  `buildExportFilename("invoices-2025", "json") === "invoices-2025.json"`;
  range-name sanitization (`"invoices-2025-01-01-to-2025-12-31"` survives intact).

  `export-handlers.test.ts` — `saveExport` with `kind: "json"` writes to
  `downloads/<name>.json` and reveals it (assert against fakes).

  `invoice-handlers.test.ts` (**L1 gate**, assembled stack) — follow
  `.claude/skills/backend-e2e/SKILL.md`:
  - `reportStats({ fromDate, toDate })` end-to-end returns a scoped rollup + monthly buckets,
    excluding a draft row.
  - `exportInvoices({ fromDate, toDate })` end-to-end returns mapped rows excluding the draft.

## Done when

- All new pure-fn + repo behaviors are green (`bun test`).
- L1 gate green: assembled `reportStats` + `exportInvoices` over real repo+service+SQLite.
- `saveExport` accepts `kind: "json"` (path + reveal asserted with fakes).
- `reportApi` callable from the renderer side; types compile end-to-end.
- Existing tests still pass.

## Touches

- `apps/open-myanmar-invoice/src/shared/types.ts`
- `apps/open-myanmar-invoice/src/bun/repositories/invoice-repository.ts`
- `apps/open-myanmar-invoice/src/bun/repositories/invoice-repository.test.ts`
- `apps/open-myanmar-invoice/src/bun/services/invoice-service.ts`
- `apps/open-myanmar-invoice/src/bun/services/invoice-service.test.ts`
- `apps/open-myanmar-invoice/src/bun/rpc/invoice-handlers.ts`
- `apps/open-myanmar-invoice/src/bun/rpc/invoice-handlers.test.ts` (L1 gate)
- `apps/open-myanmar-invoice/src/bun/rpc/export-handlers.ts`
- `apps/open-myanmar-invoice/src/bun/rpc/export-handlers.test.ts`
- `apps/open-myanmar-invoice/src/bun/rpc/export-paths.ts`
- `apps/open-myanmar-invoice/src/bun/rpc/export-paths.test.ts`
- `apps/open-myanmar-invoice/src/lib/rpc.ts`
