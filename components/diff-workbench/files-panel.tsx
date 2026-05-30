"use client"

import { TreeIconSprite } from "./file-icons"
import { FilesPanelHeader } from "./files-panel-header"
import { FilesTreeList } from "./files-tree-list"
import type {
  ActiveFileByLane,
  FileRow,
  LaneId,
  LaneMarkerStyle,
  LanePane,
  Layout,
} from "./types"
import { useFilesPanelState } from "./use-files-panel-state"

export type FilesPanelView = {
  activeFileByLane: ActiveFileByLane
  activeFile: string | null
  focusMode: boolean
  focusFile: string | null
  hidden: Set<LaneId>
  hiddenFiles: Set<string>
  hiddenFileRows: FileRow[]
  laneMarkerStyle: LaneMarkerStyle
  layout: Layout
  panes: LanePane[]
  query: string
  rows: FileRow[]
  sharedCount: number
}

export type FilesPanelActions = {
  onFilterFile: (name: string) => void
  onHideFiles: (names: string[]) => void
  onNavigate: (name: string) => void
  onOverview: () => void
  onQuery: (q: string) => void
  onShowAllFiles: () => void
  onShowFiles: (names: string[]) => void
  onToggleLane: (id: LaneId) => void
  onToggleFocusMode: () => void
}

type FilesPanelProps = {
  actions: FilesPanelActions
  view: FilesPanelView
}

export function FilesPanel({ actions, view }: FilesPanelProps) {
  const { listRef, treeActions, treeState, visibleCount } =
    useFilesPanelState({
      hidden: view.hidden,
      hiddenFileRows: view.hiddenFileRows,
      panes: view.panes,
      query: view.query,
      rows: view.rows,
    })

  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r border-border/70 bg-card/40">
      <TreeIconSprite />
      <FilesPanelHeader
        focusFile={view.focusFile}
        focusMode={view.focusMode}
        activeFile={view.activeFile}
        hidden={view.hidden}
        panes={view.panes}
        query={view.query}
        sharedCount={view.sharedCount}
        visibleCount={visibleCount}
        onOverview={actions.onOverview}
        onQuery={actions.onQuery}
        onToggleLane={actions.onToggleLane}
        onToggleFocusMode={actions.onToggleFocusMode}
      />

      <FilesTreeList
        activeFile={view.activeFile}
        activeFileByLane={view.activeFileByLane}
        focusFile={view.focusFile}
        hiddenFileRows={view.hiddenFileRows}
        hiddenFiles={view.hiddenFiles}
        laneMarkerStyle={view.laneMarkerStyle}
        layout={view.layout}
        query={view.query}
        rows={view.rows}
        listRef={listRef}
        state={treeState}
        actions={treeActions}
        onHideFiles={actions.onHideFiles}
        onNavigate={actions.onNavigate}
        onShowAllFiles={actions.onShowAllFiles}
        onShowFiles={actions.onShowFiles}
      />
    </aside>
  )
}
