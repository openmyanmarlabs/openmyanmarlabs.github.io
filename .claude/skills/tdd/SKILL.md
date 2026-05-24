---
name: tdd
description: >-
  Test-driven development for this Bun + Electrobun monorepo. Use whenever new
  or changed main-process / pure logic is involved — auth or other services,
  Drizzle repositories, zod validation schemas, zustand store logic, token /
  crypto / formatting utilities — and the user wants tests, mentions TDD,
  red/green/refactor, "write the test first", "add tests for", a regression
  test, test coverage, or "make this testable". Drives a one-test-at-a-time
  red→green→refactor loop on Bun's built-in `bun test`, exercising behavior
  through public APIs, with in-memory SQLite + dependency injection for
  repos/services. Prefer this over ad-hoc test writing whenever logic is being
  added under apps/electrobun-template or another Bun package.
---

# TDD — Bun + Electrobun

Test-driven development here means: let a failing test describe the behavior you
want, write the smallest code that makes it pass, then clean up. The point isn't
"tests for their own sake" — it's that writing the test first forces you to use
the code through its real public interface before it exists, which shapes a
better interface and leaves behind a suite that catches regressions.

## What to target (and what to skip)

TDD pays off most on **logic with a clear input→output contract**. In this repo
the natural seams are:

- **Services** — `createAuthService(userRepo, sessionRepo)` and friends. Pure DI:
  inject repos, call methods, assert on results. The highest-value target.
- **Repositories** — `createUserRepository(db)` etc., against an in-memory DB.
- **zod schemas** — `auth-schema.ts` and any validation. Instant, no setup.
- **Pure utilities** — token/crypto helpers, formatters, `cn()`, reducers.
- **Store logic** — the _pure_ parts of a zustand store (state transitions you
  can call and read back via `getState()`).

