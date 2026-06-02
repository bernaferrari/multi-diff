import { describe, expect, it } from "vitest";

import {
  buildDiffCodeItems,
  buildFileRows,
  createPane,
  normalizePatchInput,
  parsePane,
} from "./diff-data";
import { testFileDiff, testParsedPane } from "./test-builders";

const patchWithBlankLines = `diff --git a/example.ts b/example.ts
index 1111111..2222222 100644
--- a/example.ts
+++ b/example.ts
@@ -1,3 +1,5 @@
 export function example() {
+
+  const value = 1
   return true
 }
`;

describe("diff data helpers", () => {
  it("normalizes CRLF and empty raw lines before parser input", () => {
    expect(normalizePatchInput("a\r\n\r\nb\r")).toBe("a\n \nb\n ");
  });

  it("creates canonical pane labels", () => {
    expect(createPane("c", "patch", "file.patch")).toEqual({
      id: "c",
      label: "Diff C",
      text: "patch",
      filename: "file.patch",
    });
  });

  it("parses valid patches that contain blank context lines", () => {
    const parsed = parsePane(createPane("a", patchWithBlankLines));

    expect(parsed.error).toBeUndefined();
    expect(parsed.files.map((item) => item.name)).toEqual(["example.ts"]);
    expect(parsed.items.map((item) => item.id)).toEqual(["a-0-example.ts"]);
    expect(parsed.additions).toBe(2);
    expect(parsed.deletions).toBe(0);
  });

  it("builds diff items and lookup ids from file metadata", () => {
    const files = [testFileDiff("a.ts", 1, 0), testFileDiff("b.ts", 0, 1)];
    const { idByName, items, occurrenceById } = buildDiffCodeItems("b", files);

    expect(items.map((item) => item.id)).toEqual(["b-0-a.ts", "b-1-b.ts"]);
    expect(idByName.get("b.ts")).toBe("b-1-b.ts");
    expect(occurrenceById.size).toBe(0);
  });

  it("tracks repeated file occurrences while keeping navigation on the first instance", () => {
    const files = [
      testFileDiff("same.ts", 1, 0),
      testFileDiff("other.ts", 0, 1),
      testFileDiff("same.ts", 2, 2),
    ];
    const { idByName, items, occurrenceById } = buildDiffCodeItems("a", files);

    expect(items.map((item) => item.id)).toEqual(["a-0-same.ts", "a-1-other.ts", "a-2-same.ts"]);
    expect(idByName.get("same.ts")).toBe("a-0-same.ts");
    expect(occurrenceById.get("a-0-same.ts")).toEqual({ index: 1, total: 2 });
    expect(occurrenceById.get("a-2-same.ts")).toEqual({ index: 2, total: 2 });
  });

  it("returns an error payload instead of throwing for invalid patch text", () => {
    const parsed = parsePane(createPane("a", "diff --git a/a.ts b/a.ts\n@@ bad"));

    expect(parsed.files).toEqual([]);
    expect(parsed.items).toEqual([]);
    expect(parsed.error).toBeTruthy();
  });

  it("aggregates file rows across panes and sorts by file path", () => {
    const rows = buildFileRows([
      testParsedPane("a", [testFileDiff("shared.ts", 2, 1), testFileDiff("a-only.ts", 10, 0)]),
      testParsedPane("b", [testFileDiff("shared.ts", 3, 4), testFileDiff("b-only.ts", 1, 1)]),
    ]);

    expect(rows.map((row) => row.name)).toEqual(["a-only.ts", "b-only.ts", "shared.ts"]);
    expect(rows[2]).toMatchObject({
      additions: 5,
      deletions: 5,
      presentIn: ["a", "b"],
    });
    expect(rows[2].panes.a?.name).toBe("shared.ts");
    expect(rows[2].panes.b?.name).toBe("shared.ts");
  });

  it("deduplicates pane presence when a pane contains repeated file names", () => {
    const rows = buildFileRows([
      testParsedPane("a", [testFileDiff("shared.ts", 2, 1), testFileDiff("shared.ts", 3, 0)]),
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      additions: 5,
      deletions: 1,
      occurrences: 2,
      occurrencesByLane: { a: 2 },
      presentIn: ["a"],
    });
  });
});
