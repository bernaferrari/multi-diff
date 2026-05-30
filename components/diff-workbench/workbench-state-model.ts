import type { Dispatch, SetStateAction } from "react"

import type { StoredWorkbenchState } from "./persistence"
import { createSamplePanes } from "./sample-panes"
import type { DiffStyle, LaneId, LaneMarkerStyle, Layout, Pane } from "./types"

export type WorkbenchState = {
  activeFile: string | null
  dragging: boolean
  diffStyle: DiffStyle
  fileQuery: string
  focusFile: string | null
  hidden: Set<LaneId>
  hiddenFiles: Set<string>
  layout: Layout
  lineNumbers: boolean
  laneMarkerStyle: LaneMarkerStyle
  notes: string
  notesOpen: boolean
  panes: Pane[]
  sidebarOpen: boolean
  wrap: boolean
}

export type WorkbenchSetters = {
  setActiveFile: Dispatch<SetStateAction<string | null>>
  setDragging: Dispatch<SetStateAction<boolean>>
  setDiffStyle: Dispatch<SetStateAction<DiffStyle>>
  setFileQuery: Dispatch<SetStateAction<string>>
  setFocusFile: Dispatch<SetStateAction<string | null>>
  setHidden: Dispatch<SetStateAction<Set<LaneId>>>
  setHiddenFiles: Dispatch<SetStateAction<Set<string>>>
  setLayout: Dispatch<SetStateAction<Layout>>
  setLineNumbers: Dispatch<SetStateAction<boolean>>
  setLaneMarkerStyle: Dispatch<SetStateAction<LaneMarkerStyle>>
  setNotes: Dispatch<SetStateAction<string>>
  setNotesOpen: Dispatch<SetStateAction<boolean>>
  setPanes: Dispatch<SetStateAction<Pane[]>>
  setSidebarOpen: Dispatch<SetStateAction<boolean>>
  setWrap: Dispatch<SetStateAction<boolean>>
}

type DurableWorkbenchState = Pick<
  WorkbenchState,
  | "diffStyle"
  | "layout"
  | "lineNumbers"
  | "laneMarkerStyle"
  | "notes"
  | "panes"
  | "sidebarOpen"
  | "wrap"
>

export type WorkbenchPersistenceState = Required<
  Pick<
    StoredWorkbenchState,
    | "diffStyle"
    | "layout"
    | "lineNumbers"
    | "laneMarkerStyle"
    | "notes"
    | "panes"
    | "sidebarOpen"
    | "wrap"
  >
>

export function createInitialWorkbenchState(): WorkbenchState {
  return {
    activeFile: null,
    dragging: false,
    diffStyle: "unified",
    fileQuery: "",
    focusFile: null,
    hidden: new Set(),
    hiddenFiles: new Set(),
    layout: "columns",
    lineNumbers: true,
    laneMarkerStyle: "letters",
    notes: "",
    notesOpen: false,
    panes: createSamplePanes(),
    sidebarOpen: true,
    wrap: true,
  }
}

export function getWorkbenchState(state: WorkbenchState): WorkbenchState {
  return state
}

export function getWorkbenchSetters(setters: WorkbenchSetters): WorkbenchSetters {
  return setters
}

export function getWorkbenchPersistenceState(
  state: DurableWorkbenchState
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
