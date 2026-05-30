import { describe, expect, it } from "vitest"

import { getLaneHeaderState } from "./lane-header-state"
import { testFileDiff, testPaneView } from "./test-builders"

describe("lane header state", () => {
  it("hides stats for empty lanes and lanes without rendered items", () => {
    expect(
      getLaneHeaderState({
        isEmpty: true,
        label: "Diff A",
        view: testPaneView("a", []),
      }).stats
    ).toBeNull()
  })

  it("returns stable additions and deletions for populated lanes", () => {
    expect(
      getLaneHeaderState({
        isEmpty: false,
        label: "Diff A",
        view: testPaneView("a", [testFileDiff("app/a.ts", 3, 2)]),
      }).stats
    ).toEqual({
      additions: 3,
      deletions: 2,
    })
  })

  it("derives the lane actions model from label and empty state", () => {
    expect(
      getLaneHeaderState({
        isEmpty: false,
        label: "Diff B",
        view: testPaneView("b", [testFileDiff("app/b.ts", 1, 1)]),
      }).actions
    ).toEqual({
      canClear: true,
      label: "Diff B actions",
    })

    expect(
      getLaneHeaderState({
        isEmpty: true,
        label: "Diff C",
        view: testPaneView("c", []),
      }).actions
    ).toEqual({
      canClear: false,
      label: "Diff C actions",
    })
  })
})
