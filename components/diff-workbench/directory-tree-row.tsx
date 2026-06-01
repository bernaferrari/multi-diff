import { EyeOff, Folder, FolderOpen } from "lucide-react"

import type { FileTreeNode } from "./file-tree-types"
import {
  getDirectoryHiddenState,
  getDirectoryTreeRowChrome,
} from "./directory-tree-row-state"
import { FileTreeLaneMarkers } from "./file-tree-lane-markers"
import { DiffStats } from "./file-tree-row-parts"
import { TreeRowButton } from "./tree-row-button"
import type { DirectoryContext, LaneId, LaneMarkerStyle, Layout } from "./types"

export function DirectoryTreeBranch({
  collapsed,
  depth,
  hiddenFiles,
  laneIds,
  laneMarkerStyle,
  layout,
  node,
  showLaneBadges,
  onContextDirectory,
  onToggle,
}: {
  collapsed: boolean
  depth: number
  hiddenFiles: Set<string>
  laneIds: LaneId[]
  laneMarkerStyle: LaneMarkerStyle
  layout: Layout
  node: FileTreeNode
  showLaneBadges: boolean
  onContextDirectory: (context: DirectoryContext) => void
  onToggle: () => void
}) {
  const fileNames = node.fileNames ?? []
  const { fullyHidden, partiallyHidden } = getDirectoryHiddenState(
    fileNames,
    hiddenFiles
  )

  return (
    <DirectoryTreeRow
      collapsed={collapsed}
      depth={depth}
      fullyHidden={fullyHidden}
      partiallyHidden={partiallyHidden}
      laneIds={laneIds}
      laneMarkerStyle={laneMarkerStyle}
      layout={layout}
      node={node}
      showLaneBadges={showLaneBadges}
      onContextDirectory={() =>
        onContextDirectory({
          label: node.path,
          names: fileNames,
        })
      }
      onToggle={onToggle}
    />
  )
}

function DirectoryTreeRow({
  collapsed,
  depth,
  fullyHidden,
  laneIds,
  laneMarkerStyle,
  layout,
  node,
  showLaneBadges,
  onContextDirectory,
  onToggle,
  partiallyHidden,
}: {
  collapsed: boolean
  depth: number
  fullyHidden: boolean
  laneIds: LaneId[]
  laneMarkerStyle: LaneMarkerStyle
  layout: Layout
  node: FileTreeNode
  showLaneBadges: boolean
  onContextDirectory: () => void
  onToggle: () => void
  partiallyHidden: boolean
}) {
  const summary = node.summary
  const chrome = getDirectoryTreeRowChrome({
    collapsed,
    fullyHidden,
    hasSummary: Boolean(summary),
    partiallyHidden,
    path: node.path,
  })

  return (
    <TreeRowButton
      data-dir-row=""
      depth={depth}
      aria-expanded={!collapsed}
      aria-label={chrome.ariaLabel}
      title={chrome.title}
      onClick={onToggle}
      onContextMenu={onContextDirectory}
      className={chrome.className}
    >
      {collapsed ? (
        <Folder className="size-3.5 shrink-0" />
      ) : (
        <FolderOpen className="size-3.5 shrink-0" />
      )}
      <span className="min-w-0 flex-1 truncate">{node.name}</span>
      {chrome.hiddenIconClass ? (
        <EyeOff className={chrome.hiddenIconClass} />
      ) : null}
      {chrome.showSummary && summary ? (
        <>
          <DiffStats row={summary} />
          {showLaneBadges ? (
            <FileTreeLaneMarkers
              laneIds={laneIds}
              layout={layout}
              markerStyle={laneMarkerStyle}
              row={summary}
            />
          ) : null}
        </>
      ) : null}
    </TreeRowButton>
  )
}
