import { describe, expect, it } from "vitest"

import { getActiveScrollFile } from "./scroll-spy-state"
import {
  testFileDiff,
  testPaneView as buildTestPaneView,
} from "./test-builders"
import type { PaneView } from "./types"

describe("scroll spy state", () => {
  it("selects the latest diff before the activation line", () => {
    const view = testPaneView(["a.ts", "b.ts", "c.ts"])

    expect(
      getActiveScrollFile(view, metrics({ height: 200, scrollTop: 110 }))
    ).toEqual({
      intraOffset: 10,
      name: "b.ts",
      top: 100,
    })
  })

  it("falls back to the first diff when no item top is before activation", () => {
    const view = testPaneView(["a.ts"])

    expect(
      getActiveScrollFile(view, metrics({ height: 100, scrollTop: 0 }))
    ).toMatchObject({
      name: "a.ts",
      top: 0,
    })
  })

  it("returns null for empty views", () => {
    expect(
      getActiveScrollFile(
        testPaneView([]),
        metrics({ height: 100, scrollTop: 0 })
      )
    ).toBeNull()
  })
})

function testPaneView(names: string[]): PaneView {
  const files = names.map((name) => testFileDiff(name, 1, 1))
  return buildTestPaneView("a", files)
}

function metrics({ height, scrollTop }: { height: number; scrollTop: number }) {
  return {
    getHeight: () => height,
    getScrollTop: () => scrollTop,
    getTopForItem: (id: string) => {
      const index = Number(id.split("-")[1])
      return Number.isFinite(index) ? index * 100 : undefined
    },
  }
}
