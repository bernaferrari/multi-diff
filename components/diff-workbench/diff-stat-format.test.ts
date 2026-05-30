import { describe, expect, it } from "vitest"

import {
  formatAdditionCount,
  formatDeletionCount,
  formatDiffStatLabel,
  formatDiffStatSummary,
  getVisibleDiffStatParts,
} from "./diff-stat-format"

describe("diff stat formatting", () => {
  it("formats compact visual stat text consistently", () => {
    expect(formatAdditionCount(12)).toBe("+12")
    expect(formatDeletionCount(3)).toBe("−3")
    expect(formatDiffStatSummary({ additions: 12, deletions: 3 })).toBe(
      "+12 −3"
    )
  })

  it("formats accessible stat text without symbols", () => {
    expect(formatDiffStatLabel({ additions: 12, deletions: 3 })).toBe(
      "12 additions, 3 deletions"
    )
  })

  it("omits zero-value stat sides for compact file-tree rows", () => {
    expect(getVisibleDiffStatParts({ additions: 7, deletions: 0 })).toEqual({
      additions: "+7",
      deletions: null,
    })
    expect(getVisibleDiffStatParts({ additions: 0, deletions: 3 })).toEqual({
      additions: null,
      deletions: "−3",
    })
  })
})
