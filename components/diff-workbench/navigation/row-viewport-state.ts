import type { FileDiffMetadata, SelectionSide } from "@pierre/diffs/react";

import type { LaneId } from "../shared/types";
import { DIFF_LINE_HEIGHT_PX } from "../rendering/diff-render-metrics";

const ROW_FILE_HEADER_HEIGHT_PX = 40;

type RowViewportBlock = {
  dataset: {
    rowFileName?: string;
    rowLaneId?: string;
  };
  getBoundingClientRect: () => Pick<DOMRect, "bottom" | "top">;
};

type RowViewportScroller = {
  clientHeight?: number;
  getBoundingClientRect: () => Pick<DOMRect, "height" | "top">;
  querySelectorAll: (selector: string) => Iterable<RowViewportBlock>;
  scrollHeight?: number;
  scrollTop?: number;
};

export function getActiveRowsFile(scroller: RowViewportScroller) {
  const blocks = Array.from(scroller.querySelectorAll("[data-row-file-name]"));
  if (blocks.length === 0) return null;

  const scrollerRect = scroller.getBoundingClientRect();
  const activationLine = scrollerRect.top + Math.min(96, Math.max(32, scrollerRect.height * 0.18));
  let active: { laneId: LaneId; name: string } | null = null;

  for (const block of blocks) {
    const blockRect = block.getBoundingClientRect();
    if (blockRect.top <= activationLine && blockRect.bottom > scrollerRect.top) {
      const name = block.dataset.rowFileName;
      const laneId = block.dataset.rowLaneId;
      if (name && laneId) active = { laneId: laneId as LaneId, name };
    } else if (blockRect.top > activationLine) {
      break;
    }
  }

  if (active) return active;
  const firstName = blocks[0]?.dataset.rowFileName;
  const firstLaneId = blocks[0]?.dataset.rowLaneId;
  return firstName && firstLaneId ? { laneId: firstLaneId as LaneId, name: firstName } : null;
}

export function getRowNavigationTop(scroller: RowViewportScroller, block: RowViewportBlock) {
  const blockRect = block.getBoundingClientRect();
  const scrollerRect = scroller.getBoundingClientRect();
  const scrollTop = scroller.scrollTop ?? 0;
  const targetTop = blockRect.top - scrollerRect.top + scrollTop;
  const maxScrollTop =
    typeof scroller.scrollHeight === "number" && typeof scroller.clientHeight === "number"
      ? Math.max(scroller.scrollHeight - scroller.clientHeight, 0)
      : targetTop;

  return Math.max(0, Math.min(targetTop, maxScrollTop));
}

export function getRowNavigationTargetLine({
  lineNumber,
  root,
  side,
}: {
  lineNumber: number;
  root: ParentNode;
  side?: SelectionSide;
}) {
  const selector = `[data-line="${escapeSelectorValue(String(lineNumber))}"]`;

  for (const searchRoot of getSearchRoots(root)) {
    const lines = Array.from(searchRoot.querySelectorAll<HTMLElement>(selector));
    if (!side && lines[0]) return lines[0];

    const sideMatch = lines.find((line) => lineMatchesNavigationSide(line, side));
    if (sideMatch) return sideMatch;
  }

  return null;
}

export function getRowNavigationLineTop({
  diffStyle,
  fileDiff,
  lineNumber,
  side = "additions",
}: {
  diffStyle: "split" | "unified";
  fileDiff: FileDiffMetadata;
  lineNumber: number;
  side?: SelectionSide;
}) {
  const lineIndex = getDiffLineIndex({ diffStyle, fileDiff, lineNumber, side });
  if (lineIndex == null) return null;

  return ROW_FILE_HEADER_HEIGHT_PX + lineIndex * DIFF_LINE_HEIGHT_PX;
}

function getSearchRoots(root: ParentNode) {
  const roots: ParentNode[] = [root];

  for (const element of root.querySelectorAll<HTMLElement>("*")) {
    if (element.shadowRoot) roots.push(element.shadowRoot);
  }

  return roots;
}

function lineMatchesNavigationSide(line: HTMLElement, side: SelectionSide | undefined) {
  if (!side) return true;
  const lineType = line.getAttribute("data-line-type") ?? "";

  if (side === "deletions") return lineType.includes("deletion");
  return lineType.includes("addition") || lineType === "context";
}

function escapeSelectorValue(value: string) {
  return globalThis.CSS?.escape?.(value) ?? value.replaceAll('"', '\\"');
}

function getDiffLineIndex({
  diffStyle,
  fileDiff,
  lineNumber,
  side,
}: {
  diffStyle: "split" | "unified";
  fileDiff: FileDiffMetadata;
  lineNumber: number;
  side: SelectionSide;
}) {
  const targetLineIndexes = getDiffLineIndexes(fileDiff, lineNumber, side);
  if (targetLineIndexes == null) return null;

  const [unifiedIndex, splitIndex] = targetLineIndexes;
  return diffStyle === "split" ? splitIndex : unifiedIndex;
}

function getDiffLineIndexes(fileDiff: FileDiffMetadata, lineNumber: number, side: SelectionSide) {
  const lastHunk = fileDiff.hunks.at(-1);
  let targetUnifiedIndex: number | undefined;
  let targetSplitIndex: number | undefined;

  hunkIterator: for (const hunk of fileDiff.hunks) {
    let currentLineNumber = side === "deletions" ? hunk.deletionStart : hunk.additionStart;
    const hunkCount = side === "deletions" ? hunk.deletionCount : hunk.additionCount;
    let splitIndex = hunk.splitLineStart;
    let unifiedIndex = hunk.unifiedLineStart;

    if (lineNumber < currentLineNumber) {
      const difference = currentLineNumber - lineNumber;
      targetUnifiedIndex = Math.max(unifiedIndex - difference, 0);
      targetSplitIndex = Math.max(splitIndex - difference, 0);
      break hunkIterator;
    }

    if (lineNumber >= currentLineNumber + hunkCount) {
      if (hunk === lastHunk) {
        const difference = lineNumber - (currentLineNumber + hunkCount);
        targetUnifiedIndex = unifiedIndex + hunk.unifiedLineCount + difference;
        targetSplitIndex = splitIndex + hunk.splitLineCount + difference;
        break hunkIterator;
      }
      continue;
    }

    for (const content of hunk.hunkContent) {
      if (content.type === "context") {
        if (lineNumber < currentLineNumber + content.lines) {
          const difference = lineNumber - currentLineNumber;
          targetSplitIndex = splitIndex + difference;
          targetUnifiedIndex = unifiedIndex + difference;
          break hunkIterator;
        }

        currentLineNumber += content.lines;
        splitIndex += content.lines;
        unifiedIndex += content.lines;
        continue;
      }

      const sideCount = side === "deletions" ? content.deletions : content.additions;
      if (lineNumber < currentLineNumber + sideCount) {
        const indexDifference = lineNumber - currentLineNumber;
        targetUnifiedIndex =
          unifiedIndex + (side === "additions" ? content.deletions : 0) + indexDifference;
        targetSplitIndex = splitIndex + indexDifference;
        break hunkIterator;
      }

      currentLineNumber += sideCount;
      splitIndex += Math.max(content.deletions, content.additions);
      unifiedIndex += content.deletions + content.additions;
    }

    break hunkIterator;
  }

  if (targetUnifiedIndex == null || targetSplitIndex == null) return null;
  return [targetUnifiedIndex, targetSplitIndex] as const;
}
