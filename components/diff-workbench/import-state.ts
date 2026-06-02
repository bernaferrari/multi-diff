import { createPane } from "./diff-data";
import { getImportLaneAssignments } from "./import-lane-assignment";
import { MAX_LANES, laneIdAt, laneTitle } from "./lanes";
import type { ImportFileSource, StagedImportFile } from "./import-staging-state";
import type { LaneId, Pane } from "./types";

type ImportedDiffFile = {
  name: string;
  text: string;
};

export async function readImportFiles(fileList: ImportFileSource): Promise<ImportedDiffFile[]> {
  const files = Array.from(fileList ?? []).slice(0, MAX_LANES);
  return Promise.all(
    files.map(async (file) => ({
      name: file.name,
      text: await file.text(),
    })),
  );
}

type ImportPreviewRow = {
  fileName: string;
  lane: LaneId;
  laneLabel: string;
};

export function getImportPreviewRows({
  files,
  panes,
  target,
}: {
  files: StagedImportFile[];
  panes: Pane[];
  target?: LaneId;
}): ImportPreviewRow[] {
  const importedFiles = files.slice(0, MAX_LANES);
  const assignments = getImportLaneAssignments({
    fileCount: importedFiles.length,
    panes,
    target,
    targets: importedFiles.map((item) => item.targetLane),
  });

  return importedFiles.map((item, index) => {
    const lane = assignments.lanes[index];
    return {
      fileName: item.file.name,
      lane,
      laneLabel: laneTitle(lane),
    };
  });
}

export function applyImportedFiles({
  panes,
  reads,
  targets,
  target,
}: {
  panes: Pane[];
  reads: ImportedDiffFile[];
  targets?: (LaneId | undefined)[];
  target?: LaneId;
}) {
  const importedFiles = reads.slice(0, MAX_LANES);
  const assignments = getImportLaneAssignments({
    fileCount: importedFiles.length,
    panes,
    target,
    targets,
  });
  const next = Array.from({ length: Math.min(assignments.laneCount, MAX_LANES) }, (_, index) => {
    const id = laneIdAt(index);
    return panes[index] ? { ...panes[index], id, label: laneTitle(id) } : createPane(id);
  });
  const indexByLane = getPaneIndexByLane(next);

  importedFiles.forEach((read, index) => {
    const id = assignments.lanes[index];
    const nextIndex = indexByLane.get(id) ?? -1;
    if (nextIndex < 0) return;
    next[nextIndex] = {
      ...next[nextIndex],
      text: read.text,
      filename: read.name,
    };
  });

  return next;
}

function getPaneIndexByLane(panes: Pane[]) {
  return new Map(panes.map((pane, index) => [pane.id, index]));
}
