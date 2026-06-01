import { describe, expect, it } from "vitest"

import { restoreStoredWorkbenchState } from "./persistence-restore"

describe("persistence restore", () => {
  it("restores valid panes with canonical lane ids and labels", () => {
    expect(
      restoreStoredWorkbenchState({
        panes: [
          { id: "z", label: "Wrong", text: "one", filename: "one.patch" },
          { text: "two" },
          { text: 123, filename: false },
          null,
          { text: "four" },
          { text: "five" },
          { text: "six" },
        ],
      })?.panes
    ).toEqual([
      { id: "a", label: "Diff A", text: "one", filename: "one.patch" },
      { id: "b", label: "Diff B", text: "two", filename: undefined },
      { id: "c", label: "Diff C", text: "", filename: undefined },
      { id: "d", label: "Diff D", text: "", filename: undefined },
      { id: "e", label: "Diff E", text: "four", filename: undefined },
    ])
  })

  it("restores only valid scalar settings", () => {
    expect(
      restoreStoredWorkbenchState({
        diffStyle: "split",
        laneMarkerStyle: "bars",
        layout: "rows",
        lineNumbers: false,
        notes: "note",
        sidebarOpen: false,
        wrap: true,
      })
    ).toMatchObject({
      diffStyle: "split",
      laneMarkerStyle: "bars",
      layout: "rows",
      lineNumbers: false,
      notes: "note",
      sidebarOpen: false,
      wrap: true,
    })
    expect(
      restoreStoredWorkbenchState({
        diffStyle: "word",
        laneMarkerStyle: "dots",
        layout: "grid",
        lineNumbers: 1,
        notes: false,
        sidebarOpen: "false",
        wrap: "yes",
      })
    ).toEqual({
      diffStyle: undefined,
      laneMarkerStyle: undefined,
      layout: undefined,
      lineNumbers: undefined,
      notes: undefined,
      panes: undefined,
      sidebarOpen: undefined,
      wrap: undefined,
    })
  })

  it("ignores non-object stored values", () => {
    expect(restoreStoredWorkbenchState(null)).toBeNull()
    expect(restoreStoredWorkbenchState([])).toBeNull()
  })
})
