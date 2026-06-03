import { describe, expect, it } from "vitest";

import { summarizeFileTree } from "./file-tree-summary";
import type { FileTreeNode } from "./file-tree-types";
import type { FileRow } from "../shared/types";

describe("file tree summary", () => {
  it("aggregates file stats and lane presence into directory summaries", () => {
    const node = directory("lib", [
      file(row("lib/audit.ts", ["c"], 7, 0)),
      file(row("lib/search.ts", ["b", "c"], 6, 2)),
    ]);

    expect(summarizeFileTree(node)).toMatchObject({
      additions: 13,
      deletions: 2,
      name: "lib",
      presentIn: ["c", "b"],
    });
    expect(node.summary?.panes).toHaveProperty("b");
    expect(node.summary?.panes).toHaveProperty("c");
    expect(node.fileNames).toEqual(["lib/audit.ts", "lib/search.ts"]);
  });

  it("stores the original row as a file node summary", () => {
    const rowValue = row("app/a.ts", ["a"], 1, 0);
    const node = file(rowValue);

    expect(summarizeFileTree(node)).toBe(rowValue);
    expect(node.summary).toBe(rowValue);
    expect(node.fileNames).toEqual(["app/a.ts"]);
  });
});

function directory(path: string, children: FileTreeNode[]): FileTreeNode {
  return {
    children: new Map(children.map((child) => [child.path, child])),
    kind: "directory",
    name: path.split("/").at(-1) ?? path,
    path,
  };
}

function file(rowValue: FileRow): FileTreeNode {
  return {
    children: new Map(),
    kind: "file",
    name: rowValue.name.split("/").at(-1) ?? rowValue.name,
    path: rowValue.name,
    row: rowValue,
  };
}

function row(
  name: string,
  presentIn: FileRow["presentIn"],
  additions: number,
  deletions: number,
): FileRow {
  return {
    additions,
    deletions,
    name,
    panes: Object.fromEntries(presentIn.map((lane) => [lane, {}])),
    presentIn,
  } as FileRow;
}
