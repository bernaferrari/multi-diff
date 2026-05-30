import { DirectoryTreeBranch } from "./directory-tree-row"
import { FileTreeRow } from "./file-tree-rows"
import { isFileTreeNodeHidden, type VisibleFileTreeRow } from "./file-tree"
import type {
  ActiveFileByLane,
  DirectoryContext,
  FileRow,
  LaneId,
  LaneMarkerStyle,
  Layout,
} from "./types"

export function FilesTreeContent({
  activeFile,
  activeFileByLane,
  collapsedDirs,
  focusFile,
  hiddenFiles,
  laneMarkerStyle,
  layout,
  query,
  rows,
  showTreeLaneBadges,
  treeLaneIds,
  treeRows,
  onContextDirectory,
  onContextFile,
  onNavigate,
  onToggleDirectory,
}: {
  activeFile: string | null
  activeFileByLane: ActiveFileByLane
  collapsedDirs: Set<string>
  focusFile: string | null
  hiddenFiles: Set<string>
  laneMarkerStyle: LaneMarkerStyle
  layout: Layout
  query: string
  rows: FileRow[]
  showTreeLaneBadges: boolean
  treeLaneIds: LaneId[]
  treeRows: VisibleFileTreeRow[]
  onContextDirectory: (context: DirectoryContext) => void
  onContextFile: (name: string) => void
  onNavigate: (name: string) => void
  onToggleDirectory: (path: string) => void
}) {
  const emptyMessage = getFilesTreeEmptyMessage(rows.length, treeRows.length)
  if (emptyMessage) {
    return (
      <div className="px-2 py-6 text-center text-xs text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div aria-label="Changed files" role="tree">
      {treeRows.map(({ depth, node }) =>
        node.kind === "directory" ? (
          <DirectoryTreeBranch
            key={node.path}
            depth={depth}
            hiddenFiles={hiddenFiles}
            laneIds={treeLaneIds}
            laneMarkerStyle={laneMarkerStyle}
            layout={layout}
            node={node}
            showLaneBadges={showTreeLaneBadges}
            collapsed={collapsedDirs.has(node.path)}
            onContextDirectory={onContextDirectory}
            onToggle={() => onToggleDirectory(node.path)}
          />
        ) : (
          <FileTreeRow
            key={node.path}
            depth={depth}
            focusFile={focusFile}
            activeFile={activeFile}
            activeLaneIds={getActiveLaneIds(activeFileByLane, node.row?.name)}
            hidden={isFileTreeNodeHidden(node, hiddenFiles)}
            laneIds={treeLaneIds}
            laneMarkerStyle={laneMarkerStyle}
            layout={layout}
            node={node}
            query={query}
            showLaneBadges={showTreeLaneBadges}
            onContextFile={onContextFile}
            onNavigate={onNavigate}
          />
        )
      )}
    </div>
  )
}

function getActiveLaneIds(
  activeFileByLane: ActiveFileByLane,
  name: string | undefined
) {
  if (!name) return []
  return Object.entries(activeFileByLane)
    .filter(([, fileName]) => fileName === name)
    .map(([laneId]) => laneId)
}

function getFilesTreeEmptyMessage(
  rowCount: number,
  treeRowCount: number
) {
  if (rowCount === 0) return "No files yet - import or drop diffs anywhere."
  if (treeRowCount === 0) return "No files match your filter."
  return null
}
