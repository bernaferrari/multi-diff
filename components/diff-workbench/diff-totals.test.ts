import { describe, expect, it } from "vitest";

import { changedLinesFor, diffTotalsFor, diffTotalsForFiles } from "./diff-totals";
import { testFileDiff } from "./test-builders";

describe("diff totals", () => {
  it("computes additions and deletions for a file", () => {
    expect(diffTotalsFor(testFileDiff("a.ts", 3, 2))).toEqual({
      additions: 3,
      deletions: 2,
    });
    expect(changedLinesFor(testFileDiff("a.ts", 3, 2))).toBe(5);
  });

  it("computes additions and deletions across files", () => {
    expect(diffTotalsForFiles([testFileDiff("a.ts", 3, 2), testFileDiff("b.ts", 4, 1)])).toEqual({
      additions: 7,
      deletions: 3,
    });
  });
});
