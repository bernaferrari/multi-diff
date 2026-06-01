import type { ActiveFileByLane, FileRow, LaneId } from "./types"

import { getFirstVisibleFileTreeName } from "./file-tree"

export const NAVIGATION_SCROLL_SPY_LOCK_MS = 120

export type PaneFileLookup = {
  pane: { id: LaneId }
  paneView: { idByName: Map<string, string> }
}

export type FocusModeToggleAction =
  | { type: "clear" }
  | { name: string; type: "select" }
  | { type: "none" }

export function getNavigationScrollLockUntil(now: number) {
  return now + NAVIGATION_SCROLL_SPY_LOCK_MS
}

export function isNavigationScrollLocked({
  lockUntil,
  now,
}: {
  lockUntil: number
  now: number
}) {
  return now < lockUntil
}

function getActiveFileByVisibleLanes(
  displayedPaneViews: PaneFileLookup[],
  name: string
): ActiveFileByLane {
  return Object.fromEntries(
    displayedPaneViews
      .filter(({ paneView }) => paneView.idByName.has(name))
      .map(({ pane }) => [pane.id, name])
  )
}

export function getNavigationActiveFileByLane({
  currentActiveFileByLane,
  displayedPaneViews,
  fallbackName,
  name,
}: {
  currentActiveFileByLane: ActiveFileByLane
  displayedPaneViews: PaneFileLookup[]
  fallbackName?: string | null
  name: string
}): ActiveFileByLane {
  const seed =
    Object.keys(currentActiveFileByLane).length > 0 || !fallbackName
      ? currentActiveFileByLane
      : getActiveFileByVisibleLanes(displayedPaneViews, fallbackName)

  return {
    ...seed,
    ...getActiveFileByVisibleLanes(displayedPaneViews, name),
  }
}

export function getNavigationFallbackFile({
  activeFile,
  fileRows,
  indexActiveFile,
}: {
  activeFile: string | null
  fileRows: FileRow[]
  indexActiveFile: string | null
}) {
  return (
    getVisibleFileName(activeFile, fileRows) ??
    getVisibleFileName(indexActiveFile, fileRows) ??
    getFirstVisibleFileTreeName(fileRows) ??
    null
  )
}

export function getNextActiveFileByLane({
  current,
  name,
  sourceId,
}: {
  current: ActiveFileByLane
  name: string
  sourceId: LaneId
}): ActiveFileByLane {
  return {
    ...current,
    [sourceId]: name,
  }
}

export function getFocusModeNavigationTarget({
  activeFile,
  activeFileByLane,
  fileRows,
  indexActiveFile,
  preferredFile,
}: {
  activeFile: string | null
  activeFileByLane: ActiveFileByLane
  fileRows: FileRow[]
  indexActiveFile: string | null
  preferredFile?: string | null
}) {
  const rowNames = new Set(fileRows.map((row) => row.name))
  const activeLaneNames = new Set(
    Object.values(activeFileByLane).filter((name): name is string =>
      Boolean(name && rowNames.has(name))
    )
  )
  const firstActiveLaneFile = fileRows.find((row) =>
    activeLaneNames.has(row.name)
  )?.name

  return (
    getVisibleFileName(preferredFile ?? null, fileRows) ??
    getVisibleFileName(activeFile, fileRows) ??
    firstActiveLaneFile ??
    getVisibleFileName(indexActiveFile, fileRows) ??
    getFirstVisibleFileTreeName(fileRows) ??
    null
  )
}

export function getFocusModeToggleAction({
  activeFile,
  activeFileByLane,
  fileRows,
  focusedFile,
  focusMode,
  indexActiveFile,
  preferredFile,
}: {
  activeFile: string | null
  activeFileByLane: ActiveFileByLane
  fileRows: FileRow[]
  focusedFile: string | null
  focusMode: boolean
  indexActiveFile: string | null
  preferredFile?: string | null
}): FocusModeToggleAction {
  if (focusMode && focusedFile) return { type: "clear" }

  const target = getFocusModeNavigationTarget({
    activeFile,
    activeFileByLane,
    fileRows,
    indexActiveFile,
    preferredFile,
  })

  return target ? { name: target, type: "select" } : { type: "none" }
}

export function getRowsLayoutNavigationTarget({
  activeFile,
  fileRows,
  indexActiveFile,
  rowsNavigationFile,
}: {
  activeFile: string | null
  fileRows: { name: string }[]
  indexActiveFile: string | null
  rowsNavigationFile: string | null
}) {
  return (
    getVisibleFileName(rowsNavigationFile, fileRows) ??
    getVisibleFileName(activeFile, fileRows) ??
    getVisibleFileName(indexActiveFile, fileRows)
  )
}

function getVisibleFileName(name: string | null, rows: { name: string }[]) {
  if (!name) return null
  return rows.some((row) => row.name === name) ? name : null
}
