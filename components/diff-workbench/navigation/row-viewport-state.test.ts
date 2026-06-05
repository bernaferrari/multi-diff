import { describe, expect, it } from "vitest";

import {
  getActiveRowsFile,
  getRowNavigationLineTop,
  getRowNavigationTargetLine,
  getRowNavigationTop,
} from "./row-viewport-state";
import { testFileDiff } from "../shared/test-builders";

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

  it("finds a rendered target line inside a diff shadow root", () => {
    const targetLine = lineElement("42", "change-addition");
    const shadowRoot = queryRoot([targetLine]);
    const host = queryElement([], shadowRoot);
    const block = queryRoot([host]);

    expect(getRowNavigationTargetLine({ lineNumber: 42, root: block, side: "additions" })).toBe(
      targetLine,
    );
    expect(getRowNavigationTargetLine({ lineNumber: 42, root: block, side: "deletions" })).toBe(
      null,
    );
  });

  it("computes a row line offset from diff metadata when the line is not rendered", () => {
    const file = testFileDiff("large.ts", 8, 3);
    file.hunks[0] = {
      ...file.hunks[0],
      additionCount: 8,
      additionStart: 20,
      deletionCount: 3,
      deletionStart: 20,
      hunkContent: [
        {
          additionLineIndex: 0,
          deletionLineIndex: 0,
          lines: 2,
          type: "context",
        },
        {
          additions: 2,
          additionLineIndex: 2,
          deletions: 3,
          deletionLineIndex: 2,
          type: "change",
        },
      ],
      splitLineCount: 5,
      unifiedLineCount: 7,
    };

    expect(
      getRowNavigationLineTop({
        diffStyle: "unified",
        fileDiff: file,
        lineNumber: 22,
        side: "additions",
      }),
    ).toBe(140);
    expect(
      getRowNavigationLineTop({
        diffStyle: "split",
        fileDiff: file,
        lineNumber: 22,
        side: "additions",
      }),
    ).toBe(80);
  });
});

function row(name: string, laneId: string, top: number, bottom: number) {
  return { bottom, laneId, name, top };
}

function lineElement(lineNumber: string, lineType: string) {
  return {
    getAttribute: (name: string) =>
      name === "data-line-type" ? lineType : name === "data-line" ? lineNumber : null,
    shadowRoot: null,
  } as unknown as HTMLElement;
}

function queryElement(children: HTMLElement[], shadowRoot: ParentNode | null = null) {
  return {
    getAttribute: () => null,
    querySelectorAll: (selector: string) => queryChildren(children, selector),
    shadowRoot,
  } as unknown as HTMLElement;
}

function queryRoot(children: HTMLElement[]) {
  return {
    querySelectorAll: (selector: string) => queryChildren(children, selector),
  } as unknown as ParentNode;
}

function queryChildren(children: HTMLElement[], selector: string) {
  if (selector === "*") return children;

  const lineMatch = selector.match(/^\[data-line="(.+)"\]$/);
  if (!lineMatch) return [];

  return children.filter((child) => child.getAttribute("data-line") === lineMatch[1]);
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
