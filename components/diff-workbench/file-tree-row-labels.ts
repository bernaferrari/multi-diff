import { formatDiffStatLabel, formatDiffStatSummary } from "./diff-stat-format";
import { laneLabel } from "./lanes";
import type { FileRow } from "./types";

export function getFileTreeRowTitle(row: FileRow) {
  return `${row.name}\n${getFileTreeRowLaneTitle(row)}${getFileTreeOccurrenceTitle(row)} · ${formatDiffStatSummary(row)}`;
}

export function getFileTreeRowLabel(row: FileRow) {
  return `${row.name}, ${getFileTreeRowLaneLabel(row)}${getFileTreeOccurrenceLabel(row)}, ${formatDiffStatLabel(row)}`;
}

export function getDirectoryTreeRowTitle({
  collapsed,
  path,
}: {
  collapsed: boolean;
  path: string;
}) {
  return `${collapsed ? "Expand" : "Collapse"} ${path}`;
}

export function getDirectoryTreeRowLabel({
  collapsed,
  path,
}: {
  collapsed: boolean;
  path: string;
}) {
  return `${collapsed ? "Expand" : "Collapse"} folder ${path}`;
}

function getFileTreeRowLaneList(row: FileRow) {
  return row.presentIn.map(laneLabel).join(", ");
}

function getFileTreeRowLaneTitle(row: FileRow) {
  const lanes = getFileTreeRowLaneList(row);
  return lanes ? `in ${lanes}` : "not visible in any lane";
}

function getFileTreeRowLaneLabel(row: FileRow) {
  const lanes = getFileTreeRowLaneList(row);
  return lanes ? `changed in ${lanes}` : "not visible in any lane";
}

function getFileTreeOccurrenceTitle(row: FileRow) {
  const repeated = getRepeatedLaneLabels(row);
  return repeated ? ` · repeated in ${repeated}` : "";
}

function getFileTreeOccurrenceLabel(row: FileRow) {
  const repeated = getRepeatedLaneLabels(row);
  return repeated ? `, repeated in ${repeated}` : "";
}

function getRepeatedLaneLabels(row: FileRow) {
  const repeated = Object.entries(row.occurrencesByLane ?? {})
    .filter(([, count]) => (count ?? 0) > 1)
    .map(([lane, count]) => `${laneLabel(lane)} x${count}`);

  return repeated.join(", ");
}
