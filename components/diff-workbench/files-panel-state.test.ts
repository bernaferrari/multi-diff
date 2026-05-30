import { describe, expect, it } from "vitest"

import {
  clearFilesPanelContext,
  getFilesPanelDerivedState,
  selectDirectoryContext,
  selectFileContext,
  toggleCollapsedDirectory,
} from "./files-panel-state"
import { testFileRow } from "./test-builders"

describe("files panel state", () => {
  it("filters by file name only, not directory path", () => {
    const rows = [
      testFileRow("app/api/search/route.ts"),
      testFileRow("components/result-list.tsx"),
      testFileRow("lib/search.ts"),
    ]

    expect(
      getFilesPanelDerivedState({
        collapsedDirs: new Set(),
        contextFile: null,
        hidden: new Set(),
        hiddenFileRows: [],
        laneIds: ["a"],
        query: "search",
        rows,
      }).filteredRows.map((item) => item.name)
    ).toEqual([
      "lib/search.ts",
    ])
  })

  it("returns all rows for blank queries", () => {
    const rows = [testFileRow("a.ts"), testFileRow("b.ts")]

    expect(
      getFilesPanelDerivedState({
        collapsedDirs: new Set(),
        contextFile: null,
        hidden: new Set(),
        hiddenFileRows: [],
        laneIds: ["a"],
        query: "  ",
        rows,
      }).filteredRows
    ).toBe(rows)
  })

  it("does not duplicate the current context file in restore rows", () => {
    const rows = [testFileRow("a.ts"), testFileRow("b.ts")]

    expect(
      getFilesPanelDerivedState({
        collapsedDirs: new Set(),
        contextFile: "a.ts",
        hidden: new Set(),
        hiddenFileRows: rows,
        laneIds: ["a"],
        query: "",
        rows,
      }).restorableRows.map((item) => item.name)
    ).toEqual(["b.ts"])
    expect(
      getFilesPanelDerivedState({
        collapsedDirs: new Set(),
        contextFile: null,
        hidden: new Set(),
        hiddenFileRows: rows,
        laneIds: ["a"],
        query: "",
        rows,
      }).restorableRows
    ).toEqual(rows)
  })

  it("derives visible file counts and lane badges from hidden state", () => {
    const rows = [testFileRow("a.ts"), testFileRow("b.ts"), testFileRow("c.ts")]
    const hiddenRows = [testFileRow("b.ts")]
    const laneIds = ["a", "b", "c"]
    const derived = getFilesPanelDerivedState({
      collapsedDirs: new Set(),
      contextFile: null,
      hidden: new Set(["b"]),
      hiddenFileRows: hiddenRows,
      laneIds,
      query: "route",
      rows,
    })

    expect(derived.visibleCount).toBe(2)
    expect(derived.treeLaneIds).toEqual(["a", "c"])
    expect(
      getFilesPanelDerivedState({
        collapsedDirs: new Set(),
        contextFile: null,
        hidden: new Set(["b"]),
        hiddenFileRows: hiddenRows,
        laneIds,
        query: "r",
        rows,
      }).showTreeLaneBadges
    ).toBe(false)
    expect(derived.showTreeLaneBadges).toBe(true)
  })

  it("keeps visible file count non-negative while hidden state settles", () => {
    expect(
      getFilesPanelDerivedState({
        collapsedDirs: new Set(),
        contextFile: null,
        hidden: new Set(),
        hiddenFileRows: [testFileRow("a.ts"), testFileRow("stale.ts")],
        laneIds: ["a"],
        query: "",
        rows: [testFileRow("a.ts")],
      }).visibleCount
    ).toBe(0)
  })

  it("builds the derived files panel state in one passable shape", () => {
    const rows = [testFileRow("app/a.ts"), testFileRow("app/b.ts")]
    const derived = getFilesPanelDerivedState({
      collapsedDirs: new Set(),
      contextFile: "app/a.ts",
      hidden: new Set(["b"]),
      hiddenFileRows: [rows[0]],
      laneIds: ["a", "b", "c"],
      query: "b",
      rows,
    })

    expect(derived.filteredRows.map((item) => item.name)).toEqual(["app/b.ts"])
    expect(derived.restorableRows).toEqual([])
    expect(derived.treeLaneIds).toEqual(["a", "c"])
    expect(derived.showTreeLaneBadges).toBe(false)
    expect(derived.treeRows.map((item) => item.node.path)).toEqual([
      "app",
      "app/b.ts",
    ])
    expect(derived.visibleCount).toBe(1)
  })

  it("toggles collapsed directories without mutating the original set", () => {
    const original = new Set(["app"])
    const opened = toggleCollapsedDirectory(original, "app")
    const collapsed = toggleCollapsedDirectory(opened, "lib")

    expect([...original]).toEqual(["app"])
    expect([...opened]).toEqual([])
    expect([...collapsed]).toEqual(["lib"])
  })

  it("keeps file and directory context mutually exclusive", () => {
    const directory = {
      label: "app",
      names: ["app/a.ts"],
    }

    expect(selectDirectoryContext(directory)).toEqual({
      contextDirectory: directory,
      contextFile: null,
    })
    expect(selectFileContext("app/a.ts")).toEqual({
      contextDirectory: null,
      contextFile: "app/a.ts",
    })
    expect(clearFilesPanelContext()).toEqual({
      contextDirectory: null,
      contextFile: null,
    })
  })
})
