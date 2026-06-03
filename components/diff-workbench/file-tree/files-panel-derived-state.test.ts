import { describe, expect, it } from "vitest";

import { getFilesPanelDerivedState } from "./files-panel-derived-state";
import { testFileRow } from "../shared/test-builders";

describe("files panel derived state", () => {
  it("does not duplicate the current context file in restore rows", () => {
    const rows = [testFileRow("a.ts"), testFileRow("b.ts")];

    expect(
      getFilesPanelDerivedState({
        activeFile: null,
        collapsedDirs: new Set(),
        contextFile: "a.ts",
        hidden: new Set(),
        hiddenFileRows: rows,
        laneIds: ["a"],
        query: "",
        rows,
      }).restorableRows.map((item) => item.name),
    ).toEqual(["b.ts"]);
    expect(
      getFilesPanelDerivedState({
        activeFile: null,
        collapsedDirs: new Set(),
        contextFile: null,
        hidden: new Set(),
        hiddenFileRows: rows,
        laneIds: ["a"],
        query: "",
        rows,
      }).restorableRows,
    ).toEqual(rows);
  });

  it("derives visible file counts and lane badges from hidden state", () => {
    const rows = [testFileRow("a.ts"), testFileRow("b.ts"), testFileRow("c.ts")];
    const hiddenRows = [testFileRow("b.ts")];
    const laneIds = ["a", "b", "c"];
    const derived = getFilesPanelDerivedState({
      activeFile: null,
      collapsedDirs: new Set(),
      contextFile: null,
      hidden: new Set(["b"]),
      hiddenFileRows: hiddenRows,
      laneIds,
      query: "route",
      rows,
    });

    expect(derived.visibleCount).toBe(2);
    expect(derived.treeLaneIds).toEqual(["a", "c"]);
    expect(
      getFilesPanelDerivedState({
        activeFile: null,
        collapsedDirs: new Set(),
        contextFile: null,
        hidden: new Set(["b"]),
        hiddenFileRows: hiddenRows,
        laneIds,
        query: "r",
        rows,
      }).showTreeLaneBadges,
    ).toBe(false);
    expect(derived.showTreeLaneBadges).toBe(true);
  });

  it("keeps visible file count non-negative while hidden state settles", () => {
    expect(
      getFilesPanelDerivedState({
        activeFile: null,
        collapsedDirs: new Set(),
        contextFile: null,
        hidden: new Set(),
        hiddenFileRows: [testFileRow("a.ts"), testFileRow("stale.ts")],
        laneIds: ["a"],
        query: "",
        rows: [testFileRow("a.ts")],
      }).visibleCount,
    ).toBe(0);
  });

  it("builds the derived files panel state from filtered rows", () => {
    const rows = [
      testFileRow("app/api/search/route.ts"),
      testFileRow("components/result-list.tsx"),
      testFileRow("lib/search.ts"),
    ];
    const derived = getFilesPanelDerivedState({
      activeFile: null,
      collapsedDirs: new Set(),
      contextFile: "lib/search.ts",
      hidden: new Set(["b"]),
      hiddenFileRows: [rows[2]],
      laneIds: ["a", "b", "c"],
      query: "search",
      rows,
    });

    expect(derived.restorableRows).toEqual([]);
    expect(derived.treeLaneIds).toEqual(["a", "c"]);
    expect(derived.showTreeLaneBadges).toBe(true);
    expect(derived.treeRows.map((item) => item.node.path)).toEqual(["lib", "lib/search.ts"]);
    expect(derived.visibleCount).toBe(2);
  });

  it("returns every row for blank filters", () => {
    const rows = [testFileRow("a.ts"), testFileRow("b.ts")];

    expect(
      getFilesPanelDerivedState({
        activeFile: null,
        collapsedDirs: new Set(),
        contextFile: null,
        hidden: new Set(),
        hiddenFileRows: [],
        laneIds: ["a"],
        query: "  ",
        rows,
      }).treeRows.map((item) => item.node.path),
    ).toEqual(["a.ts", "b.ts"]);
  });

  it("keeps the active file as the focus target when it is visible", () => {
    const rows = [testFileRow("a.ts"), testFileRow("b.ts")];

    expect(
      getFilesPanelDerivedState({
        activeFile: "b.ts",
        collapsedDirs: new Set(),
        contextFile: null,
        hidden: new Set(),
        hiddenFileRows: [],
        laneIds: ["a"],
        query: "",
        rows,
      }).focusTarget,
    ).toBe("b.ts");
  });

  it("uses the first visible tree file as the focus target when active file is filtered out", () => {
    const rows = [testFileRow("app/route.ts"), testFileRow("components/result-list.tsx")];

    expect(
      getFilesPanelDerivedState({
        activeFile: "components/result-list.tsx",
        collapsedDirs: new Set(),
        contextFile: null,
        hidden: new Set(),
        hiddenFileRows: [],
        laneIds: ["a"],
        query: "route",
        rows,
      }).focusTarget,
    ).toBe("app/route.ts");
  });

  it("uses only focusable rows when choosing the initial focus target", () => {
    const rows = [
      testFileRow("a-hidden.ts"),
      testFileRow("b-visible.ts"),
      testFileRow("c-visible.ts"),
    ];

    expect(
      getFilesPanelDerivedState({
        activeFile: "hidden.ts",
        collapsedDirs: new Set(),
        contextFile: null,
        focusableRows: rows.slice(1),
        hidden: new Set(),
        hiddenFileRows: [rows[0]],
        laneIds: ["a"],
        query: "",
        rows,
      }).focusTarget,
    ).toBe("b-visible.ts");
  });

  it("falls back to the active or first row when collapsed directories hide tree files", () => {
    const rows = [testFileRow("app/route.ts"), testFileRow("components/list.tsx")];
    const collapsedDirs = new Set(["app", "components"]);

    expect(
      getFilesPanelDerivedState({
        activeFile: "components/list.tsx",
        collapsedDirs,
        contextFile: null,
        hidden: new Set(),
        hiddenFileRows: [],
        laneIds: ["a"],
        query: "",
        rows,
      }).focusTarget,
    ).toBe("components/list.tsx");
    expect(
      getFilesPanelDerivedState({
        activeFile: null,
        collapsedDirs,
        contextFile: null,
        hidden: new Set(),
        hiddenFileRows: [],
        laneIds: ["a"],
        query: "",
        rows,
      }).focusTarget,
    ).toBe("app/route.ts");
  });
});
