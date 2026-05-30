import { createPane } from "./diff-data"
import { LANE_ORDER, MAX_LANES, laneIdAt, laneIndex, laneTitle } from "./lanes"
import type { LaneId, Pane } from "./types"

export type ImportedDiffFile = {
  name: string
  text: string
}

export async function readImportFiles(
  fileList: FileList | null
): Promise<ImportedDiffFile[]> {
  const files = Array.from(fileList ?? []).slice(0, MAX_LANES)
  return Promise.all(
    files.map(async (file) => ({
      name: file.name,
      text: await file.text(),
    }))
  )
}

export function getPostImportVisibilityState() {
  return {
    hidden: new Set<LaneId>(),
    hiddenFiles: new Set<string>(),
  }
}

function getImportStart(
  panes: Pane[],
  fileCount: number,
  target?: LaneId
) {
  if (target) return laneIndex(target)
  const emptyIndex = panes.findIndex((pane) => !pane.text.trim())
  return fileCount === 1 && emptyIndex >= 0 ? emptyIndex : 0
}

export function applyImportedFiles({
  panes,
  reads,
  target,
}: {
  panes: Pane[]
  reads: ImportedDiffFile[]
  target?: LaneId
}) {
  const importedFiles = reads.slice(0, MAX_LANES)
  const start = getImportStart(panes, importedFiles.length, target)
  const laneCount = getImportLaneCount({
    fileCount: importedFiles.length,
    paneCount: panes.length,
    start,
    targeted: Boolean(target),
  })
  const next = Array.from(
    { length: Math.min(laneCount, MAX_LANES) },
    (_, index) => {
      const id = laneIdAt(index)
      return panes[index]
        ? { ...panes[index], id, label: laneTitle(id) }
        : createPane(id)
    }
  )
  const indexByLane = getPaneIndexByLane(next)

  importedFiles.forEach((read, index) => {
    const id = laneIdAt((start + index) % LANE_ORDER.length)
    const nextIndex = indexByLane.get(id) ?? -1
    if (nextIndex < 0) return
    next[nextIndex] = {
      ...next[nextIndex],
      text: read.text,
      filename: read.name,
    }
  })

  return next
}

function getPaneIndexByLane(panes: Pane[]) {
  return new Map(panes.map((pane, index) => [pane.id, index]))
}

function getImportLaneCount({
  fileCount,
  paneCount,
  start,
  targeted,
}: {
  fileCount: number
  paneCount: number
  start: number
  targeted: boolean
}) {
  return targeted || fileCount === 1
    ? Math.max(paneCount, start + fileCount, 1)
    : fileCount
}
