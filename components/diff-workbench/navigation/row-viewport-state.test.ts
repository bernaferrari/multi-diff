import { describe, expect, it } from "vitest";

import { getActiveRowsFile, getRowNavigationTop } from "./row-viewport-state";

type RowViewportScroller = Parameters<typeof getActiveRowsFile>[0];

describe("row viewport state", () => {
  it("selects the latest row block before the activation line", () => {
    const scroller = rowScroller({
      height: 300,
      rows: [row("a.ts", "a", 0, 80), row("b.ts", "b", 40, 120), row("c.ts", "c", 120, 200)],
    });

    expect(getActiveRowsFile(scroller)).toEqual({
      laneId: "b",
      name: "b.ts",
    });
  });

  it("falls back to the first row when no block reaches the activation line", () => {
    const scroller = rowScroller({
      height: 100,
      rows: [row("a.ts", "a", 80, 160)],
    });

    expect(getActiveRowsFile(scroller)).toEqual({
      laneId: "a",
      name: "a.ts",
    });
  });

  it("returns null when no row blocks exist", () => {
    expect(getActiveRowsFile(rowScroller({ height: 100, rows: [] }))).toBeNull();
  });

  it("computes the top-aligned scroll position for reachable row blocks", () => {
    const scroller = rowScroller({
      height: 100,
      rows: [row("a.ts", "a", 20, 60)],
      scrollHeight: 400,
      scrollTop: 80,
    });
    const block = Array.from(scroller.querySelectorAll("[data-row-file-name]"))[0];

    expect(block ? getRowNavigationTop(scroller, block) : null).toBe(100);
  });

  it("clamps row navigation to the real bottom when start alignment is impossible", () => {
    const scroller = rowScroller({
      height: 100,
      rows: [row("last.ts", "a", 340, 380)],
      scrollHeight: 400,
      scrollTop: 0,
    });
    const block = Array.from(scroller.querySelectorAll("[data-row-file-name]"))[0];

    expect(block ? getRowNavigationTop(scroller, block) : null).toBe(300);
  });
});

function row(name: string, laneId: string, top: number, bottom: number) {
  return { bottom, laneId, name, top };
}

function rowScroller({
  height,
  rows,
  scrollHeight = height,
  scrollTop = 0,
}: {
  height: number;
  rows: ReturnType<typeof row>[];
  scrollHeight?: number;
  scrollTop?: number;
}): RowViewportScroller {
  return {
    clientHeight: height,
    getBoundingClientRect: () => ({ bottom: height, height, top: 0 }),
    querySelectorAll: () =>
      rows.map((item) => ({
        dataset: {
          rowFileName: item.name,
          rowLaneId: item.laneId,
        },
        getBoundingClientRect: () => ({
          bottom: item.bottom,
          height: item.bottom - item.top,
          top: item.top,
        }),
      })),
    scrollHeight,
    scrollTop,
  };
}
