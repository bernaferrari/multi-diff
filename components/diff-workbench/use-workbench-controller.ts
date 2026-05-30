import { useTheme } from "next-themes"
import { useCallback, useEffect, useRef, useState } from "react"

import { useDiffDropImport } from "./use-diff-drop-import"
import { usePaneScroll } from "./use-pane-scroll"
import { useWorkbenchActions } from "./use-workbench-actions"
import { useWorkbenchKeyboard } from "./use-workbench-keyboard"
import { useWorkbenchState } from "./use-workbench-state"
import { useWorkbenchViewModel } from "./use-workbench-view-model"
import {
  getFilesPanelActions,
  getToolbarActions,
  getViewportActions,
} from "./workbench-controller-actions"
import {
  getFilesPanelView,
  getNotesView,
  getRenderSettings,
  getToolbarSettings,
  getViewportView,
} from "./workbench-controller-model"
import type { ActiveFileByLane, LaneId } from "./types"

const NAVIGATION_SCROLL_SPY_LOCK_MS = 120

export function useWorkbenchController() {
  const { resolvedTheme } = useTheme()
  const [navigationTarget, setNavigationTarget] = useState<{
    name: string
    token: number
  } | null>(null)
  const [activeFileByLane, setActiveFileByLane] = useState<ActiveFileByLane>({})
  const [focusMode, setFocusMode] = useState(false)
  const navigationLockUntil = useRef(0)
  const appliedColumnsNavigationToken = useRef<number | null>(null)
  const rowsNavigationFile = useRef<string | null>(null)

  const { state, setters } = useWorkbenchState()
  const renderSettings = getRenderSettings({
    diffStyle: state.diffStyle,
    lineNumbers: state.lineNumbers,
    resolvedTheme,
    wrap: state.wrap,
  })

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

  const handleActiveFileChange = useCallback(
    (name: string, sourceId: LaneId) => {
      if (Date.now() < navigationLockUntil.current) return
      if (state.layout === "rows") rowsNavigationFile.current = name
      setters.setActiveFile(name)
      setActiveFileByLane((current) =>
        getNextActiveFileByLane({
          current,
          name,
          sourceId,
        })
      )
    },
    [setters, state.layout]
  )

  const { handleScroll, markScrollDriver, scrollToFile, setViewerRef } =
    usePaneScroll({
      displayedPaneViews,
      paneViews,
      onActiveFileChange: handleActiveFileChange,
    })

  const actions = useWorkbenchActions({
    activeFile: state.activeFile,
    fileRows,
    focusFile: state.focusFile,
    panes: state.panes,
    setters,
  })

  const navigateFile = useCallback(
    (name: string) => {
      navigationLockUntil.current = Date.now() + NAVIGATION_SCROLL_SPY_LOCK_MS
      rowsNavigationFile.current = name
      actions.clearFocusedFile()
      setters.setActiveFile(name)
      setActiveFileByLane((current) => ({
        ...current,
        ...getActiveFileByVisibleLanes(displayedPaneViews, name),
      }))
      setNavigationTarget({ name, token: Date.now() })
    },
    [actions, displayedPaneViews, setters]
  )

  const focusFile = useCallback(
    (name: string) => {
      rowsNavigationFile.current = name
      setters.setActiveFile(name)
      setters.setFocusFile(name)
      setActiveFileByLane((current) => ({
        ...current,
        ...getActiveFileByVisibleLanes(displayedPaneViews, name),
      }))
    },
    [displayedPaneViews, setters]
  )

  const navigateOrFocusFile = useCallback(
    (name: string) => {
      if (focusMode) {
        focusFile(name)
        return
      }
      navigateFile(name)
    },
    [focusFile, focusMode, navigateFile]
  )

  const clearFocusMode = useCallback(() => {
    setFocusMode(false)
    actions.clearFocusedFile()
  }, [actions])

  const toggleFocusMode = useCallback(() => {
    if (focusMode) {
      clearFocusMode()
      return
    }

    setFocusMode(true)
    if (state.activeFile) focusFile(state.activeFile)
  }, [clearFocusMode, focusFile, focusMode, state.activeFile])

  const setLayout = useCallback(
    (layout: typeof state.layout) => {
      if (layout === state.layout) return
      if (layout === "rows") {
        const target =
          getVisibleFileName(rowsNavigationFile.current, fileRows) ??
          getVisibleFileName(state.activeFile, fileRows) ??
          indexActiveFile

        if (target) {
          navigationLockUntil.current =
            Date.now() + NAVIGATION_SCROLL_SPY_LOCK_MS
          rowsNavigationFile.current = target
          setters.setActiveFile(target)
          setActiveFileByLane((current) => ({
            ...current,
            ...getActiveFileByVisibleLanes(displayedPaneViews, target),
          }))
          setNavigationTarget({ name: target, token: Date.now() })
        }
      }
      setters.setLayout(layout)
    },
    [
      displayedPaneViews,
      fileRows,
      indexActiveFile,
      setters,
      state.activeFile,
      state.layout,
    ]
  )

  useEffect(() => {
    if (state.layout !== "columns" || !navigationTarget) return
    if (appliedColumnsNavigationToken.current === navigationTarget.token) return
    scrollToFile(navigationTarget.name)
    appliedColumnsNavigationToken.current = navigationTarget.token
  }, [navigationTarget, scrollToFile, state.layout])

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

  const toolbarSettings = getToolbarSettings(state)
  const toolbarActions = {
    ...getToolbarActions({
      actions,
      setters: {
        ...setters,
        setLayout,
      },
    }),
    onImportFiles: actions.importFiles,
  }

  const filesPanelView = getFilesPanelView({
    activeFileByLane,
    allFileRows,
    focused,
    focusMode,
    hiddenFileRows,
    indexActiveFile,
    parsed,
    sharedCount,
    state,
  })
  const filesPanelActions = getFilesPanelActions({
    actions: filePanelActions,
    setters,
  })

  const viewportView = getViewportView({
    displayedPaneViews,
    hasErrors,
    navigationTarget,
    renderSettings,
    state,
    visiblePanes,
  })
  const viewportActions = getViewportActions({
    actions,
    onPaneScroll: handleScroll,
    onPaneScrollIntent: markScrollDriver,
    onRowsActiveFileChange: handleActiveFileChange,
    onViewerRef: setViewerRef,
  })

  return {
    dragging: state.dragging,
    filesPanel: {
      actions: filesPanelActions,
      view: filesPanelView,
    },
    notes: getNotesView(state, setters),
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

function getVisibleFileName(name: string | null, rows: { name: string }[]) {
  if (!name) return null
  return rows.some((row) => row.name === name) ? name : null
}

function getActiveFileByVisibleLanes(
  displayedPaneViews: {
    pane: { id: LaneId }
    paneView: { idByName: Map<string, string> }
  }[],
  name: string
): ActiveFileByLane {
  return Object.fromEntries(
    displayedPaneViews
      .filter(({ paneView }) => paneView.idByName.has(name))
      .map(({ pane }) => [pane.id, name])
  )
}

function getNextActiveFileByLane({
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
