import { useEffect, useRef } from "react"

import {
  readStoredWorkbenchState,
  type StoredWorkbenchState,
  writeStoredWorkbenchState,
} from "./persistence"
import type {
  WorkbenchPersistenceState,
  WorkbenchSetters,
} from "./workbench-state-model"

export type WorkbenchPersistenceSetters = Pick<
  WorkbenchSetters,
  | "setDiffStyle"
  | "setLayout"
  | "setLineNumbers"
  | "setLaneMarkerStyle"
  | "setNotes"
  | "setPanes"
  | "setSidebarOpen"
  | "setWrap"
>

export function useWorkbenchPersistence(
  state: WorkbenchPersistenceState,
  setters: WorkbenchPersistenceSetters
) {
  const readyToPersist = useRef(false)

  useEffect(() => {
    if (!readyToPersist.current) {
      readyToPersist.current = true
      return
    }
    writeStoredWorkbenchState(state)
  }, [state])

  /* Restore persisted session once on mount. This must run after hydration:
   * localStorage is client-only and reading it during render risks SSR drift. */
  useEffect(() => {
    const saved = readStoredWorkbenchState()
    applyStoredWorkbenchState(saved, setters)
  }, [setters])
}

export function applyStoredWorkbenchState(
  saved: StoredWorkbenchState | null,
  setters: WorkbenchPersistenceSetters
) {
  if (!saved) return
  if (saved.panes) setters.setPanes(saved.panes)
  if (saved.notes != null) setters.setNotes(saved.notes)
  if (saved.layout) setters.setLayout(saved.layout)
  if (saved.diffStyle) setters.setDiffStyle(saved.diffStyle)
  if (saved.wrap != null) setters.setWrap(saved.wrap)
  if (saved.lineNumbers != null) setters.setLineNumbers(saved.lineNumbers)
  if (saved.laneMarkerStyle) setters.setLaneMarkerStyle(saved.laneMarkerStyle)
  if (saved.sidebarOpen != null) setters.setSidebarOpen(saved.sidebarOpen)
}
