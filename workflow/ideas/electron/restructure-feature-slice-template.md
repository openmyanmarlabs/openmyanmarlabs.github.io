# Idea

Restructure as Feature Slice Template in ElectronBun Template. And Also change organized version.

## Add Global Store

install `zustand` for global storage

## Add Validation for Zod

install `zod` for type safe and validation.
Each feature have validations, it could be input, form validations.

## Common UI

Create `src/components/common` -> Common Shared UI (eg. navbar.tsx, etc...)
Create `src/components/ui` -> Primitive Shared UI (eg. button.tsx, input.tsx, text.tsx etc...)
Create `src/components/layout` -> Shared Layout UI
Move `src/main-ui/styles/**` to -> `src/styles/**`

## Routes

Create `src/routes` folder -> Related Routes Codes be in this folder.

## Feature Slice

```
src/
├── features/               # Business logic by domain
│   ├── auth/               # pages/, validations/, components/, services
│   └── core/               # Shared domain logic (never UI)
├── components/
│   ├── common/             # Shared cross-feature components
│   │   ├── navbar.tsx, footer-section.tsx
│   └── ui/                 # shadcn/ui components (button, input, modal, etc.)
├── hooks/                  # Reusable React hooks
├── stores/                 # Zustand stores
└── lib/                    # Utilities (cn, dbConnector, etc.)
```

## Services

In each feature , There is `services` folder that could make business logics, but we will make sure that dependencies injection function, (eg. don't use directly database model, just passing from parent like that.)