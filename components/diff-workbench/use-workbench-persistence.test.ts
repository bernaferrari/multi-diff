import { describe, expect, it, vi } from "vitest"

import { applyStoredWorkbenchState } from "./use-workbench-persistence"
import type { Pane } from "./types"

type WorkbenchPersistenceSetters = Parameters<
  typeof applyStoredWorkbenchState
>[1]

describe("applyStoredWorkbenchState", () => {
  it("does nothing without saved state", () => {
    const setters = persistenceSetters()

    applyStoredWorkbenchState(null, setters)

    expect(Object.values(setters).every((setter) => !setter.mock.calls.length))
      .toBe(true)
  })

  it("applies only present saved fields", () => {
    const setters = persistenceSetters()
    const panes: Pane[] = [
      {
        id: "a",
        label: "Diff A",
        text: "diff",
      },
    ]

    applyStoredWorkbenchState(
      {
        diffStyle: "split",
        laneMarkerStyle: "bars",
        lineNumbers: false,
        notes: "note",
        panes,
        sidebarOpen: false,
      },
      setters
    )

    expect(setters.setDiffStyle).toHaveBeenCalledWith("split")
    expect(setters.setLaneMarkerStyle).toHaveBeenCalledWith("bars")
    expect(setters.setLineNumbers).toHaveBeenCalledWith(false)
    expect(setters.setNotes).toHaveBeenCalledWith("note")
    expect(setters.setPanes).toHaveBeenCalledWith(panes)
    expect(setters.setSidebarOpen).toHaveBeenCalledWith(false)
    expect(setters.setLayout).not.toHaveBeenCalled()
    expect(setters.setWrap).not.toHaveBeenCalled()
  })
})

function persistenceSetters() {
  return {
    setDiffStyle: vi.fn<WorkbenchPersistenceSetters["setDiffStyle"]>(),
    setLaneMarkerStyle:
      vi.fn<WorkbenchPersistenceSetters["setLaneMarkerStyle"]>(),
    setLayout: vi.fn<WorkbenchPersistenceSetters["setLayout"]>(),
    setLineNumbers: vi.fn<WorkbenchPersistenceSetters["setLineNumbers"]>(),
    setNotes: vi.fn<WorkbenchPersistenceSetters["setNotes"]>(),
    setPanes: vi.fn<WorkbenchPersistenceSetters["setPanes"]>(),
    setSidebarOpen: vi.fn<WorkbenchPersistenceSetters["setSidebarOpen"]>(),
    setWrap: vi.fn<WorkbenchPersistenceSetters["setWrap"]>(),
  }
}
