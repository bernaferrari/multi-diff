import { useCallback, useMemo } from "react"

import type { FileRow, Pane } from "./types"
import { useFileFocusActions } from "./use-file-focus-actions"
import { useFileVisibilityActions } from "./use-file-visibility-actions"
import { useImportActions } from "./use-import-actions"
import { useLaneActions } from "./use-lane-actions"
import { clearHiddenFileNames } from "./file-visibility-state"
import { createSamplePanes } from "./sample-panes"
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

  const { clearLaneDiff, moveLaneDiff, toggleLane } = useLaneActions({
    panes,
    setHidden,
    setPanes,
  })

  const { hideFiles, showAllFiles, showFiles } = useFileVisibilityActions({
    setActiveFile,
    setFocusFile,
    setHiddenFiles,
  })

  const { clearFocusedFile, focusFileByOffset, toggleFocusFile } =
    useFileFocusActions({
      activeFile,
      fileRows,
      focusFile,
      setFocusFile,
    })

  const { importFiles } = useImportActions({
    setHidden,
    setHiddenFiles,
    setPanes,
  })

  const toggleNotes = useCallback(() => {
    setNotesOpen((open) => !open)
  }, [setNotesOpen])

  const resetWorkbench = useCallback(() => {
    setPanes(createSamplePanes())
    setHidden(new Set())
    setHiddenFiles(clearHiddenFileNames())
    setActiveFile(null)
    setFocusFile(null)
  }, [
    setActiveFile,
    setFocusFile,
    setHidden,
    setHiddenFiles,
    setPanes,
  ])

  return useMemo(
    () => ({
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
    }),
    [
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
    ]
  )
}
