import type { FileDiffMetadata } from "@pierre/diffs/react"

import {
  buildDiffCodeItems,
  buildFileRows,
  diffTotalsForFiles,
} from "./diff-data"
import { compareFilePath } from "./file-order"
import type { FileRow, LaneId, PaneView, ParsedPane } from "./types"

export type DisplayedPaneView = {
  pane: ParsedPane
  paneView: PaneView
}

export type WorkbenchViewModel = {
  visiblePanes: ParsedPane[]
  allFileRows: FileRow[]
  fileRows: FileRow[]
  hiddenFileRows: FileRow[]
  focused: string | null
  displayedPaneViews: DisplayedPaneView[]
  paneViews: Map<LaneId, PaneView>
  sharedCount: number
  hasErrors: boolean
  indexActiveFile: string | null
}

export function buildWorkbenchViewModel({
  focusFile,
  hidden,
  hiddenFiles,
  parsed,
}: {
  focusFile: string | null
  hidden: Set<LaneId>
  hiddenFiles: Set<string>
  parsed: ParsedPane[]
}): WorkbenchViewModel {
  const visiblePanes = parsed.filter((pane) => !hidden.has(pane.id))
  const allFileRows = buildFileRows(visiblePanes)
  const { fileRows, hiddenFileRows } = partitionFileRows(
    allFileRows,
    hiddenFiles
  )
  const focused = getVisibleFocusFile(focusFile, fileRows)
  const displayedPanes = getDisplayedPanes(visiblePanes, focused)
  const { displayedPaneViews, paneViews } = buildPaneViewModel({
    displayedPanes,
    focused,
    hiddenFiles,
    parsed,
  })
  const sharedCount = getSharedFileCount({
    fileRows,
    hiddenFiles,
    visiblePanes,
  })

  return {
    visiblePanes,
    allFileRows,
    fileRows,
    hiddenFileRows,
    focused,
    displayedPaneViews,
    paneViews,
    sharedCount,
    hasErrors: parsed.some((pane) => pane.error),
    indexActiveFile: focused,
  }
}

function partitionFileRows(rows: FileRow[], hiddenFiles: Set<string>) {
  const fileRows: FileRow[] = []
  const hiddenFileRows: FileRow[] = []

  for (const row of rows) {
    if (hiddenFiles.has(row.name)) hiddenFileRows.push(row)
    else fileRows.push(row)
  }

  return { fileRows, hiddenFileRows }
}

function getVisibleFocusFile(focusFile: string | null, fileRows: FileRow[]) {
  if (!focusFile) return null
  return fileRows.some((row) => row.name === focusFile) ? focusFile : null
}

function getDisplayedPanes(visiblePanes: ParsedPane[], focused: string | null) {
  if (!focused) return visiblePanes
  return visiblePanes.filter((pane) =>
    pane.files.some((file) => file.name === focused)
  )
}

function getSharedFileCount({
  fileRows,
  hiddenFiles,
  visiblePanes,
}: {
  fileRows: FileRow[]
  hiddenFiles: Set<string>
  visiblePanes: ParsedPane[]
}) {
  const contributing = visiblePanes.filter((pane) =>
    pane.files.some((file) => !hiddenFiles.has(file.name))
  ).length

  if (contributing <= 1) return 0
  return fileRows.filter((row) => row.presentIn.length === contributing).length
}

function buildPaneViewModel({
  displayedPanes,
  focused,
  hiddenFiles,
  parsed,
}: {
  displayedPanes: ParsedPane[]
  focused: string | null
  hiddenFiles: Set<string>
  parsed: ParsedPane[]
}) {
  const displayedPaneIds = new Set(displayedPanes.map((pane) => pane.id))
  const displayedPaneViews: DisplayedPaneView[] = []
  const paneViews = new Map<LaneId, PaneView>()

  for (const pane of parsed) {
    const paneView = buildPaneView(pane, focused, hiddenFiles)
    paneViews.set(pane.id, paneView)

    if (displayedPaneIds.has(pane.id)) {
      displayedPaneViews.push({ pane, paneView })
    }
  }

  return { displayedPaneViews, paneViews }
}

function buildPaneView(
  pane: ParsedPane,
  focused: string | null,
  hiddenFiles: Set<string>
): PaneView {
  const files = getPaneViewFiles({
    files: pane.files,
    focused,
    hiddenFiles,
  })
  const { idByName, items } = buildDiffCodeItems(pane.id, files)
  const { additions, deletions } = diffTotalsForFiles(files)

  return {
    id: pane.id,
    files,
    items,
    idByName,
    additions,
    deletions,
  }
}

function getPaneViewFiles({
  files,
  focused,
  hiddenFiles,
}: {
  files: FileDiffMetadata[]
  focused: string | null
  hiddenFiles: Set<string>
}) {
  const visibleFiles = focused
    ? files.filter((file) => file.name === focused)
    : files.filter((file) => !hiddenFiles.has(file.name))

  return [...visibleFiles].sort((a, b) => compareFilePath(a.name, b.name))
}
