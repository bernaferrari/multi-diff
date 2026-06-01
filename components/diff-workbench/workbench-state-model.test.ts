import { describe, expect, it } from "vitest"

import {
  createInitialWorkbenchState,
} from "./workbench-state-model"

describe("workbench state model", () => {
  it("creates the default state for a new workbench session", () => {
    const state = createInitialWorkbenchState()

    expect(state).toMatchObject({
      activeFile: null,
      dragging: false,
      diffStyle: "unified",
      fileQuery: "",
      focusFile: null,
      laneMarkerStyle: "letters",
      layout: "columns",
      lineNumbers: true,
      notes: "",
      notesOpen: false,
      sidebarOpen: true,
      wrap: true,
    })
    expect(state.panes.map((pane) => pane.id)).toEqual(["a", "b", "c"])
    expect(state.hidden.size).toBe(0)
    expect(state.hiddenFiles.size).toBe(0)
  })

  it("returns fresh mutable collections for each initial state", () => {
    const first = createInitialWorkbenchState()
    const second = createInitialWorkbenchState()

    first.hidden.add("a")
    first.hiddenFiles.add("app/a.ts")
    first.panes[0].text = "changed"

    expect(second.hidden.size).toBe(0)
    expect(second.hiddenFiles.size).toBe(0)
    expect(second.panes[0].text).not.toBe("changed")
  })
})
