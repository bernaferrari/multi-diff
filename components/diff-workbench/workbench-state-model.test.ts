import { describe, expect, it } from "vitest"

import {
  createInitialWorkbenchState,
  getWorkbenchPersistenceState,
  getWorkbenchSetters,
  getWorkbenchState,
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

  it("projects only durable fields into persisted state", () => {
    const state = createInitialWorkbenchState()
    state.activeFile = "app/active.ts"
    state.dragging = true
    state.fileQuery = "route"
    state.focusFile = "app/focus.ts"
    state.hidden.add("b")
    state.hiddenFiles.add("app/hidden.ts")
    state.notesOpen = true

    expect(getWorkbenchPersistenceState(state)).toEqual({
      diffStyle: "unified",
      laneMarkerStyle: "letters",
      layout: "columns",
      lineNumbers: true,
      notes: "",
      panes: state.panes,
      sidebarOpen: true,
      wrap: true,
    })
  })

  it("keeps state and setter projections explicit", () => {
    const state = createInitialWorkbenchState()
    const setters = {
      setActiveFile: () => {},
      setDragging: () => {},
      setDiffStyle: () => {},
      setFileQuery: () => {},
      setFocusFile: () => {},
      setHidden: () => {},
      setHiddenFiles: () => {},
      setLaneMarkerStyle: () => {},
      setLayout: () => {},
      setLineNumbers: () => {},
      setNotes: () => {},
      setNotesOpen: () => {},
      setPanes: () => {},
      setSidebarOpen: () => {},
      setWrap: () => {},
    }

    expect(getWorkbenchState(state)).toBe(state)
    expect(Object.keys(getWorkbenchSetters(setters))).toEqual([
      "setActiveFile",
      "setDragging",
      "setDiffStyle",
      "setFileQuery",
      "setFocusFile",
      "setHidden",
      "setHiddenFiles",
      "setLaneMarkerStyle",
      "setLayout",
      "setLineNumbers",
      "setNotes",
      "setNotesOpen",
      "setPanes",
      "setSidebarOpen",
      "setWrap",
    ])
  })
})
