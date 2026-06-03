# Multi Diff

<p align="center">
  <img src="assets/header.png" alt="Multi Diff" width="100%">
</p>

Multi Diff is a local-first workbench for comparing multiple unified diff files
at once.

Instead of opening one patch at a time, you can load **2-5 diffs**, assign them
to lanes A-E, and review the same changed files across every candidate:

- **Columns** — side-by-side lanes for direct comparison
- **Rows** — full-width stacked reading when code needs more room
- **Unified or Split** — switch rendering style without changing the review
- **Search** — find changed content across every loaded diff

Everything runs in the browser. Diff content is not uploaded.

## Why Multi Diff

Most diff viewers are excellent at reviewing one patch. They become awkward when
you need to compare several generated fixes, refactor attempts, or implementation
variants.

Multi Diff is built for that comparison step. It keeps lane membership visible,
lets you move between files intentionally, and avoids fragile automatic scroll
syncing when patches do not have the same shape.

Click a file once and the relevant panes align to it. After that, normal
scrolling stays predictable.

## Features

- **Multi-lane comparison** — Review up to five diffs in lanes A-E.
- **Column and row layouts** — Compare side by side or read each diff at full
  width.
- **Unified and split views** — Use the renderer that fits the review.
- **Staged imports** — Drag files in, inspect the lane assignment, reorder, then
  apply.
- **File tree navigation** — Collapse directories, jump to files, focus the
  active path, and hide or restore files recursively.
- **Content search** — Search additions, deletions, and context with lane
  filters and highlighted matches.
- **Sticky file headers** — Keep the current file visible while scrolling.
- **Copy paths** — Click file headers to copy paths with immediate feedback.
- **Notes** — Keep lightweight review notes next to the diff.
- **Persistence** — Layout, panes, notes, and display settings survive reloads.

## Get Started

Requires [pnpm](https://pnpm.io/).

```bash
git clone https://github.com/bernaferrari/multi-diff
cd multi-diff
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).
