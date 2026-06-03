import { compareFilePath } from "./file-order";
import { buildPreparedFileTree } from "./file-tree-builder";
import type { FileTreeNode, VisibleFileTreeRow } from "./file-tree-types";
import type { FileRow } from "../shared/types";

export type { FileTreeNode, VisibleFileTreeRow } from "./file-tree-types";

export function buildVisibleFileTreeRows(
  rows: FileRow[],
  collapsedPaths: Set<string>,
): VisibleFileTreeRow[] {
  const root = buildPreparedFileTree(rows);
  return flattenVisibleFileTreeRows(root, collapsedPaths);
}

export function getFirstVisibleFileTreeName(rows: FileRow[], collapsedPaths = new Set<string>()) {
  return getFirstVisibleFileTreeRowName(buildVisibleFileTreeRows(rows, collapsedPaths));
}

export function getFirstVisibleFileTreeRowName(treeRows: VisibleFileTreeRow[]) {
  return getFirstVisibleFileNode(treeRows)?.row?.name;
}

function getFirstVisibleFileNode(treeRows: VisibleFileTreeRow[]) {
  return treeRows.find((item) => item.node.kind === "file" && item.node.row)?.node;
}

function getSortedFileTreeChildren(node: FileTreeNode) {
  return [...node.children.values()].sort((a, b) => compareFilePath(a.path, b.path));
}

function flattenVisibleFileTreeRows(root: FileTreeNode, collapsedPaths: Set<string>) {
  const visible: VisibleFileTreeRow[] = [];

  visitVisibleFileTree(root, 0, collapsedPaths, visible);
  return visible;
}

function visitVisibleFileTree(
  node: FileTreeNode,
  depth: number,
  collapsedPaths: Set<string>,
  visible: VisibleFileTreeRow[],
) {
  for (const child of getSortedFileTreeChildren(node)) {
    visible.push({ depth, node: child });
    if (child.kind === "directory" && !collapsedPaths.has(child.path)) {
      visitVisibleFileTree(child, depth + 1, collapsedPaths, visible);
    }
  }
}
