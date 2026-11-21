# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Kareem Ayman's portfolio. Three agent cursors (`fe`, `be`, `ai`) build each section of the page in front of the visitor as it scrolls into view, then follow the mouse when idle.

- `design/HANDOFF.md` is the spec and the source of truth. Read all of it before feature work. This file only adds what the handoff does not say, and where the installed stack forces a different implementation.
- `design/prototype.html` is the look, motion and timing reference (the handoff calls it `reference/prototype.html`; same file). It is one 125 KB file, so read it by section: search for the banner comments `SWARM ENGINE`, `PAGE`, `CASE STUDY`, `CONSOLE`, `BOOT`, and the `PROJECTS` array. Port its behavior, not its code style. Nothing in `design/` is imported or shipped.

## How work proceeds

Build one milestone at a time in the order of handoff section 13, and stop for review after each one.

Current milestone: **2, engine core, in progress on `feat/swarm-engine`.** Milestone 1 is merged into `main`. Done in milestone 2 so far: the swarm layer, the three cursors and idle mouse follow; the abort token, `speed()`, `move` and the click ripple; `box`; `type`. Update this line as work lands.

Milestone 1 deliberately leaves these for the milestone that owns them:

- Work index filters, hover previews and the project-page overlay (4). Cards and rows are plain links to `/work/[slug]`.
- The agent console (5). It is markup with disabled controls and says it is offline. No guard count or source count is shown, because those would be invented numbers.
- Project media (4). `ProjectArt` draws placeholder SVG screens ported from the prototype's canvas art; `poster` is optional in the schema until recordings exist. The two confidential projects keep illustrative art for good.
- The `/` shortcut hinted in the nav (5).

### Planned beyond the handoff

- **Smooth scrolling, with Lenis or something like it.** Kareem asked for this on 2026-11-13; it has no milestone yet. Decide where it goes before the engine work in milestone 2, because it touches the same ground: the engine reads `scrollX`/`scrollY` and uses an `IntersectionObserver`, `html { scroll-behavior: smooth }` and the `#section` links would have to hand over to the library, the nested scrollers (console log, architecture frame, heat grid, project overlay) must be excluded, and it has to switch off under `prefers-reduced-motion`.

## Commands

```bash
pnpm dev         # dev server (Turbopack) on http://localhost:3000
pnpm build       # production build, includes type-check
pnpm start       # serve the production build
pnpm lint        # ESLint flat config (eslint-config-next)
pnpm typecheck   # next typegen && tsc --noEmit
```

There is no test runner yet.

pnpm is pinned through `packageManager` in `package.json`. pnpm blocks dependency install scripts unless they are listed under `allowBuilds` in `pnpm-workspace.yaml`, so a new dependency that needs a postinstall step has to be allowed there.

## Where the handoff's paths land

The handoff writes `app/...`; this repo uses a `src/` directory.

| Handoff | Here |
| --- | --- |
| `app/layout.tsx`, `app/work/[slug]`, `app/@modal/(.)work/[slug]` | `src/app/...` |
| `src/swarm/` (framework-agnostic engine) | `src/swarm/` |
| `sections/Experience.swarm.ts` (section + its build script) | `src/sections/` |
| the project page (not named in the handoff) | `src/project/`, one component for the route now and the overlay later |
| `content/` (typed content, Zod) | `content/` at the repo root, shared with the API |
| `api/` (Express agent service, milestone 6) | `api/` at the repo root |

`@/*` resolves to `src/*` and `@content/*` to `content/*`. Shared pieces (buttons, the section grid, stats) live in `src/styles/ui.module.css`; tokens and element rules in `src/styles/tokens.css`.

The content schema has one field the handoff's does not: `card`, the featured card's own tag, text and chips, which differ from the project page's wording in the prototype.

The prototype's code says "case study" (`.cs-*` classes, the `CASE STUDY` script) for what the handoff and the UI call the "project page".

## Architecture in one pass

