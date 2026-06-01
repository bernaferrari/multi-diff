import { useTheme } from "next-themes"

import { useColumnsNavigationEffect } from "./use-columns-navigation-effect"
import { useDiffDropImport } from "./use-diff-drop-import"
import { usePaneScroll } from "./use-pane-scroll"
import { useWorkbenchActions } from "./use-workbench-actions"
import { useWorkbenchKeyboard } from "./use-workbench-keyboard"
import { useWorkbenchNavigation } from "./use-workbench-navigation"
import { useWorkbenchState } from "./use-workbench-state"
import { useWorkbenchViewModel } from "./use-workbench-view-model"
import { getFilesPanelView } from "./files-panel-view-state"

export function useWorkbenchController() {
  const { resolvedTheme } = useTheme()

  const { state, setters } = useWorkbenchState()
  const renderSettings = {
    codeTheme: resolvedTheme === "dark" ? "dark" : "light",
    diffStyle: state.diffStyle,
    lineNumbers: state.lineNumbers,
    wrap: state.wrap,
  } as const

  const {
    allFileRows,
    displayedPaneViews,
    fileRows,
    focused,
    hasErrors,
    hiddenFileRows,
    indexActiveFile,
    paneViews,
    parsed,
    sharedCount,
    visiblePanes,
  } = useWorkbenchViewModel({
    activeFile: state.activeFile,
    focusFile: state.focusFile,
    hidden: state.hidden,
    hiddenFiles: state.hiddenFiles,
    panes: state.panes,
  })

  const actions = useWorkbenchActions({
    activeFile: state.activeFile,
    fileRows,
    focusFile: state.focusFile,
    panes: state.panes,
    setters,
  })

  const {
    activeFileByLane,
    clearFocusMode,
    focusMode,
    handleActiveFileChange,
    navigateOrFocusFile,
    navigationTarget,
    setLayout,
    toggleFocusMode,
  } = useWorkbenchNavigation({
    activeFile: state.activeFile,
    clearFocusedFile: actions.clearFocusedFile,
    displayedPaneViews,
    fileRows,
    focusedFile: focused,
    indexActiveFile,
    layout: state.layout,
    setters,
  })

  const { handleScroll, markScrollDriver, scrollToFile, setViewerRef } =
    usePaneScroll({
      displayedPaneViews,
      paneViews,
      onActiveFileChange: handleActiveFileChange,
    })

  useColumnsNavigationEffect({
    layout: state.layout,
    navigationTarget,
    scrollToFile,
  })

  const filePanelActions = {
    ...actions,
    clearFocusedFile: clearFocusMode,
    navigateFile: navigateOrFocusFile,
    toggleFocusMode,
  }

  useWorkbenchKeyboard({
    focusFile: state.focusFile,
    onClearFocus: clearFocusMode,
    onMoveFocus: actions.focusFileByOffset,
    onToggleNotes: actions.toggleNotes,
  })

  useDiffDropImport({
    onDraggingChange: setters.setDragging,
    onImport: actions.importFiles,
  })

  const toolbarSettings = {
    diffStyle: state.diffStyle,
    laneMarkerStyle: state.laneMarkerStyle,
    layout: state.layout,
    lineNumbers: state.lineNumbers,
    panes: state.panes,
    sidebarOpen: state.sidebarOpen,
    wrap: state.wrap,
  }
  const toolbarActions = {
    onImportFiles: actions.importFiles,
    onReset: actions.resetWorkbench,
    setDiffStyle: setters.setDiffStyle,
    setLaneMarkerStyle: setters.setLaneMarkerStyle,
    setLayout,
    setLineNumbers: setters.setLineNumbers,
    setSidebarOpen: setters.setSidebarOpen,
    setWrap: setters.setWrap,
  }

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
  const filesPanelActions = {
    onFilterFile: filePanelActions.toggleFocusFile,
    onHideFiles: filePanelActions.hideFiles,
    onNavigate: filePanelActions.navigateFile,
    onOverview: filePanelActions.clearFocusedFile,
    onQuery: setters.setFileQuery,
    onShowAllFiles: filePanelActions.showAllFiles,
    onShowFiles: filePanelActions.showFiles,
    onToggleFocusMode: filePanelActions.toggleFocusMode,
    onToggleLane: filePanelActions.toggleLane,
  }

  const viewportView = {
    displayedPaneViews,
    hasErrors,
    layout: state.layout,
    navigationTarget,
    renderSettings,
    visiblePanes,
  }
  const viewportActions = {
    onClearLaneDiff: actions.clearLaneDiff,
    onHideLane: actions.toggleLane,
    onImportFiles: actions.importFiles,
    onMoveLane: actions.moveLaneDiff,
    onPaneScroll: handleScroll,
    onPaneScrollIntent: markScrollDriver,
    onRowsActiveFileChange: handleActiveFileChange,
    onViewerRef: setViewerRef,
  }

  return {
    dragging: state.dragging,
    filesPanel: {
      actions: filesPanelActions,
      view: filesPanelView,
    },
    notes: {
      onChange: setters.setNotes,
      onClose: () => setters.setNotesOpen(false),
      onOpen: () => setters.setNotesOpen(true),
      open: state.notesOpen,
      value: state.notes,
    },
    onInputFiles: actions.importFiles,
    sidebarOpen: state.sidebarOpen,
    toolbar: {
      actions: toolbarActions,
      settings: toolbarSettings,
    },
    viewport: {
      actions: viewportActions,
      view: viewportView,
    },
  }
}
