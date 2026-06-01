import { useCallback, useRef, useState } from "react"

import {
  getFocusModeToggleAction,
  getNavigationFallbackFile,
  getNavigationActiveFileByLane,
  getNavigationScrollLockUntil,
  getNextActiveFileByLane,
  getRowsLayoutNavigationTarget,
  isNavigationScrollLocked,
  type PaneFileLookup,
} from "./workbench-navigation-state"
import type { ActiveFileByLane, FileRow, LaneId, Layout } from "./types"
import type { WorkbenchSetters } from "./workbench-state-model"

type WorkbenchNavigationSetters = Pick<
  WorkbenchSetters,
  "setActiveFile" | "setFocusFile" | "setLayout"
>

export function useWorkbenchNavigation({
  activeFile,
  clearFocusedFile,
  displayedPaneViews,
  fileRows,
  focusedFile,
  indexActiveFile,
  layout,
  setters,
}: {
  activeFile: string | null
  clearFocusedFile: () => void
  displayedPaneViews: PaneFileLookup[]
  fileRows: FileRow[]
  focusedFile: string | null
  indexActiveFile: string | null
  layout: Layout
  setters: WorkbenchNavigationSetters
}) {
  const [navigationTarget, setNavigationTarget] = useState<{
    name: string
    token: number
  } | null>(null)
  const [activeFileByLane, setActiveFileByLane] = useState<ActiveFileByLane>({})
  const [focusMode, setFocusMode] = useState(false)
  const navigationLockUntil = useRef(0)
  const rowsNavigationFile = useRef<string | null>(null)

  const activateFile = useCallback(
    ({
      clearFocus,
      focus,
      name,
    }: {
      clearFocus?: boolean
      focus?: boolean
      name: string
    }) => {
      const token = Date.now()
      navigationLockUntil.current = getNavigationScrollLockUntil(token)
      rowsNavigationFile.current = name
      if (clearFocus) clearFocusedFile()
      setters.setActiveFile(name)
      if (focus) setters.setFocusFile(name)
      setActiveFileByLane((current) =>
        getNavigationActiveFileByLane({
          currentActiveFileByLane: current,
          displayedPaneViews,
          fallbackName: getNavigationFallbackFile({
            activeFile,
            fileRows,
            indexActiveFile,
          }),
          name,
        })
      )
      setNavigationTarget({ name, token })
    },
    [
      activeFile,
      clearFocusedFile,
      displayedPaneViews,
      fileRows,
      indexActiveFile,
      setters,
    ]
  )

  const handleActiveFileChange = useCallback(
    (name: string, sourceId: LaneId) => {
      if (
        isNavigationScrollLocked({
          lockUntil: navigationLockUntil.current,
          now: Date.now(),
        })
      ) {
        return
      }
      if (layout === "rows") rowsNavigationFile.current = name
      setters.setActiveFile(name)
      setActiveFileByLane((current) =>
        getNextActiveFileByLane({
          current,
          name,
          sourceId,
        })
      )
    },
    [layout, setters]
  )

  const navigateFile = useCallback(
    (name: string) => {
      activateFile({ clearFocus: true, name })
    },
    [activateFile]
  )

  const focusFile = useCallback(
    (name: string) => {
      activateFile({ focus: true, name })
    },
    [activateFile]
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
    clearFocusedFile()
  }, [clearFocusedFile])

  const toggleFocusMode = useCallback(
    (preferredFile?: string | null) => {
      const action = getFocusModeToggleAction({
        activeFile,
        activeFileByLane,
        fileRows,
        focusedFile,
        focusMode,
        indexActiveFile,
        preferredFile,
      })

      if (action.type === "clear") {
        clearFocusMode()
        return
      }

      if (action.type === "select") {
        setFocusMode(true)
        focusFile(action.name)
      }
    },
    [
      activeFile,
      activeFileByLane,
      clearFocusMode,
      fileRows,
      focusedFile,
      focusFile,
      focusMode,
      indexActiveFile,
    ]
  )

  const setLayout = useCallback(
    (nextLayout: Layout) => {
      if (nextLayout === layout) return
      if (nextLayout === "rows") {
        const target = getRowsLayoutNavigationTarget({
          activeFile,
          fileRows,
          indexActiveFile,
          rowsNavigationFile: rowsNavigationFile.current,
        })

        if (target) activateFile({ name: target })
      }
      setters.setLayout(nextLayout)
    },
    [activateFile, activeFile, fileRows, indexActiveFile, layout, setters]
  )

  return {
    activeFileByLane,
    clearFocusMode,
    focusMode,
    handleActiveFileChange,
    navigateOrFocusFile,
    navigationTarget,
    setLayout,
    toggleFocusMode,
  }
}
