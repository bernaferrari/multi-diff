import { describe, expect, it } from "vitest";

import { isContentSearchResultActive } from "./content-search-popover";

describe("content search popover", () => {
  const result = {
    fileName: "app/search.ts",
    id: "a:app/search.ts:added:12:0",
    lineNumber: 12,
    occurrenceIndex: 1,
    paneId: "a",
    paneLabel: "Diff A",
    preview: 'const query = searchParams.get("q")',
    side: "added",
  } as const;

  it("marks the result matching the current search target", () => {
    expect(
      isContentSearchResultActive(
        result,
        {
          fileName: "app/search.ts",
          lineNumber: 12,
          occurrenceIndex: 1,
          paneId: "a",
          query: "QUERY",
          side: "added",
          token: 1,
        },
        "query",
      ),
    ).toBe(true);
  });

  it("does not mark a different lane, line, side, file, or query", () => {
    expect(
      isContentSearchResultActive(
        result,
        {
          fileName: "app/search.ts",
          lineNumber: 12,
          occurrenceIndex: 1,
          paneId: "b",
          query: "query",
          side: "added",
          token: 1,
        },
        "query",
      ),
    ).toBe(false);
    expect(
      isContentSearchResultActive(
        result,
        {
          fileName: "app/search.ts",
          lineNumber: 13,
          occurrenceIndex: 1,
          paneId: "a",
          query: "query",
          side: "added",
          token: 1,
        },
        "query",
      ),
    ).toBe(false);
    expect(
      isContentSearchResultActive(
        result,
        {
          fileName: "app/search.ts",
          lineNumber: 12,
          occurrenceIndex: 1,
          paneId: "a",
          query: "query",
          side: "deleted",
          token: 1,
        },
        "query",
      ),
    ).toBe(false);
    expect(
      isContentSearchResultActive(
        result,
        {
          fileName: "app/other.ts",
          lineNumber: 12,
          occurrenceIndex: 1,
          paneId: "a",
          query: "query",
          side: "added",
          token: 1,
        },
        "query",
      ),
    ).toBe(false);
    expect(
      isContentSearchResultActive(
        result,
        {
          fileName: "app/search.ts",
          lineNumber: 12,
          occurrenceIndex: 1,
          paneId: "a",
          query: "search",
          side: "added",
          token: 1,
        },
        "query",
      ),
    ).toBe(false);
  });
});
