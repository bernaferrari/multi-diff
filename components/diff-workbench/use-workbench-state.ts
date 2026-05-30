import { useMemo, useState } from "react"

import type { DiffStyle, LaneId, LaneMarkerStyle, Layout, Pane } from "./types"
import { useWorkbenchPersistence } from "./use-workbench-persistence"
import {
  createInitialWorkbenchState,
  getWorkbenchPersistenceState,
  getWorkbenchSetters,
  getWorkbenchState,
  type WorkbenchSetters,
} from "./workbench-state-model"

export function useWorkbenchState() {
  const initial = useMemo(() => createInitialWorkbenchState(), [])
  const [panes, setPanes] = useState<Pane[]>(initial.panes)
  const [layout, setLayout] = useState<Layout>(initial.layout)
  const [diffStyle, setDiffStyle] = useState<DiffStyle>(initial.diffStyle)
  const [wrap, setWrap] = useState(initial.wrap)
  const [lineNumbers, setLineNumbers] = useState(initial.lineNumbers)
  const [laneMarkerStyle, setLaneMarkerStyle] = useState<LaneMarkerStyle>(
    initial.laneMarkerStyle
  )
  const [hidden, setHidden] = useState<Set<LaneId>>(initial.hidden)
  const [sidebarOpen, setSidebarOpen] = useState(initial.sidebarOpen)
  const [fileQuery, setFileQuery] = useState(initial.fileQuery)
  const [focusFile, setFocusFile] = useState<string | null>(initial.focusFile)
  const [activeFile, setActiveFile] = useState<string | null>(
    initial.activeFile
  )
  const [hiddenFiles, setHiddenFiles] = useState<Set<string>>(
    initial.hiddenFiles
  )
  const [notes, setNotes] = useState(initial.notes)
  const [notesOpen, setNotesOpen] = useState(initial.notesOpen)
  const [dragging, setDragging] = useState(initial.dragging)

  const state = useMemo(
    () =>
      getWorkbenchState({
        activeFile,
        dragging,
        diffStyle,
        fileQuery,
        focusFile,
        hidden,
        hiddenFiles,
        laneMarkerStyle,
        layout,
        lineNumbers,
        notes,
        notesOpen,
        panes,
        sidebarOpen,
        wrap,
      }),
    [
      activeFile,
      dragging,
      diffStyle,
      fileQuery,
      focusFile,
      hidden,
      hiddenFiles,
      laneMarkerStyle,
      layout,
      lineNumbers,
      notes,
      notesOpen,
      panes,
      sidebarOpen,
      wrap,
    ]
  )

  const setters = useMemo<WorkbenchSetters>(
    () =>
      getWorkbenchSetters({
        setActiveFile,
        setDragging,
        setDiffStyle,
        setFileQuery,
        setFocusFile,
        setHidden,
        setHiddenFiles,
        setLaneMarkerStyle,
        setLayout,
        setLineNumbers,
        setNotes,
        setNotesOpen,
        setPanes,
        setSidebarOpen,
        setWrap,
      }),
    []
  )
  const persistedState = useMemo(
    () => getWorkbenchPersistenceState(state),
    [state]
  )
  useWorkbenchPersistence(persistedState, setters)

  return {
    state,
    setters,
  }
}
