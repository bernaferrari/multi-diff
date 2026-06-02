import { describe, expect, it } from "vitest";

import { searchDiffContent } from "./content-search-state";
import { testFileDiff, testParsedPane } from "./test-builders";

describe("content search", () => {
  it("searches changed file content instead of filtering file names", () => {
    const file = testFileDiff("app/search.ts", 1, 1);
    file.additionLines = ["const query = title.toLowerCase()"];
    file.deletionLines = ["const title = item.label"];
    file.hunks[0] = {
      ...file.hunks[0],
      hunkContent: [
        {
          additions: 1,
          additionLineIndex: 0,
          deletions: 1,
          deletionLineIndex: 0,
          type: "change",
        },
      ],
    };

    expect(
      searchDiffContent({
        panes: [testParsedPane("a", [file])],
        query: "tolower",
      }),
    ).toEqual([
      expect.objectContaining({
        fileName: "app/search.ts",
        lineNumber: 1,
        paneId: "a",
        preview: "const query = title.toLowerCase()",
        side: "added",
      }),
    ]);
  });

  it("returns no matches for an empty query", () => {
    expect(
      searchDiffContent({
        panes: [testParsedPane("a", [testFileDiff("app/a.ts", 1, 0)])],
        query: " ",
      }),
    ).toEqual([]);
  });
});