- **Content first, animation second.** Every section is a server component that renders its final text with `data-b` attributes. The swarm only reveals what is already in the HTML. Hidden build states are CSS attribute selectors (`.js [data-b="text"]:not(.on)` and so on) that apply only while the `js` class is on `<html>`, set by an inline script in `<head>` and removed on any early script error.
- **The engine does not know React.** `src/swarm/` holds agents, abortable actions (`move`, `box`, `type`, ...) and a `Runner` that queues sections from an `IntersectionObserver`. A client `SwarmLayer` mounts it; each section registers its script with `useSwarmSection(key, script, rootRef)`.
- **The layer covers the document and clips.** `#swarm` is positioned against `<body>` with `inset: 0` and `overflow: clip`, not `height: 0` as the handoff says. A zero-height layer lets a cursor that hangs past the end of the page make the document taller, so following the mouse at the bottom would scroll forever. A position inside the layer is still a document coordinate, as long as `<body>` starts at the top of the document. That is why it is `display: flow-root`: without it, a first child's top margin collapses through `<body>` and draws every cursor and overlay that much too low.
- **Every action is abortable and speed-scaled.** Actions take a token and reject with an `ABORT` sentinel when it dies (Skip, Replay, opening a project page). Every duration is divided by `speed()`.
- **Project pages are one view on two routes.** `/work/[slug]` renders the page for direct visits; the intercepting route shows the same content as an overlay with its own runner.
- **One content source.** `content/` feeds the page, the project pages, the agent's knowledge base and the scripted fallback.

## Rules that constrain every change

These come from handoff section 2 and are not negotiable.

- Content is server-rendered real HTML. With JavaScript off, every word is visible.
- No layout shift. Hidden states use `visibility`, `opacity` or `clip-path`, never `display: none`. Lock `min-width` and `min-height` while text types.
- `prefers-reduced-motion: reduce` shows everything built, with no cursors and no control bar.
- The cursor layer is decorative: `aria-hidden="true"`, `pointer-events: none`, never takes focus.
- Colors come only from the tokens in handoff section 4. Agent colors appear only on cursors, selection boxes, small role tags and layer dots.
- Every fact is Kareem's. Use only the copy in `content/`, which comes from the prototype. Never invent metrics, employers or dates. Handoff section 12 lists facts he still has to confirm; keep their wording as written.

## Where the installed stack differs from the handoff

Next.js 16.4 with `cacheComponents` and `partialPrefetching` on (`next.config.ts`). The handoff was written without them, so read the bundled doc before implementing each of these:

- **No route segment configs.** `revalidate`, `dynamic`, `fetchCache` and `runtime` exports are errors. "Revalidate once a day" for the GitHub contribution calendar becomes a `"use cache"` function with `cacheLife("days")`. See `02-guides/migrating-to-cache-components.md`.
- **Uncached or request-time data must be inside `"use cache"` or behind `<Suspense>`**, or the route fails the blocking-route validation. See `01-getting-started/08-caching.md`.
- **Never put page content behind `<Suspense>`, even when its data is cached.** Content behind a boundary is prerendered as a late chunk that a script reveals, so it vanishes with JavaScript off and breaks the first rule above. Cached data awaited with no boundary prerenders inline. The GitHub panel in `Now.tsx` is the example.
- **`/work/[slug]` sets `ensureStatic = "navigation"` and `instant = false`.** The first makes an unknown slug wait for the render so `notFound()` returns a real 404 instead of a 200 fallback shell (`dynamicParams` is not supported). The second tells the dev validation that reading `params` with no boundary is intended.
- **`dynamic(..., { ssr: false })` is only allowed in a Client Component.** The handoff loads the engine this way from the layout; the call has to live in a client wrapper. See `02-guides/lazy-loading.md`.
- **Routes stay mounted but hidden on client navigation** (React `<Activity>`), and their effects are cleaned up and re-run. Every rAF loop, observer and listener the engine starts must stop in effect cleanup and restart safely. This matters most for the project-page overlay. See `02-guides/preserving-ui-state.md`.
- **The inline `<head>` scripts** (the `js` class and the theme read from `localStorage`): see `02-guides/preventing-flash-before-hydration.md`. In development React logs "Encountered a script tag" when the layout re-renders on the client, for example on a 404. That is expected and does not happen in production.

Doc paths are relative to `node_modules/next/dist/docs/01-app/`.

ESLint is held at 9 because `eslint-plugin-react`, `-jsx-a11y` and `-import` (bundled by `eslint-config-next`) do not support 10. The deprecation warning on install is expected.
