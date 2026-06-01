import { useMemo, useRef, useState } from "react"

import { getFilesPanelDerivedState } from "./files-panel-derived-state"
import type { VisibleFileTreeRow } from "./file-tree-types"
import type { DirectoryContext, FileRow, LaneId } from "./types"

type FilesPanelContextState = {
  contextDirectory: DirectoryContext | null
  contextFile: string | null
}

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
  activeFile,
  focusableRows,
  hidden,
  hiddenFileRows,
  laneIds,
  query,
  rows,
}: {
  activeFile: string | null
  focusableRows: FileRow[]
  hidden: Set<LaneId>
  hiddenFileRows: FileRow[]
  laneIds: LaneId[]
  query: string
  rows: FileRow[]
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const [context, setContext] = useState<FilesPanelContextState>(
    clearFilesPanelContext
  )
  const [collapsedDirs, setCollapsedDirs] = useState<Set<string>>(new Set())

  const derived = useMemo(
    () =>
      getFilesPanelDerivedState({
        activeFile,
        collapsedDirs,
        contextFile: context.contextFile,
        focusableRows,
        hidden,
        hiddenFileRows,
        laneIds,
        query,
        rows,
      }),
    [
      activeFile,
      collapsedDirs,
      context.contextFile,
      focusableRows,
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
    focusTarget: derived.focusTarget,
    listRef,
    treeActions,
    treeState,
    visibleCount: derived.visibleCount,
  }
}

function toggleCollapsedDirectory(current: Set<string>, path: string) {
  const next = new Set(current)
  if (next.has(path)) next.delete(path)
  else next.add(path)
  return next
}

function clearFilesPanelContext(): FilesPanelContextState {
  return {
    contextDirectory: null,
    contextFile: null,
  }
}

function selectDirectoryContext(
  contextDirectory: DirectoryContext
): FilesPanelContextState {
  return {
    contextDirectory,
    contextFile: null,
  }
}

function selectFileContext(contextFile: string): FilesPanelContextState {
  return {
    contextDirectory: null,
    contextFile,
  }
}
