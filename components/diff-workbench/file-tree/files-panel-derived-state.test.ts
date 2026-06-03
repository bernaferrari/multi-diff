import { describe, expect, it } from "vitest";

import { getFilesPanelDerivedState, getFilesPanelTreeState } from "./files-panel-derived-state";
import type { FileRow, LaneId } from "../shared/types";
import { testFileRow } from "../shared/test-builders";

function deriveFilesPanelState({
  activeFile = null,
  collapsedDirs = new Set<string>(),
  contextFile = null,
  focusableRows,
  hidden = new Set<LaneId>(),
  hiddenFileRows = [],
  laneIds = ["a"],
  query = "",
  rows,
}: {
  activeFile?: string | null;
  collapsedDirs?: Set<string>;
  contextFile?: string | null;
  focusableRows?: FileRow[];
  hidden?: Set<LaneId>;
  hiddenFileRows?: FileRow[];
  laneIds?: LaneId[];
  query?: string;
  rows: FileRow[];
}) {
  return getFilesPanelDerivedState({
    activeFile,
    contextFile,
    focusableRows,
    hidden,
    hiddenFileRows,
    laneIds,
    query,
    rows,
    treeRows: getFilesPanelTreeState({
      collapsedDirs,
      query,
      rows,
    }).treeRows,
  });
}

describe("files panel derived state", () => {
  it("does not duplicate the current context file in restore rows", () => {
    const rows = [testFileRow("a.ts"), testFileRow("b.ts")];

    expect(
      deriveFilesPanelState({
        contextFile: "a.ts",
        hiddenFileRows: rows,
        rows,
      }).restorableRows.map((item) => item.name),
    ).toEqual(["b.ts"]);
    expect(
      deriveFilesPanelState({
        hiddenFileRows: rows,
        rows,
      }).restorableRows,
    ).toEqual(rows);
  });

  it("derives visible file counts and lane badges from hidden state", () => {
    const rows = [testFileRow("a.ts"), testFileRow("b.ts"), testFileRow("c.ts")];
    const hiddenRows = [testFileRow("b.ts")];
    const laneIds = ["a", "b", "c"];
    const derived = deriveFilesPanelState({
      hidden: new Set(["b"]),
      hiddenFileRows: hiddenRows,
      laneIds,
      query: "route",
      rows,
    });

    expect(derived.visibleCount).toBe(2);
    expect(derived.treeLaneIds).toEqual(["a", "c"]);
    expect(
      deriveFilesPanelState({
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
      deriveFilesPanelState({
        hiddenFileRows: [testFileRow("a.ts"), testFileRow("stale.ts")],
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
    const derived = deriveFilesPanelState({
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
      deriveFilesPanelState({
        query: "  ",
        rows,
      }).treeRows.map((item) => item.node.path),
    ).toEqual(["a.ts", "b.ts"]);
  });

  it("keeps the active file as the focus target when it is visible", () => {
    const rows = [testFileRow("a.ts"), testFileRow("b.ts")];

    expect(
      deriveFilesPanelState({
        activeFile: "b.ts",
        rows,
      }).focusTarget,
    ).toBe("b.ts");
  });

  it("uses the first visible tree file as the focus target when active file is filtered out", () => {
    const rows = [testFileRow("app/route.ts"), testFileRow("components/result-list.tsx")];

    expect(
      deriveFilesPanelState({
        activeFile: "components/result-list.tsx",
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
      deriveFilesPanelState({
        activeFile: "hidden.ts",
        focusableRows: rows.slice(1),
        hiddenFileRows: [rows[0]],
        rows,
      }).focusTarget,
    ).toBe("b-visible.ts");
  });

  it("falls back to the active or first row when collapsed directories hide tree files", () => {
    const rows = [testFileRow("app/route.ts"), testFileRow("components/list.tsx")];
    const collapsedDirs = new Set(["app", "components"]);

    expect(
      deriveFilesPanelState({
        activeFile: "components/list.tsx",
        collapsedDirs,
        rows,
      }).focusTarget,
    ).toBe("components/list.tsx");
    expect(
      deriveFilesPanelState({
        collapsedDirs,
        rows,
      }).focusTarget,
    ).toBe("app/route.ts");
  });

  it("builds tree shape independently from active and hidden metadata", () => {
    const rows = [
      testFileRow("app/api/search/route.ts"),
      testFileRow("components/result-list.tsx"),
      testFileRow("lib/search.ts"),
    ];

    expect(
      getFilesPanelTreeState({
        collapsedDirs: new Set(),
        query: "search",
        rows,
      }).treeRows.map((item) => item.node.path),
    ).toEqual(["lib", "lib/search.ts"]);
  });
});
