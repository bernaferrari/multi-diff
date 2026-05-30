import { type Dispatch, type SetStateAction, useCallback } from "react"

import {
  applyImportedFiles,
  getPostImportVisibilityState,
  readImportFiles,
} from "./import-state"
import type { LaneId, Pane } from "./types"

export function useImportActions({
  setHidden,
  setHiddenFiles,
  setPanes,
}: {
  setHidden: Dispatch<SetStateAction<Set<LaneId>>>
  setHiddenFiles: Dispatch<SetStateAction<Set<string>>>
  setPanes: Dispatch<SetStateAction<Pane[]>>
}) {
  const importFiles = useCallback(
    async (fileList: FileList | null, target?: LaneId) => {
      const reads = await readImportFiles(fileList)
      if (!reads.length) return

      setPanes((current) =>
        applyImportedFiles({ panes: current, reads, target })
      )
      const visibility = getPostImportVisibilityState()
      setHidden(visibility.hidden)
      setHiddenFiles(visibility.hiddenFiles)
    },
    [setHidden, setHiddenFiles, setPanes]
  )

  return { importFiles }
}
