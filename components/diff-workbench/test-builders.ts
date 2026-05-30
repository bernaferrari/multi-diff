import type { FileDiffMetadata } from "@pierre/diffs/react"

import { diffTotalsForFiles } from "./diff-data"
import type { DiffCodeItem, FileRow, PaneView, ParsedPane } from "./types"

type TestHunk = FileDiffMetadata["hunks"][number]

export function testFileDiff(
  name: string,
  additions: number,
  deletions: number
): FileDiffMetadata {
  const lineCount = additions + deletions
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
  }

  return {
    additionLines: [],
    deletionLines: [],
    hunks: [hunk],
    isPartial: true,
    name,
    splitLineCount: lineCount,
    type: "change",
    unifiedLineCount: lineCount,
  }
}

export function testParsedPane(
  id: string,
  files: FileDiffMetadata[]
): ParsedPane {
  const { additions, deletions } = diffTotalsForFiles(files)

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
  }
}

export function testPaneView(id: string, files: FileDiffMetadata[]): PaneView {
  const pane = testParsedPane(id, files)

  return {
    ...pane,
    idByName: new Map(pane.items.map((item) => [item.fileDiff.name, item.id])),
  }
}

export function testFileRow(
  name: string,
  overrides: Partial<Omit<FileRow, "name">> = {}
): FileRow {
  return {
    additions: 0,
    deletions: 0,
    name,
    panes: {},
    presentIn: [],
    ...overrides,
  }
}
