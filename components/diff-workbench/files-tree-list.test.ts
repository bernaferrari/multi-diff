import { describe, expect, it } from "vitest"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { FilesTreeContent } from "./files-tree-content"
import type { VisibleFileTreeRow } from "./file-tree-types"
import type { FileRow } from "./types"

describe("files tree list", () => {
  function renderTreeContent({
    activeFileByLane = {},
    rowCount,
    treeRowCount,
  }: {
    activeFileByLane?: Record<string, string | undefined>
    rowCount: number
    treeRowCount: number
  }) {
    const fileRows: FileRow[] = Array.from(
      { length: rowCount },
      (_, index) => ({
        additions: 0,
        deletions: 0,
        name: `file-${index}.ts`,
        panes: {},
        presentIn: [],
      })
    )
    const treeRows: VisibleFileTreeRow[] = fileRows
      .slice(0, treeRowCount)
      .map((row) => ({
        depth: 0,
        node: {
          children: new Map(),
          kind: "file",
          name: row.name,
          path: row.name,
          row,
        },
      }))

    return renderToStaticMarkup(
      createElement(FilesTreeContent, {
        activeFile: null,
        activeFileByLane,
        collapsedDirs: new Set<string>(),
        focusFile: null,
        hiddenFiles: new Set<string>(),
        laneMarkerStyle: "letters",
        layout: "columns",
        query: "",
        rows: fileRows,
        showTreeLaneBadges: false,
        treeLaneIds: [],
        treeRows,
        onContextDirectory: () => {},
        onContextFile: () => {},
        onNavigate: () => {},
        onToggleDirectory: () => {},
      })
    )
  }

  it("describes the import state before any files exist", () => {
    expect(renderTreeContent({ rowCount: 0, treeRowCount: 0 })).toContain(
      "No files yet - import or drop diffs anywhere."
    )
  })

  it("describes an empty filter result once files exist", () => {
    expect(renderTreeContent({ rowCount: 3, treeRowCount: 0 })).toContain(
      "No files match your filter."
    )
  })

  it("does not show an empty message when tree rows are visible", () => {
    const html = renderTreeContent({ rowCount: 3, treeRowCount: 2 })

    expect(html).not.toContain("No files")
    expect(html).toContain('role="treeitem"')
  })

  it("marks rows active when any lane is currently reading that file", () => {
    const html = renderTreeContent({
      activeFileByLane: { a: "file-1.ts", b: "file-1.ts", c: undefined },
      rowCount: 2,
      treeRowCount: 2,
    })

    expect(html).toContain('data-active=""')
  })
})
