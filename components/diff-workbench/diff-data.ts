import { parsePatchFiles } from "@pierre/diffs";
import type { FileDiffMetadata } from "@pierre/diffs/react";

import { diffTotalsFor, diffTotalsForFiles } from "./diff-totals";
import { compareFilePath } from "./file-order";
import { laneTitle } from "./lanes";
import type { DiffCodeItem, FileOccurrence, FileRow, LaneId, Pane, ParsedPane } from "./types";

const EMPTY_DIFF_LINE = " ";
const PARSE_ERROR_FALLBACK = "Could not parse diff";

export function createPane(id: LaneId, text = "", filename?: string): Pane {
  return {
    id,
    label: laneTitle(id),
    text,
    filename,
  };
}

export function normalizePatchInput(patch: string) {
  return patch
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => (line === "" ? EMPTY_DIFF_LINE : line))
    .join("\n");
}

function getParseErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : PARSE_ERROR_FALLBACK;
}

function itemId(paneId: string, fileName: string, index = 0) {
  return `${paneId}-${index}-${fileName}`;
}

export function buildDiffCodeItems(paneId: LaneId, files: FileDiffMetadata[]) {
  const idByName = new Map<string, string>();
  const occurrenceById = new Map<string, FileOccurrence>();
  const totalsByName = getFileNameCounts(files);
  const seenByName = new Map<string, number>();

  const items: DiffCodeItem[] = files.map((fileDiff, index) => {
    const id = itemId(paneId, fileDiff.name, index);
    const occurrenceIndex = (seenByName.get(fileDiff.name) ?? 0) + 1;
    const occurrenceTotal = totalsByName.get(fileDiff.name) ?? 1;

    seenByName.set(fileDiff.name, occurrenceIndex);
    if (!idByName.has(fileDiff.name)) idByName.set(fileDiff.name, id);
    if (occurrenceTotal > 1) {
      occurrenceById.set(id, {
        index: occurrenceIndex,
        total: occurrenceTotal,
      });
    }

    return { id, type: "diff", fileDiff };
  });

  return { idByName, items, occurrenceById };
}

function getFileNameCounts(files: FileDiffMetadata[]) {
  const counts = new Map<string, number>();
  for (const file of files) {
    counts.set(file.name, (counts.get(file.name) ?? 0) + 1);
  }
  return counts;
}

export function parsePane(pane: Pane): ParsedPane {
  if (!pane.text.trim()) {
    return { ...pane, items: [], files: [], additions: 0, deletions: 0 };
  }
  try {
    const patches = parsePatchFiles(normalizePatchInput(pane.text), pane.id, true);
    const files = patches.flatMap((patch) => patch.files);
    const { items } = buildDiffCodeItems(pane.id, files);
    const { additions, deletions } = diffTotalsForFiles(files);
    return { ...pane, items, files, additions, deletions };
  } catch (error) {
    return {
      ...pane,
      items: [],
      files: [],
      additions: 0,
      deletions: 0,
      error: getParseErrorMessage(error),
    };
  }
}

export function buildFileRows(panes: ParsedPane[]): FileRow[] {
  const rows = new Map<string, FileRow>();
  for (const pane of panes) {
    for (const file of pane.files) {
      const existing = rows.get(file.name) ?? {
        name: file.name,
        panes: {},
        presentIn: [],
        occurrences: 0,
        occurrencesByLane: {},
        additions: 0,
        deletions: 0,
      };
      const totals = diffTotalsFor(file);
      existing.panes[pane.id] = file;
      if (!existing.presentIn.includes(pane.id)) {
        existing.presentIn.push(pane.id);
      }
      existing.occurrences = (existing.occurrences ?? 0) + 1;
      existing.occurrencesByLane ??= {};
      existing.occurrencesByLane[pane.id] = (existing.occurrencesByLane[pane.id] ?? 0) + 1;
      existing.additions += totals.additions;
      existing.deletions += totals.deletions;
      rows.set(file.name, existing);
    }
  }
  return Array.from(rows.values()).sort((a, b) => compareFilePath(a.name, b.name));
}
