import { describe, expect, it } from "vitest";

import {
  getContentSearchMatchRanges,
  getSearchHighlightTarget,
} from "./content-search-dom-highlight";

describe("content search DOM highlight", () => {
  it("creates an inline highlight target for the selected file", () => {
    expect(
      getSearchHighlightTarget(
        {
          fileName: "app/search.ts",
          lineNumber: 12,
          paneId: "a",
          query: "search",
          side: "added",
          token: 1,
        },
        "a",
        "app/search.ts",
      ),
    ).toEqual({
      lineNumber: 12,
      paneId: "a",
      query: "search",
      side: "added",
    });
  });

  it("does not highlight empty, unnumbered, wrong-lane, or wrong-file targets", () => {
    expect(
      getSearchHighlightTarget(
        {
          fileName: "app/search.ts",
          lineNumber: 12,
          paneId: "a",
          query: " ",
          side: "added",
          token: 1,
        },
        "a",
        "app/search.ts",
      ),
    ).toBeNull();
    expect(
      getSearchHighlightTarget(
        {
          fileName: "app/search.ts",
          lineNumber: null,
          paneId: "a",
          query: "search",
          side: "added",
          token: 1,
        },
        "a",
        "app/search.ts",
      ),
    ).toBeNull();
    expect(
      getSearchHighlightTarget(
        {
          fileName: "app/search.ts",
          lineNumber: 12,
          paneId: "a",
          query: "search",
          side: "added",
          token: 1,
        },
        "b",
        "app/search.ts",
      ),
    ).toBeNull();
    expect(
      getSearchHighlightTarget(
        {
          fileName: "app/search.ts",
          lineNumber: 12,
          paneId: "a",
          query: "search",
          side: "added",
          token: 1,
        },
        "a",
        "app/other.ts",
      ),
    ).toBeNull();
  });

  it("finds case-insensitive non-overlapping match ranges", () => {
    expect(getContentSearchMatchRanges("Search query search", "search")).toEqual([
      { end: 6, start: 0 },
      { end: 19, start: 13 },
    ]);
    expect(getContentSearchMatchRanges("aaaa", "aa")).toEqual([
      { end: 2, start: 0 },
      { end: 4, start: 2 },
    ]);
  });
});
