import { describe, expect, it } from "vitest";

import { buildPaneView, buildPaneViewModel } from "./pane-view-model";
import { testFileDiff, testParsedPane } from "./test-builders";

describe("pane view model", () => {
  it("filters hidden files and sorts visible files for a pane", () => {
    const pane = testParsedPane("a", [
      testFileDiff("z.ts", 1, 0),
      testFileDiff("a.ts", 0, 1),
      testFileDiff("hidden.ts", 4, 4),
    ]);

    const view = buildPaneView(pane, null, new Set(["hidden.ts"]));

    expect(view.files.map((file) => file.name)).toEqual(["a.ts", "z.ts"]);
    expect(view.additions).toBe(1);
    expect(view.deletions).toBe(1);
    expect(view.idByName.get("a.ts")).toBe("a-0-a.ts");
  });

  it("keeps only the focused file when a pane is focused", () => {
    const pane = testParsedPane("b", [testFileDiff("a.ts", 1, 0), testFileDiff("focus.ts", 3, 2)]);

    const view = buildPaneView(pane, "focus.ts", new Set());

    expect(view.files.map((file) => file.name)).toEqual(["focus.ts"]);
    expect(view.additions).toBe(3);
    expect(view.deletions).toBe(2);
  });

  it("builds all pane views while exposing only displayed pane entries", () => {
    const panes = [
      testParsedPane("a", [testFileDiff("a.ts", 1, 0)]),
      testParsedPane("b", [testFileDiff("b.ts", 0, 1)]),
    ];

    const model = buildPaneViewModel({
      displayedPanes: [panes[1]],
      focused: null,
      hiddenFiles: new Set(),
      parsed: panes,
    });

    expect(model.displayedPaneViews.map(({ pane }) => pane.id)).toEqual(["b"]);
    expect(model.paneViews.get("a")?.files.map((file) => file.name)).toEqual(["a.ts"]);
    expect(model.paneViews.get("b")?.files.map((file) => file.name)).toEqual(["b.ts"]);
  });
});
