import { formatDiffStatLabel, formatDiffStatSummary } from "./diff-stat-format"
import { laneLabel } from "./lanes"
import type { FileRow } from "./types"

export function getFileTreeRowTitle(row: FileRow) {
  return `${row.name}\nin ${getFileTreeRowLaneList(row)} · ${formatDiffStatSummary(row)}`
}

export function getFileTreeRowLabel(row: FileRow) {
  return `${row.name}, changed in ${getFileTreeRowLaneList(row)}, ${formatDiffStatLabel(row)}`
}

export function getDirectoryTreeRowTitle({
  collapsed,
  path,
}: {
  collapsed: boolean
  path: string
}) {
  return `${collapsed ? "Expand" : "Collapse"} ${path}`
}

export function getDirectoryTreeRowLabel({
  collapsed,
  path,
}: {
  collapsed: boolean
  path: string
}) {
  return `${collapsed ? "Expand" : "Collapse"} folder ${path}`
}

function getFileTreeRowLaneList(row: FileRow) {
  return row.presentIn.map(laneLabel).join(", ")
}
