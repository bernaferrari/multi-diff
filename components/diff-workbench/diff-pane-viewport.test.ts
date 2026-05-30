import { describe, expect, it } from "vitest"

import { getViewportLayoutState } from "./diff-pane-viewport"
import { testParsedPane } from "./test-builders"

describe("diff pane viewport helpers", () => {
  it("derives viewport layout classes by mode", () => {
    expect(
      getViewportLayoutState({
        displayedPaneCount: 3,
        layout: "columns",
        visiblePanes: [],
      }).sectionClass
    ).toContain("overflow-hidden")
    expect(
      getViewportLayoutState({
        displayedPaneCount: 3,
        layout: "rows",
        visiblePanes: [],
      }).sectionClass
    ).toContain("overflow-y-auto")
    expect(
      getViewportLayoutState({
        displayedPaneCount: 3,
        layout: "columns",
        visiblePanes: [],
      }).paneStackClass
    ).toContain("grid")
    expect(
      getViewportLayoutState({
        displayedPaneCount: 3,
        layout: "rows",
        visiblePanes: [],
      }).paneStackClass
    ).toContain("flex flex-col")
  })

  it("only applies grid template style in column mode", () => {
    expect(
      getViewportLayoutState({
        displayedPaneCount: 3,
        layout: "columns",
        visiblePanes: [],
      }).paneStackStyle
    ).toEqual({
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    })
    expect(
      getViewportLayoutState({
        displayedPaneCount: 3,
        layout: "rows",
        visiblePanes: [],
      }).paneStackStyle
    ).toBeUndefined()
  })

  it("uses distinct empty-state copy for hidden lanes and focused files", () => {
    expect(
      getViewportLayoutState({
        displayedPaneCount: 0,
        layout: "columns",
        visiblePanes: [],
      }).emptyMessage
    ).toBe(
      "All lanes hidden — re-enable one from the chips above."
    )
    expect(
      getViewportLayoutState({
        displayedPaneCount: 0,
        layout: "columns",
        visiblePanes: [testParsedPane("a", [])],
      }).emptyMessage
    ).toBe(
      "No visible lane modifies this file."
    )
  })
})
