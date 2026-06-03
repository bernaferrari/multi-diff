import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DiffStats, HighlightMatch } from "./file-tree-row-parts";
import type { FileRow } from "../shared/types";

describe("file tree row parts", () => {
  it("highlights matching text inside file names", () => {
    const html = renderToStaticMarkup(
      createElement(HighlightMatch, { text: "search.ts", query: "ar" }),
    );

    expect(html).toContain("se");
    expect(html).toContain("<mark");
    expect(html).toContain(">ar</mark>");
    expect(html).toContain("ch.ts");
  });

  it("matches case-insensitively while preserving original text", () => {
    expect(
      renderToStaticMarkup(createElement(HighlightMatch, { text: "Route.ts", query: "ro" })),
    ).toContain(">Ro</mark>ute.ts");
  });

  it("returns the original text for blank queries", () => {
    expect(
      renderToStaticMarkup(createElement(HighlightMatch, { text: "route.ts", query: "  " })),
    ).toBe("route.ts");
  });

  it("keeps repeated patch counts out of the compact stats slot", () => {
    const row: FileRow = {
      additions: 1404,
      deletions: 1,
      name: "packages/engine.io/lib/contrib/socket.ts",
      occurrencesByLane: { a: 6, b: 7, c: 6 },
      panes: {},
      presentIn: ["a", "b", "c"],
    };

    const html = renderToStaticMarkup(createElement(DiffStats, { row }));

    expect(html).toContain("+1404");
    expect(html).toContain("-1");
    expect(html).not.toContain("x6");
    expect(html).not.toContain("x7");
  });
});
