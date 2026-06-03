import type { FileTreeNode } from "./file-tree-types";
import type { FileRow, LaneId } from "../shared/types";

export function summarizeFileTree(node: FileTreeNode): FileRow | undefined {
  if (node.kind === "file") {
    node.summary = node.row;
    node.fileNames = node.row ? [node.row.name] : [];
    return node.row;
  }

  const summary = createDirectorySummary(node.path);
  const fileNames: string[] = [];
  const present = new Set<LaneId>();

  for (const child of node.children.values()) {
    const childSummary = summarizeFileTree(child);
    fileNames.push(...(child.fileNames ?? []));
    if (!childSummary) continue;
    addChildSummary(summary, present, childSummary);
  }

  summary.presentIn = [...present];
  node.fileNames = fileNames;
  node.summary = summary;
  return summary;
}

function createDirectorySummary(name: string): FileRow {
  return {
    name,
    panes: {},
    presentIn: [],
    additions: 0,
    deletions: 0,
  };
}

function addChildSummary(summary: FileRow, present: Set<LaneId>, childSummary: FileRow) {
  summary.additions += childSummary.additions;
  summary.deletions += childSummary.deletions;

  for (const lane of childSummary.presentIn) {
    present.add(lane);
    summary.panes[lane] ??= childSummary.panes[lane];
  }
}
