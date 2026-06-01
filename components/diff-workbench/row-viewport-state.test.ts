import { describe, expect, it } from "vitest"

import { getActiveRowsFile } from "./row-viewport-state"

type RowViewportScroller = Parameters<typeof getActiveRowsFile>[0]

describe("row viewport state", () => {
  it("selects the latest row block before the activation line", () => {
    const scroller = rowScroller({
      height: 300,
      rows: [
        row("a.ts", "a", 0, 80),
        row("b.ts", "b", 40, 120),
        row("c.ts", "c", 120, 200),
      ],
    })

    expect(getActiveRowsFile(scroller)).toEqual({
      laneId: "b",
      name: "b.ts",
    })
  })

  it("falls back to the first row when no block reaches the activation line", () => {
    const scroller = rowScroller({
      height: 100,
      rows: [row("a.ts", "a", 80, 160)],
    })

    expect(getActiveRowsFile(scroller)).toEqual({
      laneId: "a",
      name: "a.ts",
    })
  })

  it("returns null when no row blocks exist", () => {
    expect(getActiveRowsFile(rowScroller({ height: 100, rows: [] }))).toBeNull()
  })
})

function row(name: string, laneId: string, top: number, bottom: number) {
  return { bottom, laneId, name, top }
}

function rowScroller({
  height,
  rows,
}: {
  height: number
  rows: ReturnType<typeof row>[]
}): RowViewportScroller {
  return {
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
  }
}
