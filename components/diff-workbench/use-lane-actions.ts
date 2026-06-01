import { type Dispatch, type SetStateAction, useCallback } from "react"

import { clearLane, swapLaneContents, toggleHiddenLane } from "./lane-state"
import type { LaneId, Pane } from "./types"

export function useLaneActions({
  panes,
  setHidden,
  setPanes,
}: {
  panes: Pane[]
  setHidden: Dispatch<SetStateAction<Set<LaneId>>>
  setPanes: Dispatch<SetStateAction<Pane[]>>
}) {
  const toggleLane = useCallback(
    (id: LaneId) => {
      setHidden((current) => toggleHiddenLane(current, id, panes.length))
    },
    [panes.length, setHidden]
  )

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

  return {
    clearLaneDiff,
    moveLaneDiff,
    toggleLane,
  }
}
