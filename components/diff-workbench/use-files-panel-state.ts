import { useMemo, useRef, useState } from "react"

import {
  clearFilesPanelContext,
  getFilesPanelDerivedState,
  selectDirectoryContext,
  selectFileContext,
  toggleCollapsedDirectory,
} from "./files-panel-state"
import type { FilesPanelContextState } from "./files-panel-state"
import type { VisibleFileTreeRow } from "./file-tree"
import type { DirectoryContext, FileRow, LaneId, LanePane } from "./types"

export type FilesTreeListState = {
  collapsedDirs: Set<string>
  contextDirectory: DirectoryContext | null
  contextFile: string | null
  restorableRows: FileRow[]
  showTreeLaneBadges: boolean
  treeLaneIds: LaneId[]
  treeRows: VisibleFileTreeRow[]
}

export type FilesTreeListActions = {
  clearContext: () => void
  selectContextDirectory: (context: DirectoryContext) => void
  selectContextFile: (name: string) => void
  toggleDirectory: (path: string) => void
}

export function useFilesPanelState({
  hidden,
  hiddenFileRows,
  panes,
  query,
  rows,
}: {
  hidden: Set<LaneId>
  hiddenFileRows: FileRow[]
  panes: LanePane[]
  query: string
  rows: FileRow[]
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const [context, setContext] = useState<FilesPanelContextState>(
    clearFilesPanelContext
  )
  const [collapsedDirs, setCollapsedDirs] = useState<Set<string>>(new Set())

  const laneIds = useMemo(() => panes.map((pane) => pane.id), [panes])
  const derived = useMemo(
    () =>
      getFilesPanelDerivedState({
        collapsedDirs,
        contextFile: context.contextFile,
        hidden,
        hiddenFileRows,
        laneIds,
        query,
        rows,
      }),
    [
      collapsedDirs,
      context.contextFile,
      hidden,
      hiddenFileRows,
      laneIds,
      query,
      rows,
    ]
  )

  function clearContext() {
    setContext(clearFilesPanelContext())
  }

  function toggleDirectory(path: string) {
    setCollapsedDirs((current) => toggleCollapsedDirectory(current, path))
  }

  function selectContextDirectory(context: DirectoryContext) {
    setContext(selectDirectoryContext(context))
  }

  function selectContextFile(name: string) {
    setContext(selectFileContext(name))
  }

  const treeState: FilesTreeListState = {
    collapsedDirs,
    contextDirectory: context.contextDirectory,
    contextFile: context.contextFile,
    restorableRows: derived.restorableRows,
    showTreeLaneBadges: derived.showTreeLaneBadges,
    treeLaneIds: derived.treeLaneIds,
    treeRows: derived.treeRows,
  }
  const treeActions: FilesTreeListActions = {
    clearContext,
    selectContextDirectory,
    selectContextFile,
    toggleDirectory,
  }

  return {
    laneIds,
    listRef,
    treeActions,
    treeState,
    visibleCount: derived.visibleCount,
  }
}
