import type { FileDiffMetadata } from "@pierre/diffs/react";

import { diffTotalsForFiles } from "../rendering/diff-totals";
import type { DiffCodeItem, FileOccurrence, FileRow, PaneView, ParsedPane } from "./types";

type TestHunk = FileDiffMetadata["hunks"][number];

export function testFileDiff(name: string, additions: number, deletions: number): FileDiffMetadata {
  const lineCount = additions + deletions;
  const hunk: TestHunk = {
    additionCount: additions,
    additionLineIndex: 0,
    additionLines: additions,
    additionStart: 1,
    collapsedBefore: 0,
    deletionCount: deletions,
    deletionLineIndex: 0,
    deletionLines: deletions,
    deletionStart: 1,
    hunkContent: [],
    noEOFCRAdditions: false,
    noEOFCRDeletions: false,
    splitLineCount: lineCount,
    splitLineStart: 0,
    unifiedLineCount: lineCount,
    unifiedLineStart: 0,
  };

  return {
    additionLines: [],
    deletionLines: [],
    hunks: [hunk],
    isPartial: true,
    name,
    splitLineCount: lineCount,
    type: "change",
    unifiedLineCount: lineCount,
  };
}

export function testParsedPane(id: string, files: FileDiffMetadata[]): ParsedPane {
  const { additions, deletions } = diffTotalsForFiles(files);

  return {
    id,
    label: `Diff ${id.toUpperCase()}`,
    text: "diff",
    files,
    items: files.map<DiffCodeItem>((fileDiff, index) => ({
      id: `${id}-${index}-${fileDiff.name}`,
      type: "diff",
      fileDiff,
    })),
    additions,
    deletions,
  };
}

export function testPaneView(id: string, files: FileDiffMetadata[]): PaneView {
  const pane = testParsedPane(id, files);
  const occurrenceById = new Map<string, FileOccurrence>();
  const idByName = new Map<string, string>();
  const counts = new Map<string, number>();
  const seen = new Map<string, number>();

  for (const file of files) {
    counts.set(file.name, (counts.get(file.name) ?? 0) + 1);
  }

  for (const item of pane.items) {
    const fileName = item.fileDiff.name;
    const total = counts.get(fileName) ?? 1;
    const index = (seen.get(fileName) ?? 0) + 1;
    seen.set(fileName, index);
    if (!idByName.has(fileName)) idByName.set(fileName, item.id);
    if (total > 1) occurrenceById.set(item.id, { index, total });
  }

  return {
    ...pane,
    idByName,
    occurrenceById,
  };
}

export function testFileRow(name: string, overrides: Partial<Omit<FileRow, "name">> = {}): FileRow {
  return {
    additions: 0,
    deletions: 0,
    name,
    panes: {},
    presentIn: [],
    ...overrides,
  };
}
