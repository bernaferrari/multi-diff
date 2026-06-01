import { describe, expect, it } from "vitest"

import { getImportLaneAssignments } from "./import-lane-assignment"
import type { Pane } from "./types"

describe("import lane assignment", () => {
  it("starts a single untargeted import at the first empty pane", () => {
    expect(
      getImportLaneAssignments({
        fileCount: 1,
        panes: [pane("a"), pane("b", ""), pane("c")],
      }).lanes
    ).toEqual(["b"])
    expect(
      getImportLaneAssignments({
        fileCount: 2,
        panes: [pane("a"), pane("b", ""), pane("c")],
      }).lanes
    ).toEqual(["a", "b"])
    expect(
      getImportLaneAssignments({
        fileCount: 1,
        panes: [pane("a"), pane("b"), pane("c")],
        target: "c",
      }).lanes
    ).toEqual(["c"])
  })

  it("assigns files from the start lane unless a file pins its lane", () => {
    expect(
      getImportLaneAssignments({
        fileCount: 3,
        panes: [pane("a"), pane("b", ""), pane("c")],
        targets: [undefined, undefined, "c"],
      }).lanes
    ).toEqual(["a", "b", "c"])

    expect(
      getImportLaneAssignments({
        fileCount: 3,
        panes: [pane("a")],
        target: "b",
      }).lanes
    ).toEqual(["b", "c", "d"])
  })

  it("expands lane count for targeted and explicitly pinned imports", () => {
    expect(
      getImportLaneAssignments({
        fileCount: 1,
        panes: [pane("a"), pane("b")],
        target: "c",
      }).laneCount
    ).toBe(3)

    expect(
      getImportLaneAssignments({
        fileCount: 1,
        panes: [pane("a")],
        targets: ["e"],
      }).laneCount
    ).toBe(5)

    expect(
      getImportLaneAssignments({
        fileCount: 3,
        panes: [pane("a")],
      }).laneCount
    ).toBe(3)
  })
})

function pane(id: string, text = `diff-${id}`): Pane {
  return {
    id,
    label: `Diff ${id.toUpperCase()}`,
    text,
    filename: `${id}.patch`,
  }
}
