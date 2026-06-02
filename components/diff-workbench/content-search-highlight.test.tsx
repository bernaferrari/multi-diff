import { describe, expect, it } from "vitest";

import { getHighlightedTextParts } from "./content-search-highlight";

describe("content search highlight", () => {
  it("splits text into case-insensitive highlighted matches", () => {
    expect(getHighlightedTextParts("Query query QUERY", "query")).toEqual([
      { text: "Query", type: "match" },
      { text: " ", type: "text" },
      { text: "query", type: "match" },
      { text: " ", type: "text" },
      { text: "QUERY", type: "match" },
    ]);
  });

  it("keeps unmatched text as a single part", () => {
    expect(getHighlightedTextParts("const value = 1", "query")).toEqual([
      { text: "const value = 1", type: "text" },
    ]);
  });
});
