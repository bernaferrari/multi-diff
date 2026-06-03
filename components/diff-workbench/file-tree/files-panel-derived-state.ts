import { buildVisibleFileTreeRows } from "./file-tree";
import type { VisibleFileTreeRow } from "./file-tree-types";
import type { FileRow, LaneId } from "../shared/types";

type FilesPanelTreeState = {
  treeRows: VisibleFileTreeRow[];
};

type FilesPanelDerivedState = {
  focusTarget: string | null;
  restorableRows: FileRow[];
  showTreeLaneBadges: boolean;
  treeLaneIds: LaneId[];
  treeRows: VisibleFileTreeRow[];
  visibleCount: number;
};

export function getFilesPanelTreeState({
  collapsedDirs,
  query,
  rows,
}: {
  collapsedDirs: Set<string>;
  query: string;
  rows: FileRow[];
}): FilesPanelTreeState {
  const filteredRows = filterFileRows(rows, query);

  return {
    treeRows: buildVisibleFileTreeRows(filteredRows, collapsedDirs),
  };
}

export function getFilesPanelDerivedState({
  activeFile,
  contextFile,
  focusableRows,
  hidden,
  hiddenFileRows,
  laneIds,
  query,
  rows,
  treeRows,
}: {
  activeFile: string | null;
  contextFile: string | null;
  focusableRows?: FileRow[];
  hidden: Set<LaneId>;
  hiddenFileRows: FileRow[];
  laneIds: LaneId[];
  query: string;
  rows: FileRow[];
  treeRows: VisibleFileTreeRow[];
}): FilesPanelDerivedState {
  const focusRows = focusableRows ?? rows;
  const treeLaneIds = getTreeLaneIds(laneIds, hidden);

  return {
    focusTarget: getFilesPanelFocusTarget({
      activeFile,
      focusableRows: focusRows,
      treeRows,
    }),
    restorableRows: getRestorableRows(hiddenFileRows, contextFile),
    showTreeLaneBadges: shouldShowTreeLaneBadges(query, treeLaneIds),
    treeLaneIds,
    treeRows,
    visibleCount: getVisibleFileCount(rows, hiddenFileRows),
  };
}

function getRestorableRows(hiddenFileRows: FileRow[], contextFile: string | null) {
  return hiddenFileRows.filter((row) => row.name !== contextFile);
}

function getVisibleFileCount(rows: FileRow[], hiddenFileRows: FileRow[]) {
  return Math.max(0, rows.length - hiddenFileRows.length);
}

function getTreeLaneIds(laneIds: LaneId[], hidden: Set<LaneId>) {
  return laneIds.filter((id) => !hidden.has(id));
}

function filterFileRows(rows: FileRow[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return rows;

  return rows.filter((row) => {
    const filename = row.name.split("/").pop() ?? row.name;
    return filename.toLowerCase().includes(needle);
  });
}

function shouldShowTreeLaneBadges(query: string, treeLaneIds: LaneId[]) {
  return query.trim().length !== 1 && treeLaneIds.length > 1;
}

function getFilesPanelFocusTarget({
  activeFile,
  focusableRows,
  treeRows,
}: {
  activeFile: string | null;
  focusableRows: FileRow[];
  treeRows: VisibleFileTreeRow[];
}) {
  if (
    activeFile &&
    isFocusableFile(activeFile, focusableRows) &&
    isVisibleTreeFile(treeRows, activeFile)
  ) {
    return activeFile;
  }

  return (
    getFirstFocusableTreeFileName(treeRows, focusableRows) ??
    getVisibleFileName(activeFile, focusableRows) ??
    focusableRows[0]?.name ??
    null
  );
}

function isVisibleTreeFile(treeRows: VisibleFileTreeRow[], name: string) {
  return treeRows.some((item) => item.node.kind === "file" && item.node.row?.name === name);
}

function getVisibleFileName(name: string | null, rows: FileRow[]) {
  return name && rows.some((row) => row.name === name) ? name : null;
}

function getFirstFocusableTreeFileName(treeRows: VisibleFileTreeRow[], focusableRows: FileRow[]) {
  const focusableNames = new Set(focusableRows.map((row) => row.name));
  return treeRows.find(
    (item) => item.node.kind === "file" && item.node.row && focusableNames.has(item.node.row.name),
  )?.node.row?.name;
}

function isFocusableFile(name: string, focusableRows: FileRow[]) {
  return focusableRows.some((row) => row.name === name);
}
