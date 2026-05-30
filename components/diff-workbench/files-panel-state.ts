import { buildVisibleFileTreeRows } from "./file-tree"
import type { VisibleFileTreeRow } from "./file-tree"
import type { DirectoryContext, FileRow, LaneId } from "./types"

type FilesPanelDerivedState = {
  filteredRows: FileRow[]
  restorableRows: FileRow[]
  showTreeLaneBadges: boolean
  treeLaneIds: LaneId[]
  treeRows: VisibleFileTreeRow[]
  visibleCount: number
}

export type FilesPanelContextState = {
  contextDirectory: DirectoryContext | null
  contextFile: string | null
}

function filterFileRows(rows: FileRow[], query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return rows

  return rows.filter((row) => {
    const filename = row.name.split("/").pop() ?? row.name
    return filename.toLowerCase().includes(needle)
  })
}

function getRestorableRows(
  hiddenFileRows: FileRow[],
  contextFile: string | null
) {
  return hiddenFileRows.filter((row) => row.name !== contextFile)
}

function getVisibleFileCount(
  rows: FileRow[],
  hiddenFileRows: FileRow[]
) {
  return Math.max(0, rows.length - hiddenFileRows.length)
}

function getTreeLaneIds(laneIds: LaneId[], hidden: Set<LaneId>) {
  return laneIds.filter((id) => !hidden.has(id))
}

function shouldShowTreeLaneBadges(query: string, treeLaneIds: LaneId[]) {
  return query.trim().length !== 1 && treeLaneIds.length > 1
}

export function toggleCollapsedDirectory(current: Set<string>, path: string) {
  const next = new Set(current)
  if (next.has(path)) next.delete(path)
  else next.add(path)
  return next
}

export function clearFilesPanelContext(): FilesPanelContextState {
  return {
    contextDirectory: null,
    contextFile: null,
  }
}

export function selectDirectoryContext(
  contextDirectory: DirectoryContext
): FilesPanelContextState {
  return {
    contextDirectory,
    contextFile: null,
  }
}

export function selectFileContext(contextFile: string): FilesPanelContextState {
  return {
    contextDirectory: null,
    contextFile,
  }
}

export function getFilesPanelDerivedState({
  collapsedDirs,
  contextFile,
  hidden,
  hiddenFileRows,
  laneIds,
  query,
  rows,
}: {
  collapsedDirs: Set<string>
  contextFile: string | null
  hidden: Set<LaneId>
  hiddenFileRows: FileRow[]
  laneIds: LaneId[]
  query: string
  rows: FileRow[]
}): FilesPanelDerivedState {
  const filteredRows = filterFileRows(rows, query)
  const treeLaneIds = getTreeLaneIds(laneIds, hidden)

  return {
    filteredRows,
    restorableRows: getRestorableRows(hiddenFileRows, contextFile),
    showTreeLaneBadges: shouldShowTreeLaneBadges(query, treeLaneIds),
    treeLaneIds,
    treeRows: buildVisibleFileTreeRows(filteredRows, collapsedDirs),
    visibleCount: getVisibleFileCount(rows, hiddenFileRows),
  }
}
