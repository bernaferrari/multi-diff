import type { FileRow, ParsedPane } from "../shared/types";

export function partitionFileRows(rows: FileRow[], hiddenFiles: Set<string>) {
  const fileRows: FileRow[] = [];
  const hiddenFileRows: FileRow[] = [];

  for (const row of rows) {
    if (hiddenFiles.has(row.name)) hiddenFileRows.push(row);
    else fileRows.push(row);
  }

  return { fileRows, hiddenFileRows };
}

export function getVisibleFocusFile(focusFile: string | null, fileRows: FileRow[]) {
  if (!focusFile) return null;
  return fileRows.some((row) => row.name === focusFile) ? focusFile : null;
}

export function getDisplayedPanes(visiblePanes: ParsedPane[], focused: string | null) {
  if (!focused) return visiblePanes;
  return visiblePanes.filter((pane) => pane.files.some((file) => file.name === focused));
}

export function getSharedFileCount({
  fileRows,
  hiddenFiles,
  visiblePanes,
}: {
  fileRows: FileRow[];
  hiddenFiles: Set<string>;
  visiblePanes: ParsedPane[];
}) {
  const contributing = visiblePanes.filter((pane) =>
    pane.files.some((file) => !hiddenFiles.has(file.name)),
  ).length;

  if (contributing <= 1) return 0;
  return fileRows.filter((row) => row.presentIn.length === contributing).length;
}
