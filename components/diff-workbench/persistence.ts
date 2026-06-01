import type { DiffStyle, LaneMarkerStyle, Layout, Pane } from "./types"
import { restoreStoredWorkbenchState } from "./persistence-restore"

export const STORAGE_KEY = "sf-diff:v1"

type WorkbenchStorage = Pick<Storage, "getItem" | "setItem">

export type StoredWorkbenchState = {
  panes?: Pane[]
  notes?: string
  layout?: Layout
  diffStyle?: DiffStyle
  wrap?: boolean
  lineNumbers?: boolean
  laneMarkerStyle?: LaneMarkerStyle
  sidebarOpen?: boolean
}

export type WorkbenchPersistenceState = Required<StoredWorkbenchState>

export function getWorkbenchPersistenceState(
  state: WorkbenchPersistenceState
): WorkbenchPersistenceState {
  return {
    diffStyle: state.diffStyle,
    layout: state.layout,
    lineNumbers: state.lineNumbers,
    laneMarkerStyle: state.laneMarkerStyle,
    notes: state.notes,
    panes: state.panes,
    sidebarOpen: state.sidebarOpen,
    wrap: state.wrap,
  }
}

export function readStoredWorkbenchState(
  storage: WorkbenchStorage = localStorage
): StoredWorkbenchState | null {
  const saved = readStoredValue(storage)
  return restoreStoredWorkbenchState(saved)
}

function readStoredValue(storage: WorkbenchStorage): unknown {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

export function writeStoredWorkbenchState(
  state: StoredWorkbenchState,
  storage: WorkbenchStorage = localStorage
) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota errors
  }
}
