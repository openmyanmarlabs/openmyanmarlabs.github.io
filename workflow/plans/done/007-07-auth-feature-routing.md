# 007-07 — Auth feature UI + routing guards

Plan: `007-root-feature-slice-auth.md` · Blocked by: 04, 05, 06 · Parallel-safe with: —

## Goal

Ship the user-facing auth feature: `/login` + `/register` pages (react-hook-form + zod, bilingual), `auth-store` wired to RPC + persisted auto-login, protected routes, a navbar with language/theme/logout, and the home pages made protected.

## Context

The capstone — assembles UI primitives (04), zustand stores (05), and the auth RPC client (06) into the working flow. Everything below is offline + bilingual (Burmese-first).

Inputs ready: `components/ui/{button,input,text}` + `cn()` (04); `stores/{i18n,theme,auth}-store` + `lib/i18n/content.ts` (05); `features/auth/services/auth-api.ts` RPC client + DTOs (06).

Build:

```
src/features/auth/
  pages/login-page.tsx, register-page.tsx          # rhf + zodResolver, use ui primitives
  validations/auth-schema.ts                        # zod schemas; messages via i18n keys (not literals)
  components/auth-form.tsx (optional shared form)
src/components/common/navbar.tsx                     # language-toggle + theme-toggle + logout
src/components/layout/app-layout.tsx                 # shell (navbar + <Outlet/>)
src/components/layout/protected-route.tsx            # redirect to /login when unauthenticated
src/routes/index.tsx                                 # router config + guards (moved out of main.tsx)
```

Requirements (spec):

- **Forms:** react-hook-form + `@hookform/resolvers/zodResolver`; show field + form errors; labels + error messages **bilingual (my/en)** resolved through the i18n store. Add an `auth` namespace to `lib/i18n/content.ts` (keep `my` source-of-truth + `en: Content` symmetry). zod messages: validate with stable keys/codes → map to localized strings via i18n, so messages switch with the language toggle. RPC error codes from 06 → bilingual messages the same way.
- **auth-store (finish 05's shell):** holds `user` + `token`; actions call `auth-api`: `register`/`login` set session + persist token to `localStorage`; `logout` calls RPC + clears store + localStorage.
- **Auto-login:** on app launch, read the persisted token → `auth-api.me(token)` → populate the store (or clear if invalid). Guard initial render so protected routes don't flash before the check resolves. ⚠ **RISK — localStorage in the WebView:** verify the token survives quit+relaunch; if it doesn't persist, fall back to storing the token in userData via an RPC method (coordinate a small addition to 06's schema).
- **Routing (react-router, `createHashRouter`):** `/login` + `/register` **public**; `/` + `/about` **protected** (redirect to `/login` when unauthenticated); authenticated users hitting `/login` → `/`. Move the router config from `main.tsx` to `routes/index.tsx`; `main.tsx` just renders `<RouterProvider>`.
- **Navbar:** language toggle + theme toggle + logout button, using the ui primitives; shown in `app-layout` for protected pages.

**Tailwind v4 — consult the `tailwind-docs-reader` subagent before writing any CSS / new class strings**; use verbatim v4 syntax, keep classes static (no interpolation) for content detection. Reuse brand tokens + `dark:` + `font-myanmar` from `global.css`.

## Steps

- [ ] Extend `lib/i18n/content.ts` with an `auth` namespace (labels, buttons, validation/error messages) — `my` + `en` symmetric.
- [ ] `features/auth/validations/auth-schema.ts` — zod schemas for login + register; error keys (not localized literals).
- [ ] `features/auth/pages/{login,register}-page.tsx` — rhf + zodResolver, ui primitives, bilingual labels + errors.
- [ ] Finish `stores/auth-store.ts` — wire to `auth-api`; persist token to localStorage; `register`/`login`/`logout`/auto-login.
- [ ] `components/layout/protected-route.tsx` + `app-layout.tsx`; `components/common/navbar.tsx` (toggles + logout).
- [ ] `routes/index.tsx` — router + guards (public `/login`,`/register`; protected `/`,`/about`; logged-in `/login`→`/`); `main.tsx` renders `<RouterProvider>`. Home pages now under the protected layout.
- [ ] Auto-login on launch via persisted token + `me`; handle the pre-check render.
- [ ] Verify the full acceptance flow (below) in a built `.app`.
- [ ] `bun run typecheck` green; `bun start` HMR works.

## Done when

- Register a new user → land in the protected app; quit + relaunch → still logged in (auto-login).
- Logout → back to `/login`; relaunch → still logged out; re-login works; wrong password → bilingual error.
- Direct-navigating to a protected route while logged out redirects to `/login`; logged-in user at `/login` → `/`.
- Forms use rhf + zodResolver; field + form errors shown; labels + messages bilingual (my/en) and switch with the toggle.
- Navbar logout + language + dark-mode toggles work across all screens; Burmese in KhitHaungg; no FOUC.
- localStorage auto-login verified (or userData-via-RPC fallback in place).
- `bun run typecheck` green; `bun run build` runnable `.app`; `bun start` HMR works.

## Touches

- `src/features/auth/{pages,validations,components,services}/**` — auth UI + schemas.
- `src/stores/auth-store.ts` — finish (RPC + persistence + auto-login).
- `src/components/common/navbar.tsx`, `src/components/layout/{app-layout,protected-route}.tsx` — new.
- `src/routes/index.tsx` — router + guards; `src/main.tsx` — render `<RouterProvider>`.
- `src/lib/i18n/content.ts` — `auth` namespace.
- `src/features/home/pages/*` — placed under the protected layout.
