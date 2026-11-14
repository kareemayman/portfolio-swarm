# portfolio-swarm

Kareem Ayman's portfolio. Three agent cursors (frontend, backend, ai) build each section of the page in front of the visitor as it scrolls into view.

The build spec is [design/HANDOFF.md](design/HANDOFF.md) and the visual and motion reference is [design/prototype.html](design/prototype.html) (open it in a browser).

## Stack

Next.js (App Router) and TypeScript, CSS Modules, content in typed files validated with Zod. The agent API (Express, Claude, MongoDB) comes in a later milestone.

## Develop

Requires Node 20.9 or newer and pnpm.

Copy `.env.example` to `.env.local` and add a GitHub token. It is only used to read the public contribution calendar; without it that panel is hidden.

```bash
pnpm install
pnpm dev         # http://localhost:3000
pnpm lint
pnpm typecheck
pnpm build
```
