import { describe, expect, it } from "vitest"

import { getWorkbenchActionState } from "./workbench-action-state"

describe("workbench action state", () => {
  it("toggles a focused file by name", () => {
    const state = getWorkbenchActionState()

    expect(state.toggleFileFocus(null, "a.ts")).toBe("a.ts")
    expect(state.toggleFileFocus("a.ts", "a.ts")).toBeNull()
    expect(state.toggleFileFocus("a.ts", "b.ts")).toBe("b.ts")
  })

  it("toggles notes open state", () => {
    const state = getWorkbenchActionState()

    expect(state.toggleNotesOpen(false)).toBe(true)
    expect(state.toggleNotesOpen(true)).toBe(false)
  })

  it("creates the reset state for a fresh sample workbench", () => {
    const state = getWorkbenchActionState()
    const reset = state.getResetState()
    reset.panes[0].text = "changed"
    const nextReset = state.getResetState()

    expect(reset.activeFile).toBeNull()
    expect(reset.focusFile).toBeNull()
    expect(reset.hidden.size).toBe(0)
    expect(reset.hiddenFiles.size).toBe(0)
    expect(reset.panes.map((pane) => pane.id)).toEqual(["a", "b", "c"])
    expect(nextReset.panes[0].text).not.toBe("changed")
  })
})
