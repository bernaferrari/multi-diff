"use client"

import { useMemo } from "react"

import { TreeIconSprite } from "./file-icons"
import { FilesPanelHeader } from "./files-panel-header"
import { FilesTreeList } from "./files-tree-list"
import type { FilesPanelActions, FilesPanelView } from "./files-panel-model"
import { useFilesPanelState } from "./use-files-panel-state"

type FilesPanelProps = {
  actions: FilesPanelActions
  view: FilesPanelView
}

export function FilesPanel({ actions, view }: FilesPanelProps) {
  const laneIds = useMemo(() => view.panes.map((pane) => pane.id), [view.panes])
  const { focusTarget, listRef, treeActions, treeState, visibleCount } =
    useFilesPanelState({
      activeFile: view.activeFile,
      focusableRows: view.focusableRows,
      hidden: view.hidden,
      hiddenFileRows: view.hiddenFileRows,
      laneIds,
      query: view.query,
      rows: view.rows,
    })

  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r border-border/70 bg-card/40">
      <TreeIconSprite />
      <FilesPanelHeader
        focusFile={view.focusFile}
        focusMode={view.focusMode}
        focusTarget={focusTarget}
        hidden={view.hidden}
        panes={view.panes}
        query={view.query}
        sharedCount={view.sharedCount}
        visibleCount={visibleCount}
        onOverview={actions.onOverview}
        onQuery={actions.onQuery}
        onToggleLane={actions.onToggleLane}
        onToggleFocusMode={() => actions.onToggleFocusMode(focusTarget)}
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
