import { useCallback, useMemo } from "react"

import { getFilesPanelView } from "./files-panel-view-state"
import type { DiffPaneViewportActions } from "./diff-pane-viewport"
import {
  getFilesPanelActions,
  getRenderSettings,
  getToolbarActions,
  getToolbarSettings,
  getViewportActions,
  getViewportView,
} from "./workbench-controller-model"
import type { useWorkbenchActions } from "./use-workbench-actions"
import type { DisplayedPaneView } from "./pane-view-model"
import type {
  ActiveFileByLane,
  FileNavigationTarget,
  FileRow,
  LaneId,
  Layout,
  ParsedPane,
} from "./types"
import type { WorkbenchSetters, WorkbenchState } from "./workbench-state-model"

type WorkbenchActionModel = ReturnType<typeof useWorkbenchActions>

export function useWorkbenchControllerModels({
  actions,
  activeFileByLane,
  allFileRows,
  codeTheme,
  clearFocusMode,
  displayedPaneViews,
  fileRows,
  focused,
  focusMode,
  handleActiveFileChange,
  handleScroll,
  hasErrors,
  hiddenFileRows,
  indexActiveFile,
  markScrollDriver,
  navigateOrFocusFile,
  navigationTarget,
  parsed,
  setLayout,
  setters,
  setViewerRef,
  sharedCount,
  state,
  toggleFocusMode,
  visiblePanes,
}: {
  actions: WorkbenchActionModel
  activeFileByLane: ActiveFileByLane
  allFileRows: FileRow[]
  codeTheme: "dark" | "light"
  clearFocusMode: () => void
  displayedPaneViews: DisplayedPaneView[]
  fileRows: FileRow[]
  focused: string | null
  focusMode: boolean
  handleActiveFileChange: (name: string, sourceId: LaneId) => void
  handleScroll: (sourceId: LaneId) => void
  hasErrors: boolean
  hiddenFileRows: FileRow[]
  indexActiveFile: string | null
  markScrollDriver: (id: LaneId) => void
  navigateOrFocusFile: (name: string) => void
  navigationTarget: FileNavigationTarget | null
  parsed: ParsedPane[]
  setLayout: (layout: Layout) => void
  setters: WorkbenchSetters
  setViewerRef: DiffPaneViewportActions["onViewerRef"]
  sharedCount: number
  state: WorkbenchState
  toggleFocusMode: (preferredFile?: string | null) => void
  visiblePanes: ParsedPane[]
}) {
  const renderSettings = useMemo(
    () =>
      getRenderSettings({
        codeTheme,
        diffStyle: state.diffStyle,
        lineNumbers: state.lineNumbers,
        wrap: state.wrap,
      }),
    [codeTheme, state.diffStyle, state.lineNumbers, state.wrap]
  )

  const toolbarSettings = useMemo(
    () =>
      getToolbarSettings({
        diffStyle: state.diffStyle,
        laneMarkerStyle: state.laneMarkerStyle,
        layout: state.layout,
        lineNumbers: state.lineNumbers,
        panes: state.panes,
        sidebarOpen: state.sidebarOpen,
        wrap: state.wrap,
      }),
    [
      state.diffStyle,
      state.laneMarkerStyle,
      state.layout,
      state.lineNumbers,
      state.panes,
      state.sidebarOpen,
      state.wrap,
    ]
  )

  const toolbarActions = useMemo(
    () =>
      getToolbarActions({
        onClearAll: actions.clearWorkbench,
        onImportFiles: actions.importFiles,
        onLoadSamples: actions.loadSampleWorkbench,
        setDiffStyle: setters.setDiffStyle,
        setLaneMarkerStyle: setters.setLaneMarkerStyle,
        setLayout,
        setLineNumbers: setters.setLineNumbers,
        setSidebarOpen: setters.setSidebarOpen,
        setWrap: setters.setWrap,
      }),
    [
      actions.clearWorkbench,
      actions.importFiles,
      actions.loadSampleWorkbench,
      setLayout,
      setters.setDiffStyle,
      setters.setLaneMarkerStyle,
      setters.setLineNumbers,
      setters.setSidebarOpen,
      setters.setWrap,
    ]
  )

  const filesPanelView = getFilesPanelView({
    activeFileByLane,
    allFileRows,
    fileRows,
    focused,
    focusMode,
    hiddenFileRows,
    indexActiveFile,
    parsed,
    sharedCount,
    state,
  })

  const filesPanelActions = useMemo(
    () =>
      getFilesPanelActions({
        onFilterFile: actions.toggleFocusFile,
        onHideFiles: actions.hideFiles,
        onNavigate: navigateOrFocusFile,
        onOverview: clearFocusMode,
        onQuery: setters.setFileQuery,
        onShowAllFiles: actions.showAllFiles,
        onShowFiles: actions.showFiles,
        onToggleFocusMode: toggleFocusMode,
        onToggleLane: actions.toggleLane,
      }),
    [
      actions.hideFiles,
      actions.showAllFiles,
      actions.showFiles,
      actions.toggleFocusFile,
      actions.toggleLane,
      clearFocusMode,
      navigateOrFocusFile,
      setters.setFileQuery,
      toggleFocusMode,
    ]
  )

  const viewportView = useMemo(
    () =>
      getViewportView({
        displayedPaneViews,
        hasErrors,
        layout: state.layout,
        navigationTarget,
        parseErrors: parsed
          .filter((pane) => pane.error)
          .map((pane) => ({
            label: pane.label,
            message: pane.error ?? "",
          })),
        renderSettings,
        visiblePanes,
      }),
    [
      displayedPaneViews,
      hasErrors,
      navigationTarget,
      parsed,
      renderSettings,
      state.layout,
      visiblePanes,
    ]
  )

  const viewportActions = useMemo(
    () =>
      getViewportActions({
        onClearLaneDiff: actions.clearLaneDiff,
        onHideLane: actions.toggleLane,
        onImportFiles: actions.importFiles,
        onMoveLane: actions.moveLaneDiff,
        onPaneScroll: handleScroll,
        onPaneScrollIntent: markScrollDriver,
        onRowsActiveFileChange: handleActiveFileChange,
        onViewerRef: setViewerRef,
      }),
    [
      actions.clearLaneDiff,
      actions.importFiles,
      actions.moveLaneDiff,
      actions.toggleLane,
      handleActiveFileChange,
      handleScroll,
      markScrollDriver,
      setViewerRef,
    ]
  )
  const closeNotes = useCallback(() => setters.setNotesOpen(false), [setters])
  const openNotes = useCallback(() => setters.setNotesOpen(true), [setters])

  return {
    filesPanelActions,
    filesPanelView,
    notes: {
      onChange: setters.setNotes,
      onClose: closeNotes,
      onOpen: openNotes,
      open: state.notesOpen,
      value: state.notes,
    },
    toolbarActions,
    toolbarSettings,
    viewportActions,
    viewportView,
  }
}
