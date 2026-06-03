import { describe, expect, it } from "vitest";

import { getViewportLaneMoveState, getViewportLayoutState } from "./viewport-layout-state";

describe("viewport layout state", () => {
  it("derives viewport layout classes by mode", () => {
    expect(
      getViewportLayoutState({
        displayedPaneCount: 3,
        layout: "columns",
        visiblePaneCount: 0,
      }).sectionClass,
    ).toContain("overflow-hidden");
    expect(
      getViewportLayoutState({
        displayedPaneCount: 1,
        layout: "columns",
        visiblePaneCount: 1,
      }).sectionClass,
    ).toContain("p-3");
    expect(
      getViewportLayoutState({
        displayedPaneCount: 3,
        layout: "rows",
        visiblePaneCount: 0,
      }).sectionClass,
    ).toContain("overflow-y-auto");
    expect(
      getViewportLayoutState({
        displayedPaneCount: 3,
        layout: "rows",
        visiblePaneCount: 0,
      }).sectionClass,
    ).toContain("pb-3");
    expect(
      getViewportLayoutState({
        displayedPaneCount: 3,
        layout: "columns",
        visiblePaneCount: 0,
      }).paneStackClass,
    ).toContain("grid");
    expect(
      getViewportLayoutState({
        displayedPaneCount: 3,
        layout: "rows",
        visiblePaneCount: 0,
      }).paneStackClass,
    ).toContain("flex flex-col");
  });

  it("only applies grid template style in column mode", () => {
    expect(
      getViewportLayoutState({
        displayedPaneCount: 3,
        layout: "columns",
        visiblePaneCount: 0,
      }).paneStackStyle,
    ).toEqual({
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    });
    expect(
      getViewportLayoutState({
        displayedPaneCount: 3,
        layout: "rows",
        visiblePaneCount: 0,
      }).paneStackStyle,
    ).toBeUndefined();
  });

  it("uses distinct empty-state copy for hidden lanes and focused files", () => {
    expect(
      getViewportLayoutState({
        displayedPaneCount: 0,
        layout: "columns",
        visiblePaneCount: 0,
      }).emptyMessage,
    ).toBe("All lanes hidden — re-enable one from the chips above.");
    expect(
      getViewportLayoutState({
        displayedPaneCount: 0,
        layout: "columns",
        visiblePaneCount: 1,
      }).emptyMessage,
    ).toBe("No visible lane modifies this file.");
  });

  it("derives adjacent lane move targets by position", () => {
    expect(getViewportLaneMoveState(["a", "b", "c"], 0)).toEqual({
      leftPaneId: null,
      rightPaneId: "b",
    });
    expect(getViewportLaneMoveState(["a", "b", "c"], 1)).toEqual({
      leftPaneId: "a",
      rightPaneId: "c",
    });
    expect(getViewportLaneMoveState(["a", "b", "c"], 2)).toEqual({
      leftPaneId: "b",
      rightPaneId: null,
    });
  });
});
