> Source: https://github.com/blackboardsh/electrobun/blob/main/docs/src/content/docs/electrobun/guides/quick-start.mdx · fetched 2026-05-24

# Quick Start

Build first ultra-fast, tiny desktop app with TypeScript.

## Prerequisites

- [Bun](https://bun.sh) installed.
- Text editor / IDE (Blackboard's [co(lab)](https://blackboard.sh/colab/) recommended).
- Basic TypeScript/JavaScript.

## Getting Started

Create new project (single command):

```
bunx electrobun init
```

Prompts for which template to start with. Creates a directory with this structure:

```
my-app/
├── src/
│   ├── bun/
│   │   └── index.ts        # Bun entry point (main process)
│   └── mainview/
│       ├── index.html      # UI template
│       ├── index.css       # Styles
│       └── index.ts        # Frontend logic
├── package.json            # Project dependencies
├── tsconfig.json
└── electrobun.config.ts    # Build configuration
```

## Running Your App

```
cd my-app
bun install
bun start
```

Uses the Electrobun CLI to: create the quick-start project, do a dev build, open the app in dev mode.

## Next Steps

- Hello World — create from scratch.
- Creating UI — build interfaces with web tech.
- Bun API — main process APIs.
- BrowserView — manage multiple webviews.
- Bundling & Distribution — package for distribution.

## Need Help?

- [GitHub repository](https://github.com/blackboardsh/electrobun)
- [Discord](https://discord.gg/ueKE4tjaCE)
- Other docs guides.
