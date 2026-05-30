import { describe, expect, it } from "vitest"

import {
  DIFF_EMPTY_CODE_HEIGHT,
  DIFF_FILE_HEADER_HEIGHT,
  DIFF_LINE_HEIGHT_PX,
  DIFF_MIN_HUNK_CONTEXT_LINES,
  DIFF_MIN_RENDERED_LINES,
  DIFF_RENDERED_LINES_PER_HUNK,
} from "./diff-render-metrics"

describe("diff render metrics", () => {
  it("keeps code height estimation constants centralized", () => {
    expect(DIFF_EMPTY_CODE_HEIGHT).toBe(96)
    expect(DIFF_FILE_HEADER_HEIGHT).toBe(42)
    expect(DIFF_LINE_HEIGHT_PX).toBe(20)
    expect(DIFF_MIN_HUNK_CONTEXT_LINES).toBe(4)
    expect(DIFF_MIN_RENDERED_LINES).toBe(6)
    expect(DIFF_RENDERED_LINES_PER_HUNK).toBe(6)
  })
})
