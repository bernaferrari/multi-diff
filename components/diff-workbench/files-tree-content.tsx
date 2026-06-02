import { DirectoryTreeBranch } from "./directory-tree-row";
import { FileTreeRow } from "./file-tree-rows";
import type { VisibleFileTreeRow } from "./file-tree-types";
import type {
  ActiveFileByLane,
  DirectoryContext,
  FileRow,
  LaneId,
  LaneMarkerStyle,
  Layout,
} from "./types";

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
  activeFile: string | null;
  activeFileByLane: ActiveFileByLane;
  collapsedDirs: Set<string>;
  focusFile: string | null;
  hiddenFiles: Set<string>;
  laneMarkerStyle: LaneMarkerStyle;
  layout: Layout;
  query: string;
  rows: FileRow[];
  showTreeLaneBadges: boolean;
  treeLaneIds: LaneId[];
  treeRows: VisibleFileTreeRow[];
  onContextDirectory: (context: DirectoryContext) => void;
  onContextFile: (name: string) => void;
  onNavigate: (name: string) => void;
  onToggleDirectory: (path: string) => void;
}) {
  const emptyMessage = getFilesTreeEmptyMessage({
    rowCount: rows.length,
    treeRowCount: treeRows.length,
  });
  if (emptyMessage) {
    return (
      <div className="px-2 py-6 text-center text-xs text-muted-foreground">{emptyMessage}</div>
    );
  }
  const activeLaneIdsByFile = getActiveLaneIdsByFile(activeFileByLane);

  return (
    <div>
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
            activeLaneIds={node.row ? (activeLaneIdsByFile.get(node.row.name) ?? []) : []}
            hidden={node.row ? hiddenFiles.has(node.row.name) : false}
            laneIds={treeLaneIds}
            laneMarkerStyle={laneMarkerStyle}
            layout={layout}
            node={node}
            query={query}
            showLaneBadges={showTreeLaneBadges}
            onContextFile={onContextFile}
            onNavigate={onNavigate}
          />
        ),
      )}
    </div>
  );
}

function getActiveLaneIdsByFile(activeFileByLane: ActiveFileByLane) {
  const activeLaneIdsByFile = new Map<string, string[]>();

  for (const [laneId, fileName] of Object.entries(activeFileByLane)) {
    if (!fileName) continue;
    const laneIds = activeLaneIdsByFile.get(fileName);
    if (laneIds) laneIds.push(laneId);
    else activeLaneIdsByFile.set(fileName, [laneId]);
  }

  return activeLaneIdsByFile;
}

function getFilesTreeEmptyMessage({
  rowCount,
  treeRowCount,
}: {
  rowCount: number;
  treeRowCount: number;
}) {
  if (rowCount === 0) return "No files yet - import or drop diffs anywhere.";
  if (treeRowCount === 0) return "No files match your filter.";
  return null;
}
