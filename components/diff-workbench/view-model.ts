import { buildFileRows } from "./diff-data"
import { buildPaneViewModel, type DisplayedPaneView } from "./pane-view-model"
import {
  getDisplayedPanes,
  getSharedFileCount,
  getVisibleFocusFile,
  partitionFileRows,
} from "./workbench-view-state"
import type { FileRow, LaneId, PaneView, ParsedPane } from "./types"

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