**Skip** (not worth the harness, or needs a stack we deliberately don't have):
RPC wiring, the Electrobun runtime, `index.ts` startup, and React
components/DOM-coupled store side effects (`document`, `localStorage`,
`matchMedia`). Those are verified by running the app, not by `bun test`. If you
find yourself wanting to test one of these, that's usually a sign to **extract
the logic** into a pure function and test that instead.

## The loop

Work one behavior at a time — a thin vertical slice, not a batch of tests up
front. Bulk-writing tests before any code couples them to behavior you only
_imagined_; one-at-a-time keeps them honest.

1. **RED** — write one test for the next small behavior. Run it. Watch it fail
   for the _right reason_ (assertion fails / function missing — not a typo or
   import error). A test you never saw fail proves nothing.
2. **GREEN** — write the minimum code to pass. Resist building ahead of the test.
3. **REFACTOR** — with the test green, clean up names/duplication in both the
   code and the test. Re-run; stay green.
4. Repeat for the next behavior.

Run focused while iterating, full suite before you're done:

```bash
bun test path/to/file.test.ts      # one file
bun test --watch path/to/file      # re-run on save (tight RED→GREEN loop)
bun test                           # whole suite
```

## Toolchain (this repo)

Bun ships its own runner — **no Vitest/Jest, zero new deps**. Import from
`bun:test`; the API is Jest-shaped (`describe`/`test`/`expect`/`beforeEach`).

- **Co-locate** tests next to the code: `auth-service.ts` →
  `auth-service.test.ts`. Co-location keeps the test in view when the code
  changes, so it's more likely to be kept honest.
- The `@/` alias works in `bun test` (Bun reads `tsconfig.json` `paths`) — import
  the same way the app does: `import { createAuthService } from "@/bun/services/auth-service"`.
- Ensure a `test` script exists in `package.json`: `"test": "bun test"`.

## Writing tests that survive refactoring

Assert on **observable behavior through the public API**, never on internals.
A test that reaches into private state breaks every time you refactor, even when
behavior is unchanged — that's noise, not safety. Test what a caller can see:
return values, thrown errors, persisted rows visible via the repo's own reads.

Keep each test **Arrange → Act → Assert** and name it for the behavior, not the
function: `test("login rejects a wrong password")`, not `test("login works")`.
The name is the spec; make it read like one.

## Recipes

### 1. zod schema / pure function — the simplest case

```ts
import { test, expect } from "bun:test";
import { registerSchema } from "@/features/auth/validations/auth-schema";

test("register rejects a password shorter than 6 chars", () => {
  const r = registerSchema.safeParse({
    username: "demo",
    password: "123",
    confirmPassword: "123",
  });
  expect(r.success).toBe(false);
  // Assert the stable error KEY, not a localized string — messages are i18n keys.
  expect(r.error?.issues[0]?.message).toBe("passwordTooShort");
});
```

### 2. Repository + service — in-memory SQLite + DI (the big one)

The architecture is built for this: services depend only on injected repos, and
`createDb` accepts any path — including `":memory:"`. So a test gets a real
schema, real SQL, real hashing, and tears down for free when the process exits.
Each test starts from a **fresh** in-memory DB via `beforeEach` so they don't
leak state into each other.

**⚠ Do NOT import `@/bun/db/migrate` (`runMigrations`) in tests.** It imports
`PATHS` from `electrobun/bun`, which boots the whole Electrobun runtime (socket
server, bundle path lookups) — wrong and slow for a unit test. Instead apply the
generated migrations directly with Drizzle's migrator. A tiny helper next to the
DB code keeps every test clean:

```ts
// src/bun/db/test-db.ts  (a helper, not a *.test.ts — the runner ignores it)
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { createDb } from "@/bun/db/connector";

// Fresh in-memory DB with the real schema applied. No Electrobun runtime.
export function createTestDb() {
  const db = createDb(":memory:"); // reuses the real connector (FK pragma + schema)
  migrate(db, {
    migrationsFolder: new URL("./migrations", import.meta.url).pathname,
  });
  return db;
}
```

```ts
// src/bun/services/auth-service.test.ts
import { beforeEach, describe, expect, test } from "bun:test";
import { createTestDb } from "@/bun/db/test-db";
import { createUserRepository } from "@/bun/repositories/user-repository";
import { createSessionRepository } from "@/bun/repositories/session-repository";
import {
  createAuthService,
  type AuthService,
} from "@/bun/services/auth-service";

describe("auth-service", () => {
  let auth: AuthService;

  beforeEach(() => {
    const db = createTestDb(); // fresh DB per test — no shared state
    auth = createAuthService(
      createUserRepository(db),
      createSessionRepository(db),
    );
  });

  test("register then login issues a session for that user", async () => {
    const user = await auth.register("demo", "demo1234");
    const result = await auth.login("demo", "demo1234");
    expect(result.user.id).toBe(user.id);
    expect(result.token).toBeTruthy();
  });

  test("register never exposes the password hash", async () => {
    const user = await auth.register("demo", "demo1234");
    expect(user).not.toHaveProperty("passwordHash");
  });

  test("login with a wrong password throws", async () => {
    await auth.register("demo", "demo1234");
    expect(auth.login("demo", "nope")).rejects.toThrow("Invalid credentials");
  });

  test("me returns null after logout", async () => {
    await auth.register("demo", "demo1234");
    const { token } = await auth.login("demo", "demo1234");
    auth.logout(token);
    expect(auth.me(token)).toBeNull();
  });
});
```

Need to test a time-dependent branch (e.g. session _expiry_) without waiting?
Don't sleep — inject the clock. If a unit reads `Date.now()` internally and that
makes it hard to test, that's the test telling you to pass time in as a
parameter or dependency. Prefer fixing the seam over reaching for fake timers.

When you only need to test a service's _own_ logic (not the SQL), you can also
hand it a **fake repo** — a plain object matching the repo's interface. Use the
real in-memory DB when the SQL/constraints matter (uniqueness, cascade), fakes
when they don't and you want speed.

### 3. zustand store — test the pure transitions

Call actions, read state back via `useStore.getState()`. Keep DOM side effects
(writing `localStorage`, toggling `.dark`) out of the path under test — if a
transition is tangled with the DOM, extract the pure decision into a helper and
test that; the DOM glue is checked by running the app.

## Pitfalls

- **A test that passed on the first run** (never RED) may be asserting nothing —
  break the code on purpose once to confirm the test actually fails.
- **`Bun.password.hash` is argon2** (intentionally slow, ~tens of ms). A handful
  of auth tests is fine; if a large suite drags, share one registered user
  across reads or lower the cost factor in a test-only factory.
- **Leaking state between tests** — always build the DB/service in `beforeEach`,
  not once at module top, or earlier tests will taint later ones.
- **Over-mocking** — if a test mocks so much it no longer runs real code, it
  tests the mocks. Favor the in-memory DB over stubbing the repo layer away.
- **Testing the framework** — don't write tests for Drizzle, zod, or Electrobun
  themselves; test _your_ behavior built on them.
