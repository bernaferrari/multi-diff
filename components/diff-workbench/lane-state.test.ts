import { describe, expect, it } from "vitest";

import { canHideAnotherLane, clearLane, swapLaneContents, toggleHiddenLane } from "./lane-state";
import type { Pane } from "./types";

function pane(id: string, text = `diff-${id}`): Pane {
  return {
    id,
    label: `Diff ${id.toUpperCase()}`,
    text,
    filename: `${id}.patch`,
  };
}

describe("lane state", () => {
  it("allows hiding lanes only while at least one lane remains visible", () => {
    expect(canHideAnotherLane(new Set(), 1)).toBe(false);
    expect(canHideAnotherLane(new Set(), 3)).toBe(true);
    expect(canHideAnotherLane(new Set(["a", "b"]), 3)).toBe(false);
  });

  it("does not allow hiding every lane", () => {
    const hidden = toggleHiddenLane(new Set(["a", "b"]), "c", 3);

    expect([...hidden].sort()).toEqual(["a", "b"]);
  });

  it("toggles an already-hidden lane back on", () => {
    const hidden = toggleHiddenLane(new Set(["a"]), "a", 3);

    expect([...hidden]).toEqual([]);
  });

  it("clears a lane without touching other lane contents", () => {
    const panes = [pane("a"), pane("b")];
    const cleared = clearLane(panes, "b");

    expect(cleared[0]).toEqual(panes[0]);
    expect(cleared[1]).toMatchObject({
      id: "b",
      filename: undefined,
      text: "",
    });
  });

  it("swaps lane contents without changing lane labels", () => {
    const panes = [pane("a"), pane("b")];
    const swapped = swapLaneContents(panes, "a", "b");

    expect(swapped[0]).toMatchObject({
      id: "a",
      label: "Diff A",
      filename: "b.patch",
      text: "diff-b",
    });
    expect(swapped[1]).toMatchObject({
      id: "b",
      label: "Diff B",
      filename: "a.patch",
      text: "diff-a",
    });
  });

  it("ignores invalid lane swaps", () => {
    const panes = [pane("a"), pane("b")];

    expect(swapLaneContents(panes, "a", "a")).toBe(panes);
    expect(swapLaneContents(panes, "a", "c")).toBe(panes);
  });
});
