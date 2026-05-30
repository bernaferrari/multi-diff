import { useCallback } from "react"

import { getFileFocusByOffset } from "./file-focus-state"
import { clearLane, swapLaneContents, toggleHiddenLane } from "./lane-state"
import type { FileRow, LaneId, Pane } from "./types"
import { useFileVisibilityActions } from "./use-file-visibility-actions"
import { useImportActions } from "./use-import-actions"
import { getWorkbenchActionState } from "./workbench-action-state"
import type { WorkbenchSetters } from "./workbench-state-model"

type WorkbenchActionSetters = Pick<
  WorkbenchSetters,
  | "setActiveFile"
  | "setFocusFile"
  | "setHidden"
  | "setHiddenFiles"
  | "setNotesOpen"
  | "setPanes"
>

const workbenchActionState = getWorkbenchActionState()

export function useWorkbenchActions({
  activeFile,
  fileRows,
  focusFile,
  panes,
  setters,
}: {
  activeFile: string | null
  fileRows: FileRow[]
  focusFile: string | null
  panes: Pane[]
  setters: WorkbenchActionSetters
}) {
  const {
    setActiveFile,
    setFocusFile,
    setHidden,
    setHiddenFiles,
    setNotesOpen,
    setPanes,
  } = setters

  const toggleLane = useCallback(
    (id: LaneId) => {
      setHidden((current) => toggleHiddenLane(current, id, panes.length))
    },
    [panes.length, setHidden]
  )

  const { hideFiles, showAllFiles, showFiles } = useFileVisibilityActions({
    setActiveFile,
    setFocusFile,
    setHiddenFiles,
  })

  const clearLaneDiff = useCallback(
    (id: LaneId) => {
      setPanes((current) => clearLane(current, id))
    },
    [setPanes]
  )

  const moveLaneDiff = useCallback(
    (sourceId: LaneId, targetId: LaneId) => {
      setPanes((current) => swapLaneContents(current, sourceId, targetId))
    },
    [setPanes]
  )

  const { importFiles } = useImportActions({
    setHidden,
    setHiddenFiles,
    setPanes,
  })

  const focusFileByOffset = useCallback(
    (delta: number) => {
      const next = getFileFocusByOffset({
        activeFile,
        delta,
        focusFile,
        rows: fileRows,
      })
      if (next) setFocusFile(next)
    },
    [activeFile, fileRows, focusFile, setFocusFile]
  )

  const clearFocusedFile = useCallback(() => {
    setFocusFile(null)
  }, [setFocusFile])

  const toggleFocusFile = useCallback(
    (name: string) => {
      setFocusFile((current) =>
        workbenchActionState.toggleFileFocus(current, name)
      )
    },
    [setFocusFile]
  )

  const toggleNotes = useCallback(() => {
    setNotesOpen(workbenchActionState.toggleNotesOpen)
  }, [setNotesOpen])

  const resetWorkbench = useCallback(() => {
    const reset = workbenchActionState.getResetState()
    setPanes(reset.panes)
    setHidden(reset.hidden)
    setHiddenFiles(reset.hiddenFiles)
    setActiveFile(reset.activeFile)
    setFocusFile(reset.focusFile)
  }, [
    setActiveFile,
    setFocusFile,
    setHidden,
    setHiddenFiles,
    setPanes,
  ])

  return {
    clearFocusedFile,
    clearLaneDiff,
    focusFileByOffset,
    hideFiles,
    importFiles,
    moveLaneDiff,
    resetWorkbench,
    showAllFiles,
    showFiles,
    toggleFocusFile,
    toggleLane,
    toggleNotes,
  }
}
