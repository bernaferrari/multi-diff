# Diff Workbench Internals

This folder is intentionally split by behavior instead of by component size.

- `diff-*`, `pane-*`, `row-*`, and `viewport-*` own rendering parsed diffs.
- `file-tree-*`, `directory-tree-*`, and `files-*` own the sidebar tree.
- `import-*` owns import staging, lane assignment, and drop handling.
- `workbench-*` owns app-level state, controller wiring, and navigation rules.
- `lane-*` owns lane labels, colors, visibility, and per-lane actions.

Prefer adding pure state helpers with colocated tests before adding hook logic.
The most sensitive areas are navigation, row/column layout transitions, import
assignment, and file visibility.
