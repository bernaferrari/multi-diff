import { describe, expect, it } from "vitest";

import {
  getDisplayedPanes,
  getSharedFileCount,
  getVisibleFocusFile,
  partitionFileRows,
} from "./workbench-view-state";
import { testFileDiff, testFileRow, testParsedPane } from "./test-builders";

describe("workbench view state", () => {
  it("partitions file rows by hidden filename", () => {
    const visible = testFileRow("visible.ts");
    const hidden = testFileRow("hidden.ts");

    expect(partitionFileRows([visible, hidden], new Set(["hidden.ts"]))).toEqual({
      fileRows: [visible],
      hiddenFileRows: [hidden],
    });
  });

  it("keeps focus only when the file is visible", () => {
    const rows = [testFileRow("visible.ts")];

    expect(getVisibleFocusFile("visible.ts", rows)).toBe("visible.ts");
    expect(getVisibleFocusFile("hidden.ts", rows)).toBeNull();
    expect(getVisibleFocusFile(null, rows)).toBeNull();
  });

  it("narrows displayed panes to panes containing the focused file", () => {
    const panes = [
      testParsedPane("a", [testFileDiff("a.ts", 1, 0)]),
      testParsedPane("b", [testFileDiff("focused.ts", 1, 0)]),
    ];

    expect(getDisplayedPanes(panes, null)).toBe(panes);
    expect(getDisplayedPanes(panes, "focused.ts").map((pane) => pane.id)).toEqual(["b"]);
  });

  it("counts files shared by every pane with visible files", () => {
    const fileRows = [
      testFileRow("shared.ts", { presentIn: ["a", "b"] }),
      testFileRow("a-only.ts", { presentIn: ["a"] }),
    ];
    const visiblePanes = [
      testParsedPane("a", [testFileDiff("shared.ts", 1, 0), testFileDiff("a-only.ts", 1, 0)]),
      testParsedPane("b", [testFileDiff("shared.ts", 1, 0)]),
      testParsedPane("c", [testFileDiff("hidden.ts", 1, 0)]),
    ];

    expect(
      getSharedFileCount({
        fileRows,
        hiddenFiles: new Set(["hidden.ts"]),
        visiblePanes,
      }),
    ).toBe(1);

    expect(
      getSharedFileCount({
        fileRows,
        hiddenFiles: new Set(),
        visiblePanes: [visiblePanes[0]],
      }),
    ).toBe(0);
  });
});
