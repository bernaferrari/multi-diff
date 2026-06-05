import type { FileDiffMetadata } from "@pierre/diffs/react";

import type { ParsedPane } from "../shared/types";

export type ContentSearchResult = {
  id: string;
  fileName: string;
  lineNumber: number | null;
  occurrenceIndex: number;
  paneId: string;
  paneLabel: string;
  preview: string;
  side: "added" | "context" | "deleted";
};

type SearchLine = {
  lineNumber: number | null;
  side: ContentSearchResult["side"];
  text: string;
};

type SearchIndexLine = SearchLine & {
  fileName: string;
  occurrenceIndex: number;
  paneId: string;
  paneLabel: string;
  textLower: string;
};

export type ContentSearchIndex = SearchIndexLine[];

const DEFAULT_RESULT_LIMIT = 80;

export function searchDiffContent({
  limit = DEFAULT_RESULT_LIMIT,
  panes,
  query,
}: {
  limit?: number;
  panes: ParsedPane[];
  query: string;
}) {
  return searchContentIndex({
    index: buildContentSearchIndex(panes),
    limit,
    query,
  });
}

export function buildContentSearchIndex(panes: ParsedPane[]): ContentSearchIndex {
  const index: ContentSearchIndex = [];

  for (const pane of panes) {
    const occurrenceByFileName = new Map<string, number>();

    for (const file of pane.files) {
      const occurrenceIndex = (occurrenceByFileName.get(file.name) ?? 0) + 1;
      occurrenceByFileName.set(file.name, occurrenceIndex);

      for (const line of getSearchableLines(file)) {
        index.push({
          ...line,
          fileName: file.name,
          occurrenceIndex,
          paneId: pane.id,
          paneLabel: pane.label,
          textLower: line.text.toLocaleLowerCase(),
        });
      }
    }
  }

  return index;
}

export function searchContentIndex({
  index,
  limit = DEFAULT_RESULT_LIMIT,
  query,
}: {
  index: ContentSearchIndex;
  limit?: number;
  query: string;
}) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];

  const results: ContentSearchResult[] = [];

  for (const line of index) {
    if (!line.textLower.includes(needle)) continue;

    results.push({
      fileName: line.fileName,
      id: `${line.paneId}:${line.fileName}:${line.occurrenceIndex}:${line.side}:${line.lineNumber ?? "old"}:${results.length}`,
      lineNumber: line.lineNumber,
      occurrenceIndex: line.occurrenceIndex,
      paneId: line.paneId,
      paneLabel: line.paneLabel,
      preview: line.text.trim() || "(blank line)",
      side: line.side,
    });

    if (results.length >= limit) return results;
  }

  return results;
}

function* getSearchableLines(file: FileDiffMetadata): Generator<SearchLine> {
  for (const hunk of file.hunks) {
    for (const content of hunk.hunkContent) {
      if (content.type === "context") {
        for (let offset = 0; offset < content.lines; offset += 1) {
          const index = content.additionLineIndex + offset;
          yield {
            lineNumber: hunk.additionStart + index - hunk.additionLineIndex,
            side: "context",
            text: file.additionLines[index] ?? "",
          };
        }
        continue;
      }

      for (let offset = 0; offset < content.deletions; offset += 1) {
        const index = content.deletionLineIndex + offset;
        yield {
          lineNumber: hunk.deletionStart + index - hunk.deletionLineIndex,
          side: "deleted",
          text: file.deletionLines[index] ?? "",
        };
      }

      for (let offset = 0; offset < content.additions; offset += 1) {
        const index = content.additionLineIndex + offset;
        yield {
          lineNumber: hunk.additionStart + index - hunk.additionLineIndex,
          side: "added",
          text: file.additionLines[index] ?? "",
        };
      }
    }
  }
}
