import type { DiffPaneViewportActions } from "./diff-pane-viewport"
import type { FilesPanelActions } from "./files-panel"
import type { ToolbarActions } from "./toolbar"
import type { LaneId, Layout } from "./types"
import type { WorkbenchSetters } from "./workbench-state-model"

type ControllerActions = {
  clearFocusedFile: () => void
  clearLaneDiff: (id: LaneId) => void
  hideFiles: (names: string[]) => void
  importFiles: (files: FileList | null, paneId?: LaneId) => void
  moveLaneDiff: (sourceId: LaneId, targetId: LaneId) => void
  navigateFile: (name: string) => void
  resetWorkbench: () => void
  showAllFiles: () => void
  showFiles: (names: string[]) => void
  toggleFocusFile: (name: string) => void
  toggleFocusMode: () => void
  toggleLane: (id: LaneId) => void
}

export function getToolbarActions({
  actions,
  setters,
}: {
  actions: Pick<ControllerActions, "resetWorkbench">
  setters: ToolbarSetters
}): Omit<ToolbarActions, "onImportFiles"> {
  return {
    onReset: actions.resetWorkbench,
    setDiffStyle: setters.setDiffStyle,
    setLaneMarkerStyle: setters.setLaneMarkerStyle,
    setLayout: setters.setLayout,
    setLineNumbers: setters.setLineNumbers,
    setSidebarOpen: setters.setSidebarOpen,
    setWrap: setters.setWrap,
  }
}

type ToolbarSetters = Pick<
  WorkbenchSetters,
  | "setDiffStyle"
  | "setLaneMarkerStyle"
  | "setLineNumbers"
  | "setSidebarOpen"
  | "setWrap"
> & {
  setLayout: (layout: Layout) => void
}

export function getFilesPanelActions({
  actions,
  setters,
}: {
  actions: Pick<
    ControllerActions,
    | "clearFocusedFile"
    | "hideFiles"
    | "navigateFile"
    | "showAllFiles"
    | "showFiles"
    | "toggleFocusFile"
    | "toggleFocusMode"
    | "toggleLane"
  >
  setters: Pick<WorkbenchSetters, "setFileQuery">
}): FilesPanelActions {
  return {
    onFilterFile: actions.toggleFocusFile,
    onNavigate: actions.navigateFile,
    onHideFiles: actions.hideFiles,
    onOverview: actions.clearFocusedFile,
    onQuery: setters.setFileQuery,
    onShowAllFiles: actions.showAllFiles,
    onShowFiles: actions.showFiles,
    onToggleFocusMode: actions.toggleFocusMode,
    onToggleLane: actions.toggleLane,
  }
}

export function getViewportActions({
  actions,
  onPaneScroll,
  onPaneScrollIntent,
  onRowsActiveFileChange,
  onViewerRef,
}: {
  actions: Pick<
    ControllerActions,
    "clearLaneDiff" | "importFiles" | "moveLaneDiff" | "toggleLane"
  >
  onPaneScroll: DiffPaneViewportActions["onPaneScroll"]
  onPaneScrollIntent: DiffPaneViewportActions["onPaneScrollIntent"]
  onRowsActiveFileChange: DiffPaneViewportActions["onRowsActiveFileChange"]
  onViewerRef: DiffPaneViewportActions["onViewerRef"]
}): DiffPaneViewportActions {
  return {
    onClearLaneDiff: actions.clearLaneDiff,
    onHideLane: actions.toggleLane,
    onImportFiles: (files, paneId) => void actions.importFiles(files, paneId),
    onMoveLane: actions.moveLaneDiff,
    onPaneScroll,
    onPaneScrollIntent,
    onRowsActiveFileChange,
    onViewerRef,
  }
}
