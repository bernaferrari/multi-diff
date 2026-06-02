import type { FileDiffMetadata } from "@pierre/diffs/react";

import type { ParsedPane } from "./types";

export type ContentSearchResult = {
  id: string;
  fileName: string;
  lineNumber: number | null;
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
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];

  const results: ContentSearchResult[] = [];

  for (const pane of panes) {
    for (const file of pane.files) {
      for (const line of getSearchableLines(file)) {
        if (!line.text.toLocaleLowerCase().includes(needle)) continue;

        results.push({
          fileName: file.name,
          id: `${pane.id}:${file.name}:${line.side}:${line.lineNumber ?? "old"}:${results.length}`,
          lineNumber: line.lineNumber,
          paneId: pane.id,
          paneLabel: pane.label,
          preview: line.text.trim() || "(blank line)",
          side: line.side,
        });

        if (results.length >= limit) return results;
      }
    }
  }

  return results;
}

function getSearchableLines(file: FileDiffMetadata) {
  const lines: SearchLine[] = [];

  for (const hunk of file.hunks) {
    for (const content of hunk.hunkContent) {
      if (content.type === "context") {
        for (let offset = 0; offset < content.lines; offset += 1) {
          const index = content.additionLineIndex + offset;
          lines.push({
            lineNumber: hunk.additionStart + index - hunk.additionLineIndex,
            side: "context",
            text: file.additionLines[index] ?? "",
          });
        }
        continue;
      }

      for (let offset = 0; offset < content.deletions; offset += 1) {
        const index = content.deletionLineIndex + offset;
        lines.push({
          lineNumber: hunk.deletionStart + index - hunk.deletionLineIndex,
          side: "deleted",
          text: file.deletionLines[index] ?? "",
        });
      }

      for (let offset = 0; offset < content.additions; offset += 1) {
        const index = content.additionLineIndex + offset;
        lines.push({
          lineNumber: hunk.additionStart + index - hunk.additionLineIndex,
          side: "added",
          text: file.additionLines[index] ?? "",
        });
      }
    }
  }

  return lines;
}
