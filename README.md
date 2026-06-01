# Multi Diff

Multi Diff is a focused review tool for comparing multiple unified diff files at
once. It is built for situations where one patch is not enough:
competing implementations, generated variants, refactors split across lanes, or
several candidate fixes that need to be understood file by file.

![Columns view](./docs/images/multi-diff-columns.png)

## What It Does

- Compare **2 to 5 diffs** in lanes A-E.
- Review lanes side by side in **Columns** or stacked in **Rows**.
- Switch between **Unified** and **Split** diff rendering.
- Import `.diff`, `.patch`, or text diffs from the toolbar, file picker, lane
  drop zones, or page-level drag and drop.
- Stage imports before applying them, reorder staged files, and choose target
  lanes.
- Navigate with a combined file tree that supports icons, directory collapse,
  lane markers, diff totals, focus, hide, restore, and recursive directory
  actions.
- Copy file paths from sticky file headers.
- Keep local notes while reviewing.
- Persist the workbench locally across reloads.

![Import dialog](./docs/images/import-dialog.png)

## Product Principles

- **The diff is the product.** Controls should protect reading space.
- **Navigation is explicit.** Clicking a file aligns panes to that file; normal
  scrolling stays local.
- **The file tree is a control surface.** It handles navigation, visibility,
  focus, collapse, and lane awareness.
- **Ordering is deterministic.** The tree, aggregate rows, and rendered panes
  must use the same path order.
- **Import is predictable.** Multi-file imports are staged before they replace
  lanes.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev        # Start the development server
pnpm build      # Build for production
pnpm start      # Start the production server
pnpm lint       # Run ESLint
pnpm typecheck  # Run TypeScript
pnpm test       # Run Vitest
pnpm format     # Format TS/TSX files
```

Before shipping a code change:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Tech Stack

- Next.js 16, React 19, Tailwind CSS 4
- shadcn/ui and Base UI primitives
- `@pierre/diffs` for diff parsing and rendering
- `@pierre/trees` for file icons
- Sonner for copy feedback
- Vitest for unit coverage

## Project Map

```text
app/                         App shell and page
components/ui/               shadcn/ui primitives
components/diff-workbench.tsx Public workbench entry
components/diff-workbench/    Workbench state, UI, rendering, and tests
```

Important workbench modules:

- `diff-data.ts`: patch normalization, parsing, totals, and file rows.
- `view-model.ts`: visible panes, focus state, hidden files, and render models.
- `file-tree.ts`: sorted tree construction and flattening.
- `files-panel-view-state.ts`: derived sidebar view state.
- `import-state.ts`: import previews, lane assignment, and import application.
- `workbench-navigation-state.ts`: file navigation and focus-mode decisions.
- `use-workbench-controller.ts`: composition layer for state, actions, view
  models, keyboard behavior, import, navigation, and scrolling.
- `lane-content.tsx` / `row-diff-list.tsx`: diff rendering surfaces.

## Architecture Notes

Pure state modules should not import React components. Shared contracts live in
small model files such as `files-panel-model.ts` and `import-dialog-model.ts`.

The app intentionally does not use continuous cross-pane scroll sync. Different
patches often render the same file at different heights, so pixel syncing can
make panes fight the reviewer. Explicit file navigation gives alignment without
surprising scroll jumps.

Workbench state is stored in `localStorage`. Persisted state includes panes,
layout, diff style, wrapping, line numbers, lane marker style, notes, and sidebar
visibility. Transient drag, context-menu, and scroll bookkeeping state is not
persisted.

## Adding shadcn/ui Components

```bash
pnpm dlx shadcn@latest add <component>
```

Generated shadcn/ui files live in `components/ui/`.
