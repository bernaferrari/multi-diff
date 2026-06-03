import { describe, expect, it } from "vitest";

import { testFileDiff, testParsedPane } from "../shared/test-builders";
import { buildWorkbenchViewModel } from "./view-model";

describe("buildWorkbenchViewModel", () => {
  const parsed = [
    testParsedPane("a", [testFileDiff("shared.ts", 2, 1), testFileDiff("a-only.ts", 3, 0)]),
    testParsedPane("b", [testFileDiff("shared.ts", 4, 2), testFileDiff("b-only.ts", 1, 1)]),
    testParsedPane("c", [testFileDiff("shared.ts", 5, 0)]),
  ];

  it("builds visible file rows from visible lanes only", () => {
    const model = buildWorkbenchViewModel({
      focusFile: null,
      hidden: new Set(["c"]),
      hiddenFiles: new Set(),
      parsed,
    });

    expect(model.visiblePanes.map((item) => item.id)).toEqual(["a", "b"]);
    expect(model.fileRows.map((row) => row.name).sort()).toEqual([
      "a-only.ts",
      "b-only.ts",
      "shared.ts",
    ]);
    expect(model.sharedCount).toBe(1);
  });

  it("removes hidden files from pane render plans and tracks restorable rows", () => {
    const model = buildWorkbenchViewModel({
      focusFile: null,
      hidden: new Set(),
      hiddenFiles: new Set(["shared.ts"]),
      parsed,
    });

    expect(model.fileRows.map((row) => row.name).sort()).toEqual(["a-only.ts", "b-only.ts"]);
    expect(model.hiddenFileRows.map((row) => row.name)).toEqual(["shared.ts"]);
    expect(model.paneViews.get("a")?.files.map((item) => item.name)).toEqual(["a-only.ts"]);
    expect(model.indexActiveFile).toBeNull();
  });

  it("falls back to overview when focused file is no longer visible", () => {
    const model = buildWorkbenchViewModel({
      focusFile: "shared.ts",
      hidden: new Set(),
      hiddenFiles: new Set(["shared.ts"]),
      parsed,
    });

    expect(model.focused).toBeNull();
    expect(model.displayedPaneViews.map(({ pane }) => pane.id)).toEqual(["a", "b", "c"]);
  });

  it("narrows displayed panes and pane views to a focused file", () => {
    const model = buildWorkbenchViewModel({
      focusFile: "b-only.ts",
      hidden: new Set(),
      hiddenFiles: new Set(),
      parsed,
    });

    expect(model.focused).toBe("b-only.ts");
    expect(model.displayedPaneViews.map(({ pane }) => pane.id)).toEqual(["b"]);
    expect(model.paneViews.get("b")?.files.map((item) => item.name)).toEqual(["b-only.ts"]);
    expect(model.paneViews.get("b")?.additions).toBe(1);
    expect(model.paneViews.get("b")?.deletions).toBe(1);
  });

  it("filters hidden files in overview but keeps a focused file visible", () => {
    const hiddenFocused = "hidden.ts";
    const model = buildWorkbenchViewModel({
      focusFile: hiddenFocused,
      hidden: new Set(),
      hiddenFiles: new Set([hiddenFocused]),
      parsed: [
        testParsedPane("a", [testFileDiff("visible.ts", 1, 0), testFileDiff(hiddenFocused, 0, 1)]),
      ],
    });

    expect(model.focused).toBeNull();
    expect(model.paneViews.get("a")?.files.map((file) => file.name)).toEqual(["visible.ts"]);

    const focusedModel = buildWorkbenchViewModel({
      focusFile: hiddenFocused,
      hidden: new Set(),
      hiddenFiles: new Set(),
      parsed: [
        testParsedPane("a", [testFileDiff("visible.ts", 1, 0), testFileDiff(hiddenFocused, 0, 1)]),
      ],
    });

    expect(focusedModel.paneViews.get("a")?.files.map((file) => file.name)).toEqual([
      hiddenFocused,
    ]);
  });
});
