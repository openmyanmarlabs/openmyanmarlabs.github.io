---
name: backend-e2e
description: >-
  Backend end-to-end / integration testing for this Bun + Electrobun app —
  exercise the REAL path a feature takes through the main process (RPC handler →
  service → repositories → SQLite) headlessly, minus the native window and the
  wire. Use after building or changing a vertical feature, after a `plan-execute`
  run finishes, or whenever the user wants to confirm a feature "actually works
  end to end", add an integration / e2e test, set up an e2e gate, "test the whole
  flow", or verify the backend stack before the manual GUI smoke. This is the
  automatable layer ABOVE units (the `tdd` skill) and BELOW the manual native-GUI
  acceptance walk (the `verify` skill). Built on `bun test` + in-memory SQLite +
  DI; needs handlers exposed as a transport-free map (the skill shows the seam).
---

# Backend e2e (L1) — Bun + Electrobun

Unit tests (the `tdd` skill) prove one function. This layer proves the **wiring
between layers**: the exact path a renderer call travels on the Bun side — RPC
handler → service → repositories → real SQLite — assembled the way `index.ts`
assembles it, run headlessly. It's the highest-confidence test you can fully
automate for a desktop app whose GUI can't be driven.

## Where this sits in the layers

- **Units (`tdd`)** — one service method / schema / util in isolation. Per phase.
- **Backend e2e (this) — L1** — the assembled main-process stack, real DB, no
  window, no transport. The automated **done-gate after a feature/plan ships**.
- **Native GUI smoke — L3 (manual, `verify` skill)** — launch the built `.app`
  and walk the human acceptance list. _Not_ automatable: the app runs in a native
  WKWebView (Playwright can't drive it), and a bare browser pointed at the dev
  renderer has no RPC bridge, so the auth round-trip is dead there. Don't try to
  automate L3 — name what needs a human and hand it off.

So L1 is the ceiling of automation here. Invest in it; it catches "does the
feature actually work" without a screen.

## The testability seam (read this first — it's why L1 is possible)

Electrobun transport boots the runtime and hides the logic. `BrowserView.defineRPC(...)`
imports `electrobun/bun` (which starts the runtime on import) and nests handlers
where a test can't reach them. So **split transport from logic** — the same
move the `tdd` skill makes for `migrate.ts`:

- `create<Feature>Handlers(service)` → a **plain map** `{ method: (params) => result }`
  carrying the request-shape mapping + error-code normalization. **No electrobun
  import.** ← L1 tests import and call this.
- `create<Feature>Rpc(service)` → a thin wrapper:
  `BrowserView.defineRPC({ handlers: { requests: create<Feature>Handlers(service), messages: {} } })`.
  Imports electrobun. Pure transport — **not tested**.
- `index.ts` wires `create<Feature>Rpc`.

A handler still buried inside `defineRPC` (or a file that imports `electrobun/bun`
at the top) can't be L1-tested — importing it boots the runtime. If you find that,
extract the map first; the extraction is the test telling you where the seam goes.

This repo already follows it: `src/bun/rpc/auth-handlers.ts` (pure map) +
`src/bun/rpc/auth-rpc.ts` (transport).

## Recipe

Assemble the real stack with `createTestDb` (in-memory SQLite + DI, from the
`tdd` skill), fresh per `beforeEach`, then call the handler map:

```ts
import { beforeEach, describe, expect, test } from "bun:test";
import { createTestDb } from "@/bun/db/test-db";
import { createAuthHandlers, type AuthHandlers } from "@/bun/rpc/auth-handlers";
import { createSessionRepository } from "@/bun/repositories/session-repository";
import { createUserRepository } from "@/bun/repositories/user-repository";
import { createAuthService } from "@/bun/services/auth-service";

describe("auth RPC handlers (L1)", () => {
  let rpc: AuthHandlers;
  beforeEach(() => {
    const db = createTestDb(); // real schema, in-memory, isolated per test
    rpc = createAuthHandlers(
      createAuthService(createUserRepository(db), createSessionRepository(db)),
    );
  });

  test("register returns a token; me resolves that user", async () => {
    const { token, user } = await rpc.register({
      username: "demo",
      password: "demo1234",
    });
    expect((await rpc.me({ token })).user?.id).toBe(user.id);
  });

  test("duplicate username rejects with the stable CODE", async () => {
    await rpc.register({ username: "demo", password: "demo1234" });
    expect(
      rpc.register({ username: "demo", password: "x123456" }),
    ).rejects.toThrow("USERNAME_TAKEN");
  });
});
```

## What to assert at L1 (vs units)

Aim at the seams units miss — don't re-litigate every service branch:

- **The contract the renderer depends on** — request param shapes in, DTO shapes
  out. If this drifts, the typed RPC silently breaks.
- **Cross-method flows** — the real sequence (register → login → me → logout),
  proving handlers compose and state persists across calls.
- **Error-CODE normalization** — handlers turn the service's thrown _messages_
  into the stable codes the UI maps (`USERNAME_TAKEN`, `INVALID_CREDENTIALS`).
  The service units check messages; only L1 checks the codes the renderer sees.
- **Real persistence + constraints** — uniqueness, FK cascade, session expiry —
  via the in-memory DB, not a mock.

## Where it fits after `plan-execute`

`plan-maker` already plans units into each phase. For a feature that crosses the
RPC/service/DB boundary, add an **L1 gate** as the final vertical phase's
_Done when_ (or a small final phase): the `backend-e2e` suite green via
`bun test`. Then hand the **L3** native-GUI walk to the `verify` skill — listing
exactly what needs a human (relaunch persistence, no-FOUC, fonts, real clicks).

## Pitfalls

- **Booting the runtime in a test** — importing the `*-rpc.ts` wrapper, or any
  module that `import`s `electrobun/bun` / `electrobun/view` as a _value_, starts
  the runtime (slow, wrong). Stay on the pure handler map + service + repos.
  (Type-only imports like `import type { AppRPC }` are erased — those are fine.)
- **Mocking the DB or service** — that defeats L1; its whole value is real
  wiring. Mocks belong one layer down, in units.
- **Re-testing unit territory** — if an assertion would pass with the handler
  layer removed, it belongs in a unit test, not here.
- **Trying to automate the native window** — you can't. Capture it as an L3
  manual step instead of sinking time into Playwright-against-WKWebView.
