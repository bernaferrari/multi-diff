import { useTheme } from "next-themes"
import { useCallback, useMemo } from "react"

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
  const codeTheme = resolvedTheme === "dark" ? "dark" : "light"
  const renderSettings = useMemo(
    () =>
      ({
        codeTheme,
        diffStyle: state.diffStyle,
        lineNumbers: state.lineNumbers,
        wrap: state.wrap,
      }) as const,
    [codeTheme, state.diffStyle, state.lineNumbers, state.wrap]
  )

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

  const toolbarSettings = useMemo(
    () => ({
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
    () => ({
      onImportFiles: actions.importFiles,
      onReset: actions.resetWorkbench,
      setDiffStyle: setters.setDiffStyle,
      setLaneMarkerStyle: setters.setLaneMarkerStyle,
      setLayout,
      setLineNumbers: setters.setLineNumbers,
      setSidebarOpen: setters.setSidebarOpen,
      setWrap: setters.setWrap,
    }),
    [
      actions.importFiles,
      actions.resetWorkbench,
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
    () => ({
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
    () => ({
      displayedPaneViews,
      hasErrors,
      layout: state.layout,
      navigationTarget,
      renderSettings,
      visiblePanes,
    }),
    [
      displayedPaneViews,
      hasErrors,
      navigationTarget,
      renderSettings,
      state.layout,
      visiblePanes,
    ]
  )
  const viewportActions = useMemo(
    () => ({
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
    dragging: state.dragging,
    filesPanel: {
      actions: filesPanelActions,
      view: filesPanelView,
    },
    notes: {
      onChange: setters.setNotes,
      onClose: closeNotes,
      onOpen: openNotes,
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
