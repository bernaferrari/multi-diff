import { describe, expect, it } from "vitest";

import { DIFF_LINE_HEIGHT_PX, ROW_DIFF_METRICS } from "./diff-render-metrics";

describe("diff render metrics", () => {
  it("keeps the diff renderer line height centralized", () => {
    expect(DIFF_LINE_HEIGHT_PX).toBe(20);
  });

  it("keeps row diff library metrics centralized", () => {
    expect(ROW_DIFF_METRICS).toEqual({
      diffHeaderHeight: 0,
      hunkLineCount: 50,
      hunkSeparatorHeight: 4,
      lineHeight: 20,
      paddingBottom: 0,
      paddingTop: 0,
      spacing: 0,
    });
  });
});
