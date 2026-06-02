import { describe, expect, it } from "vitest";

import { getCodeViewSearchSelection, getSearchSelectedLineRange } from "./search-line-selection";
import { testFileDiff, testPaneView } from "./test-builders";

describe("search line selection", () => {
  it("selects the matched addition line for a row file diff", () => {
    expect(
      getSearchSelectedLineRange("a", "app/a.ts", {
        fileName: "app/a.ts",
        lineNumber: 12,
        paneId: "a",
        side: "added",
        token: 1,
      }),
    ).toEqual({
      end: 12,
      endSide: "additions",
      side: "additions",
      start: 12,
    });
  });

  it("selects the matched CodeView item for columns", () => {
    const view = testPaneView("b", [testFileDiff("app/a.ts", 1, 0)]);

    expect(
      getCodeViewSearchSelection(view, {
        fileName: "app/a.ts",
        lineNumber: 4,
        paneId: "b",
        side: "deleted",
        token: 1,
      }),
    ).toEqual({
      id: "b-0-app/a.ts",
      range: {
        end: 4,
        endSide: "deletions",
        side: "deletions",
        start: 4,
      },
    });
  });
});
