import type { FileRow } from "./types"
import { summarizeFileTree } from "./file-tree-summary"
import type { FileTreeNode } from "./file-tree-types"

export function buildPreparedFileTree(rows: FileRow[]) {
  const root = buildFileTree(rows)

  summarizeFileTree(root)
  compactFileTree(root)
  return root
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
