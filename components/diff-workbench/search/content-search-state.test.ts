import { describe, expect, it } from "vitest";

import {
  buildContentSearchIndex,
  searchContentIndex,
  searchDiffContent,
} from "./content-search-state";
import { testFileDiff, testParsedPane } from "../shared/test-builders";

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
        occurrenceIndex: 1,
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

  it("reuses an indexed line set for repeated searches", () => {
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

    const index = buildContentSearchIndex([testParsedPane("a", [file])]);

    expect(searchContentIndex({ index, query: "title" })).toHaveLength(2);
    expect(searchContentIndex({ index, query: "tolower" })).toEqual([
      expect.objectContaining({
        fileName: "app/search.ts",
        occurrenceIndex: 1,
        side: "added",
      }),
    ]);
  });

  it("tracks repeated file occurrences so navigation can target the matching diff", () => {
    const first = testFileDiff("app/search.ts", 1, 0);
    const second = testFileDiff("app/search.ts", 1, 0);
    first.additionLines = ["first copy"];
    second.additionLines = ["second copy"];
    for (const file of [first, second]) {
      file.hunks[0] = {
        ...file.hunks[0],
        hunkContent: [
          {
            additions: 1,
            additionLineIndex: 0,
            deletions: 0,
            deletionLineIndex: 0,
            type: "change",
          },
        ],
      };
    }

    expect(
      searchDiffContent({
        panes: [testParsedPane("a", [first, second])],
        query: "copy",
      }),
    ).toEqual([
      expect.objectContaining({ occurrenceIndex: 1, preview: "first copy" }),
      expect.objectContaining({ occurrenceIndex: 2, preview: "second copy" }),
    ]);
  });
});
