import { LANE_ORDER, laneIdAt, laneIndex } from "../lanes/lanes";
import type { LaneId, Pane } from "../shared/types";

export function getImportLaneAssignments({
  fileCount,
  panes,
  target,
  targets,
}: {
  fileCount: number;
  panes: Pane[];
  target?: LaneId;
  targets?: (LaneId | undefined)[];
}) {
  const start = getImportStart(panes, fileCount, target);
  const lanes = Array.from({ length: fileCount }, (_, index) =>
    getImportLaneForIndex({
      index,
      start,
      targetLane: targets?.[index],
    }),
  );

  return {
    laneCount: getImportLaneCount({
      fileCount,
      paneCount: panes.length,
      start,
      targeted: Boolean(target),
      targets,
    }),
    lanes,
  };
}

function getImportStart(panes: Pane[], fileCount: number, target?: LaneId) {
  if (target) return laneIndex(target);
  const emptyIndex = panes.findIndex((pane) => !pane.text.trim());
  return fileCount === 1 && emptyIndex >= 0 ? emptyIndex : 0;
}

function getImportLaneForIndex({
  index,
  start,
  targetLane,
}: {
  index: number;
  start: number;
  targetLane?: LaneId;
}) {
  return targetLane ?? laneIdAt((start + index) % LANE_ORDER.length);
}

function getImportLaneCount({
  fileCount,
  paneCount,
  start,
  targeted,
  targets,
}: {
  fileCount: number;
  paneCount: number;
  start: number;
  targeted: boolean;
  targets?: (LaneId | undefined)[];
}) {
  const targetCount = Math.max(
    0,
    ...(targets ?? []).map((lane) => (lane ? laneIndex(lane) + 1 : 0)),
  );
  return targeted || fileCount === 1
    ? Math.max(paneCount, start + fileCount, targetCount, 1)
    : Math.max(fileCount, targetCount);
}
