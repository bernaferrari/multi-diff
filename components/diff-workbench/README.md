# Multi Diff Internals

This folder is intentionally split by behavior instead of by component size.

- `workbench/` owns app-level state, controller wiring, shell layout, samples, and notes.
- `rendering/` owns parsed diff rendering, file headers, render options, and pane models.
- `file-tree/` owns the sidebar tree, file visibility, focus actions, and context menus.
- `importing/` owns import staging, lane assignment, drop zones, and file inputs.
- `navigation/` owns row/column navigation, scroll state, keyboard shortcuts, and scroll spy logic.
- `lanes/` owns lane labels, colors, headers, actions, and per-lane layout.
- `toolbar/` owns toolbar controls, display options, and theme switching.
- `search/` owns content search, result highlighting, and selected-result state.
- `persistence/` owns local persistence and restore behavior.
- `shared/` owns small cross-domain helpers and test builders.

Prefer adding pure state helpers with colocated tests before adding hook logic.
The most sensitive areas are navigation, row/column layout transitions, import
assignment, and file visibility.
