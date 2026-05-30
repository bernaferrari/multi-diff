import type { FileRow, LaneId } from "./types"
import { compareFilePath } from "./file-order"

export type FileTreeNode = {
  children: Map<string, FileTreeNode>
  kind: "directory" | "file"
  name: string
  path: string
  row?: FileRow
  summary?: FileRow
}

export type VisibleFileTreeRow = {
  depth: number
  node: FileTreeNode
}

function createTreeNode(
  kind: FileTreeNode["kind"],
  name: string,
  path: string,
  row?: FileRow
): FileTreeNode {
  return { children: new Map(), kind, name, path, row }
}

function buildFileTree(rows: FileRow[]) {
  const root = createTreeNode("directory", "", "")

  for (const row of rows) {
    insertFileTreeRow(root, row)
  }

  return root
}

function insertFileTreeRow(root: FileTreeNode, row: FileRow) {
  const parts = row.name.split("/").filter(Boolean)
  let cursor = root
  let path = ""

  parts.forEach((part, index) => {
    path = path ? `${path}/${part}` : part
    const isFile = index === parts.length - 1
    const existing = cursor.children.get(part)
    const next =
      existing ??
      createTreeNode(
        isFile ? "file" : "directory",
        part,
        path,
        isFile ? row : undefined
      )

    if (isFile) {
      next.kind = "file"
      next.row = row
    }

    cursor.children.set(part, next)
    cursor = next
  })
}

export function buildVisibleFileTreeRows(
  rows: FileRow[],
  collapsedPaths: Set<string>
): VisibleFileTreeRow[] {
  const root = buildPreparedFileTree(rows)
  return flattenVisibleFileTreeRows(root, collapsedPaths)
}

function buildPreparedFileTree(rows: FileRow[]) {
  const root = buildFileTree(rows)

  summarizeFileTree(root)
  compactFileTree(root)
  return root
}

function getSortedFileTreeChildren(node: FileTreeNode) {
  return [...node.children.values()].sort((a, b) =>
    compareFilePath(a.path, b.path)
  )
}

function compactFileTree(root: FileTreeNode) {
  for (const [key, child] of root.children) {
    root.children.set(key, compactDirectory(child))
  }
}

function compactDirectory(node: FileTreeNode): FileTreeNode {
  if (node.kind !== "directory") return node

  for (const [key, child] of node.children) {
    node.children.set(key, compactDirectory(child))
  }

  while (node.children.size === 1) {
    const only = onlyChild(node)
    if (only?.kind !== "directory") break
    node = {
      ...only,
      name: node.name ? `${node.name}/${only.name}` : only.name,
    }
  }

  return node
}

function onlyChild(node: FileTreeNode) {
  return node.children.values().next().value
}

function summarizeFileTree(node: FileTreeNode): FileRow | undefined {
  if (node.kind === "file") {
    node.summary = node.row
    return node.row
  }

  const summary = createDirectorySummary(node.path)
  const present = new Set<LaneId>()

  for (const child of node.children.values()) {
    const childSummary = summarizeFileTree(child)
    if (!childSummary) continue
    addChildSummary(summary, present, childSummary)
  }

  summary.presentIn = [...present]
  node.summary = summary
  return summary
}

function createDirectorySummary(name: string): FileRow {
  return {
    name,
    panes: {},
    presentIn: [],
    additions: 0,
    deletions: 0,
  }
}

function addChildSummary(
  summary: FileRow,
  present: Set<LaneId>,
  childSummary: FileRow
) {
  summary.additions += childSummary.additions
  summary.deletions += childSummary.deletions

  for (const lane of childSummary.presentIn) {
    present.add(lane)
    summary.panes[lane] ??= childSummary.panes[lane]
  }
}

function flattenVisibleFileTreeRows(
  root: FileTreeNode,
  collapsedPaths: Set<string>
) {
  const visible: VisibleFileTreeRow[] = []

  visitVisibleFileTree(root, 0, collapsedPaths, visible)
  return visible
}

function visitVisibleFileTree(
  node: FileTreeNode,
  depth: number,
  collapsedPaths: Set<string>,
  visible: VisibleFileTreeRow[]
) {
  for (const child of getSortedFileTreeChildren(node)) {
    visible.push({ depth, node: child })
    if (child.kind === "directory" && !collapsedPaths.has(child.path)) {
      visitVisibleFileTree(child, depth + 1, collapsedPaths, visible)
    }
  }
}

export function collectFileTreeNames(node: FileTreeNode): string[] {
  if (node.kind === "file") return node.row ? [node.row.name] : []

  const names: string[] = []
  for (const child of node.children.values()) {
    names.push(...collectFileTreeNames(child))
  }
  return names
}

export function isFileTreeNodeHidden(
  node: FileTreeNode,
  hiddenFiles: Set<string>
) {
  return node.kind === "file" && node.row ? hiddenFiles.has(node.row.name) : false
}
