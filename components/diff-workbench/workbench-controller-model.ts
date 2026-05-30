import type { DiffPaneViewportView } from "./diff-pane-viewport"
import { buildVisibleFileTreeRows } from "./file-tree"
import type { FilesPanelView } from "./files-panel"
import type { ToolbarSettings } from "./toolbar"
import type { DiffRenderSettings } from "./types"
import type { WorkbenchSetters, WorkbenchState } from "./workbench-state-model"

type RenderSettingsArgs = Pick<
  WorkbenchState,
  "diffStyle" | "lineNumbers" | "wrap"
> & {
  resolvedTheme: string | undefined
}

function getCodeTheme(resolvedTheme: string | undefined) {
  return resolvedTheme === "dark" ? "dark" : "light"
}

export function getRenderSettings({
  diffStyle,
  lineNumbers,
  resolvedTheme,
  wrap,
}: RenderSettingsArgs): DiffRenderSettings {
  return {
    codeTheme: getCodeTheme(resolvedTheme),
    diffStyle,
    lineNumbers,
    wrap,
  }
}

export function getToolbarSettings(
  state: Pick<
    WorkbenchState,
    | "diffStyle"
    | "laneMarkerStyle"
    | "layout"
    | "lineNumbers"
    | "sidebarOpen"
    | "wrap"
  >
): ToolbarSettings {
  return {
    diffStyle: state.diffStyle,
    laneMarkerStyle: state.laneMarkerStyle,
    layout: state.layout,
    lineNumbers: state.lineNumbers,
    sidebarOpen: state.sidebarOpen,
    wrap: state.wrap,
  }
}

export function getFilesPanelView({
  activeFileByLane,
  allFileRows,
  focused,
  focusMode,
  hiddenFileRows,
  indexActiveFile,
  parsed,
  sharedCount,
  state,
}: {
  activeFileByLane: FilesPanelView["activeFileByLane"]
  allFileRows: FilesPanelView["rows"]
  focused: string | null
  focusMode: boolean
  hiddenFileRows: FilesPanelView["hiddenFileRows"]
  indexActiveFile: string | null
  parsed: FilesPanelView["panes"]
  sharedCount: number
  state: Pick<
    WorkbenchState,
    "fileQuery" | "hidden" | "hiddenFiles" | "laneMarkerStyle" | "layout"
  >
}): FilesPanelView {
  const displayActiveFile =
    focused ??
    indexActiveFile ??
    getFirstTreeFileName(allFileRows, state.hiddenFiles)
  const visibleActiveFileByLane = getFilesPanelActiveFileByLane({
    activeFileByLane,
    activeFile: displayActiveFile,
    focused,
    layout: state.layout,
    rows: allFileRows,
  })

  return {
    activeFileByLane: visibleActiveFileByLane,
    activeFile: displayActiveFile,
    focusMode,
    focusFile: focused,
    hidden: state.hidden,
    hiddenFiles: state.hiddenFiles,
    laneMarkerStyle: state.laneMarkerStyle,
    layout: state.layout,
    hiddenFileRows,
    panes: parsed,
    query: state.fileQuery,
    rows: allFileRows,
    sharedCount,
  }
}

function getFirstTreeFileName(
  rows: FilesPanelView["rows"],
  hiddenFiles: Set<string>
) {
  const treeRow = buildVisibleFileTreeRows(
    rows.filter((row) => !hiddenFiles.has(row.name)),
    new Set()
  ).find((item) => item.node.kind === "file" && item.node.row)

  return treeRow?.node.row?.name ?? null
}

function getFilesPanelActiveFileByLane({
  activeFile,
  activeFileByLane,
  focused,
  layout,
  rows,
}: {
  activeFile: string | null
  activeFileByLane: FilesPanelView["activeFileByLane"]
  focused: string | null
  layout: WorkbenchState["layout"]
  rows: FilesPanelView["rows"]
}) {
  const visibleFile = focused ?? activeFile
  if (!visibleFile) return activeFileByLane

  const row = rows.find((item) => item.name === visibleFile)
  if (!row) return activeFileByLane
  const visibleActiveFileByLane = getVisibleActiveFileByLane(
    activeFileByLane,
    rows
  )

  if (!focused && layout !== "rows") {
    return Object.keys(visibleActiveFileByLane).length > 0
      ? visibleActiveFileByLane
      : getActiveFileEntriesForRow(row, visibleFile)
  }

  if (layout === "rows" && !focused) {
    const laneEntry = Object.entries(visibleActiveFileByLane).find(
      ([, fileName]) => fileName === visibleFile
    )
    return laneEntry
      ? { [laneEntry[0]]: visibleFile }
      : row.presentIn[0]
        ? { [row.presentIn[0]]: visibleFile }
        : {}
  }

  return getActiveFileEntriesForRow(row, visibleFile)
}

function getActiveFileEntriesForRow(
  row: FilesPanelView["rows"][number],
  name: string
) {
  return Object.fromEntries(row.presentIn.map((laneId) => [laneId, name]))
}

function getVisibleActiveFileByLane(
  activeFileByLane: FilesPanelView["activeFileByLane"],
  rows: FilesPanelView["rows"]
) {
  const fileNames = new Set(rows.map((row) => row.name))
  return Object.fromEntries(
    Object.entries(activeFileByLane).filter(([, name]) =>
      name ? fileNames.has(name) : false
    )
  )
}

export function getViewportView({
  displayedPaneViews,
  hasErrors,
  navigationTarget,
  renderSettings,
  state,
  visiblePanes,
}: {
  displayedPaneViews: DiffPaneViewportView["displayedPaneViews"]
  hasErrors: boolean
  navigationTarget: DiffPaneViewportView["navigationTarget"]
  renderSettings: DiffRenderSettings
  state: Pick<WorkbenchState, "layout">
  visiblePanes: DiffPaneViewportView["visiblePanes"]
}): DiffPaneViewportView {
  return {
    displayedPaneViews,
    hasErrors,
    layout: state.layout,
    navigationTarget,
    renderSettings,
    visiblePanes,
  }
}

export function getNotesView(
  state: Pick<WorkbenchState, "notes" | "notesOpen">,
  setters: Pick<WorkbenchSetters, "setNotes" | "setNotesOpen">
) {
  return {
    onChange: setters.setNotes,
    onClose: () => setters.setNotesOpen(false),
    onOpen: () => setters.setNotesOpen(true),
    open: state.notesOpen,
    value: state.notes,
  }
}
