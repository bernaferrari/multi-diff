import type { FileDiffMetadata } from "@pierre/diffs/react"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { FileTreeLaneMarkers } from "./file-tree-lane-markers"
import type { FileRow } from "./types"

describe("file tree lane markers", () => {
  it("can render sidebar lane markers as letters or compact bars", () => {
    const row: FileRow = {
      additions: 1,
      deletions: 0,
      name: "app/search.ts",
      panes: {
        a: {} as FileDiffMetadata,
      },
      presentIn: ["a"],
    }

    const letters = renderToStaticMarkup(
      createElement(FileTreeLaneMarkers, {
        laneIds: ["a", "b", "c"],
        layout: "columns",
        markerStyle: "letters",
        row,
      })
    )
    const bars = renderToStaticMarkup(
      createElement(FileTreeLaneMarkers, {
        laneIds: ["a", "b", "c"],
        layout: "columns",
        markerStyle: "bars",
        row,
      })
    )
    const verticalBars = renderToStaticMarkup(
      createElement(FileTreeLaneMarkers, {
        laneIds: ["a", "b", "c"],
        layout: "rows",
        markerStyle: "bars",
        row,
      })
    )

    expect(letters).toContain(">A<")
    expect(letters).toContain(">B<")
    expect(bars).not.toContain(">A<")
    expect(bars).toContain("bg-lane-a")
    expect(bars).toContain("bg-muted")
    expect(verticalBars).toContain("flex-col")
    expect(verticalBars).toContain("gap-px")
    expect(verticalBars).toContain("h-1 w-3.5")
  })
})
