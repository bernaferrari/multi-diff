import { getFirstVisibleFileTreeName } from "./file-tree";
import type { FilesPanelView } from "./files-panel-model";

type FilesPanelViewState = {
  fileQuery: FilesPanelView["query"];
  hidden: FilesPanelView["hidden"];
  hiddenFiles: FilesPanelView["hiddenFiles"];
  laneMarkerStyle: FilesPanelView["laneMarkerStyle"];
  layout: FilesPanelView["layout"];
};

export function getFilesPanelView({
  activeFileByLane,
  allFileRows,
  focused,
  focusMode,
  hiddenFileRows,
  indexActiveFile,
  fileRows,
  parsed,
  sharedCount,
  state,
}: {
  activeFileByLane: FilesPanelView["activeFileByLane"];
  allFileRows: FilesPanelView["rows"];
  fileRows: FilesPanelView["rows"];
  focused: string | null;
  focusMode: boolean;
  hiddenFileRows: FilesPanelView["hiddenFileRows"];
  indexActiveFile: string | null;
  parsed: FilesPanelView["panes"];
  sharedCount: number;
  state: FilesPanelViewState;
}): FilesPanelView {
  const display = getFilesPanelDisplayState({
    activeFileByLane,
    focused,
    indexActiveFile,
    layout: state.layout,
    rows: fileRows,
  });

  return {
    activeFileByLane: display.activeFileByLane,
    activeFile: display.activeFile,
    focusableRows: fileRows,
    focusMode,
    focusFile: focused,
    hidden: state.hidden,
    hiddenFiles: state.hiddenFiles,
    laneMarkerStyle: state.laneMarkerStyle,
    layout: state.layout,
    hiddenFileRows,
    panes: parsed,
    query: state.fileQuery,
    rows: allFileRows,
    sharedCount,
  };
}

export function getFilesPanelDisplayState({
  activeFileByLane,
  focused,
  indexActiveFile,
  layout,
  rows,
}: {
  activeFileByLane: FilesPanelView["activeFileByLane"];
  focused: string | null;
  indexActiveFile: string | null;
  layout: FilesPanelView["layout"];
  rows: FilesPanelView["rows"];
}) {
  const activeFile = focused ?? indexActiveFile ?? getFirstVisibleFileTreeName(rows) ?? null;

  return {
    activeFile,
    activeFileByLane: getFilesPanelActiveFileByLane({
      activeFile,
      activeFileByLane,
      focused,
      layout,
      rows,
    }),
  };
}

function getFilesPanelActiveFileByLane({
  activeFile,
  activeFileByLane,
  focused,
  layout,
  rows,
}: {
  activeFile: string | null;
  activeFileByLane: FilesPanelView["activeFileByLane"];
  focused: string | null;
  layout: FilesPanelView["layout"];
  rows: FilesPanelView["rows"];
}) {
  const visibleFile = focused ?? activeFile;
  if (!visibleFile) return activeFileByLane;

  const row = rows.find((item) => item.name === visibleFile);
  if (!row) return activeFileByLane;
  const visibleActiveFileByLane = getVisibleActiveFileByLane(activeFileByLane, rows);

  if (!focused && layout !== "rows") {
    return Object.keys(visibleActiveFileByLane).length > 0
      ? visibleActiveFileByLane
      : getActiveFileEntriesForRow(row, visibleFile);
  }

  if (layout === "rows" && !focused) {
    const laneEntry = Object.entries(visibleActiveFileByLane).find(
      ([, fileName]) => fileName === visibleFile,
    );
    return laneEntry
      ? { [laneEntry[0]]: visibleFile }
      : row.presentIn[0]
        ? { [row.presentIn[0]]: visibleFile }
        : {};
  }

  return getActiveFileEntriesForRow(row, visibleFile);
}

function getActiveFileEntriesForRow(row: FilesPanelView["rows"][number], name: string) {
  return Object.fromEntries(row.presentIn.map((laneId) => [laneId, name]));
}

function getVisibleActiveFileByLane(
  activeFileByLane: FilesPanelView["activeFileByLane"],
  rows: FilesPanelView["rows"],
) {
  const fileNames = new Set(rows.map((row) => row.name));
  return Object.fromEntries(
    Object.entries(activeFileByLane).filter(([, name]) => (name ? fileNames.has(name) : false)),
  );
}
