import { describe, expect, it } from "vitest"

import type { FileRow, ParsedPane } from "./types"
import {
  getFilesPanelDisplayState,
  getFilesPanelView,
} from "./files-panel-view-state"

describe("files panel view state", () => {
  it("uses the first visible tree file as the initial selection", () => {
    const rows = [
      row("app/second.ts", ["c"], 2),
      row("app/first.ts", ["a", "b"], 4),
    ]

    expect(
      getFilesPanelDisplayState({
        activeFileByLane: {},
        focused: null,
        indexActiveFile: null,
        layout: "columns",
        rows,
      })
    ).toEqual({
      activeFile: "app/first.ts",
      activeFileByLane: {
        a: "app/first.ts",
        b: "app/first.ts",
      },
    })
  })

  it("selects from the visible rows supplied by the caller", () => {
    const rows = [row("app/second.ts", ["b"])]

    expect(
      getFilesPanelDisplayState({
        activeFileByLane: {},
        focused: null,
        indexActiveFile: null,
        layout: "columns",
        rows,
      }).activeFile
    ).toBe("app/second.ts")
  })

  it("keeps existing visible lane state in columns overview", () => {
    expect(
      getFilesPanelDisplayState({
        activeFileByLane: { a: "app/old.ts", c: "app/new.ts" },
        focused: null,
        indexActiveFile: "app/new.ts",
        layout: "columns",
        rows: [row("app/new.ts", ["a", "c"])],
      }).activeFileByLane
    ).toEqual({ c: "app/new.ts" })
  })

  it("falls back to every present lane in columns overview", () => {
    expect(
      getFilesPanelDisplayState({
        activeFileByLane: {},
        focused: null,
        indexActiveFile: "app/new.ts",
        layout: "columns",
        rows: [row("app/new.ts", ["a", "c"])],
      }).activeFileByLane
    ).toEqual({ a: "app/new.ts", c: "app/new.ts" })
  })

  it("keeps only one lane active in rows overview", () => {
    expect(
      getFilesPanelDisplayState({
        activeFileByLane: { a: "app/old.ts", c: "app/new.ts" },
        focused: null,
        indexActiveFile: "app/new.ts",
        layout: "rows",
        rows: [row("app/new.ts", ["a", "c"])],
      }).activeFileByLane
    ).toEqual({ c: "app/new.ts" })

    expect(
      getFilesPanelDisplayState({
        activeFileByLane: {},
        focused: null,
        indexActiveFile: "app/new.ts",
        layout: "rows",
        rows: [row("app/new.ts", ["a", "c"])],
      }).activeFileByLane
    ).toEqual({ a: "app/new.ts" })
  })

  it("shows every present lane while focused", () => {
    expect(
      getFilesPanelDisplayState({
        activeFileByLane: { b: "other.ts" },
        focused: "app/new.ts",
        indexActiveFile: "app/old.ts",
        layout: "rows",
        rows: [row("app/new.ts", ["a", "c"])],
      }).activeFileByLane
    ).toEqual({ a: "app/new.ts", c: "app/new.ts" })
  })

  it("builds the files panel view contract", () => {
    const rows: FileRow[] = [row("app/new.ts", ["a", "c"])]
    const hiddenFileRows: FileRow[] = []
    const parsed: ParsedPane[] = []
    const hidden = new Set(["b"])
    const hiddenFiles = new Set(["app/old.ts"])

    expect(
      getFilesPanelView({
        activeFileByLane: { a: "app/old.ts", b: "app/other.ts" },
        allFileRows: rows,
        fileRows: rows,
        focused: "app/new.ts",
        focusMode: true,
        hiddenFileRows,
        indexActiveFile: "app/new.ts",
        parsed,
        sharedCount: 2,
        state: {
          fileQuery: "new",
          hidden,
          hiddenFiles,
          laneMarkerStyle: "bars",
          layout: "rows",
        },
      })
    ).toEqual({
      activeFileByLane: { a: "app/new.ts", c: "app/new.ts" },
      activeFile: "app/new.ts",
      focusableRows: rows,
      focusMode: true,
      focusFile: "app/new.ts",
      hidden,
      hiddenFiles,
      hiddenFileRows,
      laneMarkerStyle: "bars",
      layout: "rows",
      panes: parsed,
      query: "new",
      rows,
      sharedCount: 2,
    })
  })
})

function row(name: string, presentIn: FileRow["presentIn"], additions = 1) {
  return {
    additions,
    deletions: 0,
    name,
    panes: {},
    presentIn,
  } satisfies FileRow
}
