import { describe, expect, it } from "vitest"

import {
  DIFF_EMPTY_CODE_HEIGHT,
  DIFF_FILE_HEADER_HEIGHT,
  DIFF_LINE_HEIGHT_PX,
} from "./diff-render-metrics"
import { estimateCodeHeight } from "./lane-metrics"
import { testFileDiff, testPaneView } from "./test-builders"

describe("estimateCodeHeight", () => {
  it("uses a compact fallback when there are no files", () => {
    expect(estimateCodeHeight(testPaneView("a", []))).toBe(
      DIFF_EMPTY_CODE_HEIGHT
    )
  })

  it("adds a stable header and rendered-line estimate per file", () => {
    const view = testPaneView("a", [
      testFileDiff("app/a.ts", 2, 1),
      testFileDiff("app/b.ts", 8, 2),
    ])

    expect(estimateCodeHeight(view)).toBe(
      DIFF_FILE_HEADER_HEIGHT +
        9 * DIFF_LINE_HEIGHT_PX +
        DIFF_FILE_HEADER_HEIGHT +
        16 * DIFF_LINE_HEIGHT_PX
    )
  })
})
