"use client"

import { type RefObject } from "react"

import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu"

import { FilesContextMenuContent } from "./files-context-menu"
import { FilesTreeContent } from "./files-tree-content"
import type {
  FilesTreeListActions,
  FilesTreeListState,
} from "./use-files-panel-state"
import type { ActiveFileByLane, FileRow, LaneMarkerStyle, Layout } from "./types"

export function FilesTreeList({
  actions,
  activeFileByLane,
  activeFile,
  focusFile,
  hiddenFileRows,
  hiddenFiles,
  laneMarkerStyle,
  layout,
  listRef,
  query,
  rows,
  onHideFiles,
  onNavigate,
  onShowAllFiles,
  onShowFiles,
  state,
}: {
  actions: FilesTreeListActions
  activeFile: string | null
  activeFileByLane: ActiveFileByLane
  focusFile: string | null
  hiddenFileRows: FileRow[]
  hiddenFiles: Set<string>
  laneMarkerStyle: LaneMarkerStyle
  layout: Layout
  listRef: RefObject<HTMLDivElement | null>
  query: string
  rows: FileRow[]
  onHideFiles: (names: string[]) => void
  onNavigate: (name: string) => void
  onShowAllFiles: () => void
  onShowFiles: (names: string[]) => void
  state: FilesTreeListState
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <div
            ref={listRef}
            className="scroll-thin min-h-0 flex-1 overflow-y-auto p-1.5"
            onContextMenu={(event) => {
              if (!isTreeRowContextTarget(event.target)) {
                actions.clearContext()
              }
            }}
          >
            <FilesTreeContent
              activeFile={activeFile}
              activeFileByLane={activeFileByLane}
              collapsedDirs={state.collapsedDirs}
              focusFile={focusFile}
              hiddenFiles={hiddenFiles}
              laneMarkerStyle={laneMarkerStyle}
              layout={layout}
              query={query}
              rows={rows}
              showTreeLaneBadges={state.showTreeLaneBadges}
              treeLaneIds={state.treeLaneIds}
              treeRows={state.treeRows}
              onContextDirectory={actions.selectContextDirectory}
              onContextFile={actions.selectContextFile}
              onNavigate={onNavigate}
              onToggleDirectory={actions.toggleDirectory}
            />
          </div>
        }
      />
      <FilesContextMenuContent
        contextDirectory={state.contextDirectory}
        contextFile={state.contextFile}
        hiddenFileRows={hiddenFileRows}
        hiddenFiles={hiddenFiles}
        restorableRows={state.restorableRows}
        onHideFiles={onHideFiles}
        onShowAllFiles={onShowAllFiles}
        onShowFiles={onShowFiles}
      />
    </ContextMenu>
  )
}

function isTreeRowContextTarget(target: unknown) {
  return (
    typeof HTMLElement !== "undefined" &&
    target instanceof HTMLElement &&
    target.closest("[data-file-row],[data-dir-row]") != null
  )
}
