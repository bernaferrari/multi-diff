import { describe, expect, it } from "vitest";

import {
  buildVisibleFileTreeRows,
  getFirstVisibleFileTreeName,
  getFirstVisibleFileTreeRowName,
  type VisibleFileTreeRow,
} from "./file-tree";
import type { FileRow, LaneId } from "../shared/types";

function row(name: string, presentIn: LaneId[], additions: number, deletions: number): FileRow {
  return {
    name,
    panes: Object.fromEntries(presentIn.map((lane) => [lane, undefined])),
    presentIn,
    additions,
    deletions,
  };
}

function findNode(rows: VisibleFileTreeRow[], path: string) {
  const item = rows.find((row) => row.node.path === path);
  if (!item) throw new Error(`Missing tree node ${path}`);
  return item.node;
}

describe("file tree helpers", () => {
  const rows = [
    row("app/api/search/route.ts", ["a", "b", "c"], 40, 12),
    row("components/result-list.tsx", ["a", "b", "c"], 6, 1),
    row("lib/audit.ts", ["c"], 7, 0),
    row("lib/search.ts", ["b", "c"], 6, 2),
  ];

  it("compacts single-child directory chains and sorts alphabetically", () => {
    const treeRows = buildVisibleFileTreeRows(rows, new Set());

    expect(treeRows.map((item) => [item.depth, item.node.kind, item.node.name])).toEqual([
      [0, "directory", "app/api/search"],
      [1, "file", "route.ts"],
      [0, "directory", "components"],
      [1, "file", "result-list.tsx"],
      [0, "directory", "lib"],
      [1, "file", "audit.ts"],
      [1, "file", "search.ts"],
    ]);
  });

  it("sorts top-level files and folders together without case bias", () => {
    const treeRows = buildVisibleFileTreeRows(
      [
        row("z-file.ts", ["a"], 1, 0),
        row("app/a.ts", ["a"], 1, 0),
        row("components/b.ts", ["a"], 1, 0),
        row("a-file.ts", ["a"], 1, 0),
        row("Board.java", ["a"], 1, 0),
        row("Test.txt", ["a"], 1, 0),
        row("saves/autosave.txt", ["a"], 1, 0),
      ],
      new Set(),
    );

    expect(
      treeRows.filter((item) => item.depth === 0).map((item) => [item.node.kind, item.node.name]),
    ).toEqual([
      ["file", "a-file.ts"],
      ["directory", "app"],
      ["file", "Board.java"],
      ["directory", "components"],
      ["directory", "saves"],
      ["file", "Test.txt"],
      ["file", "z-file.ts"],
    ]);
  });

  it("omits children for collapsed directories while keeping aggregate stats", () => {
    const treeRows = buildVisibleFileTreeRows(rows, new Set(["lib"]));

    expect(treeRows.map((item) => item.node.path)).toEqual([
      "app/api/search",
      "app/api/search/route.ts",
      "components",
      "components/result-list.tsx",
      "lib",
    ]);

    expect(findNode(treeRows, "lib").summary).toMatchObject({
      additions: 13,
      deletions: 2,
      presentIn: ["c", "b"],
    });
  });

  it("summarizes aggregate stats on visible directories", () => {
    const treeRows = buildVisibleFileTreeRows(rows, new Set());
    const appNode = findNode(treeRows, "app/api/search");

    expect(appNode.summary).toMatchObject({
      additions: 40,
      deletions: 12,
      presentIn: ["a", "b", "c"],
    });
  });

  it("returns the first visible file in rendered tree order", () => {
    expect(getFirstVisibleFileTreeName(rows)).toBe("app/api/search/route.ts");
    expect(getFirstVisibleFileTreeName(rows, new Set(["app/api/search"]))).toBe(
      "components/result-list.tsx",
    );

    expect(getFirstVisibleFileTreeRowName(buildVisibleFileTreeRows(rows, new Set()))).toBe(
      "app/api/search/route.ts",
    );
  });
});
