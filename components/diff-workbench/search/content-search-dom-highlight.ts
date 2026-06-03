import type { SearchNavigationTarget } from "../shared/types";

const SEARCH_MARK_ATTRIBUTE = "data-content-search-match";

type SearchHighlightTarget = {
  lineNumber: number;
  paneId: SearchNavigationTarget["paneId"];
  query: string;
  side: SearchNavigationTarget["side"];
};

type RenderedDiffInstance = {
  fileDiff?: {
    name?: string;
  };
};

export function createSearchHighlightPostRender(
  searchTarget: SearchNavigationTarget | null,
  paneId: SearchNavigationTarget["paneId"],
) {
  return (node: HTMLElement, instance: unknown) => {
    applyContentSearchHighlight(
      getRenderedDiffRoot(node),
      getSearchHighlightTarget(searchTarget, paneId, getRenderedDiffFileName(instance)),
    );
  };
}

export function getSearchHighlightTarget(
  searchTarget: SearchNavigationTarget | null,
  paneId: SearchNavigationTarget["paneId"],
  fileName: string | undefined,
): SearchHighlightTarget | null {
  if (
    !searchTarget?.lineNumber ||
    searchTarget.paneId !== paneId ||
    !searchTarget.query.trim() ||
    !fileName ||
    searchTarget.fileName !== fileName
  ) {
    return null;
  }

  return {
    lineNumber: searchTarget.lineNumber,
    paneId: searchTarget.paneId,
    query: searchTarget.query,
    side: searchTarget.side,
  };
}

function getRenderedDiffRoot(node: HTMLElement) {
  return node.shadowRoot ?? node;
}

function applyContentSearchHighlight(root: ParentNode, target: SearchHighlightTarget | null) {
  clearContentSearchHighlights(root);
  if (!target) return;

  for (const line of getTargetLines(root, target)) {
    highlightTextInLine(line, target.query);
  }
}

function clearContentSearchHighlights(root: ParentNode) {
  for (const mark of root.querySelectorAll<HTMLElement>(`[${SEARCH_MARK_ATTRIBUTE}]`)) {
    const parent = mark.parentNode;
    if (!parent) continue;

    parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark);
    parent.normalize();
  }
}

function getTargetLines(root: ParentNode, target: SearchHighlightTarget) {
  const lineNumber = escapeSelectorValue(String(target.lineNumber));
  return Array.from(root.querySelectorAll<HTMLElement>(`[data-line="${lineNumber}"]`)).filter(
    (line) => lineMatchesTargetSide(line, target.side),
  );
}

function lineMatchesTargetSide(line: HTMLElement, side: SearchHighlightTarget["side"]) {
  const lineType = line.getAttribute("data-line-type") ?? "";

  if (side === "added") return lineType.includes("addition");
  if (side === "deleted") return lineType.includes("deletion");
  return lineType === "context";
}

function highlightTextInLine(line: HTMLElement, query: string) {
  const textNodes = getTextNodes(line);
  const lineText = textNodes.map((node) => node.nodeValue ?? "").join("");
  const ranges = getContentSearchMatchRanges(lineText, query);

  for (const range of ranges.toReversed()) {
    wrapTextRange(textNodes, range.start, range.end);
  }
}

function getTextNodes(root: HTMLElement) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();

  while (current) {
    if (current instanceof Text && current.nodeValue) nodes.push(current);
    current = walker.nextNode();
  }

  return nodes;
}

export function getContentSearchMatchRanges(text: string, query: string) {
  const needle = query.trim();
  if (!needle) return [];

  const ranges: ContentSearchMatchRange[] = [];
  const lowerText = text.toLocaleLowerCase();
  const lowerNeedle = needle.toLocaleLowerCase();
  let cursor = 0;

  while (cursor < text.length) {
    const index = lowerText.indexOf(lowerNeedle, cursor);
    if (index === -1) break;

    const end = index + needle.length;
    ranges.push({ end, start: index });
    cursor = end;
  }

  return ranges;
}

type ContentSearchMatchRange = {
  end: number;
  start: number;
};

function wrapTextRange(textNodes: Text[], rangeStart: number, rangeEnd: number) {
  let cursor = 0;

  for (const node of textNodes) {
    const value = node.nodeValue ?? "";
    const nodeStart = cursor;
    const nodeEnd = cursor + value.length;
    cursor = nodeEnd;

    const start = Math.max(rangeStart, nodeStart);
    const end = Math.min(rangeEnd, nodeEnd);
    if (start >= end) continue;

    wrapTextNodeSegment(node, start - nodeStart, end - nodeStart);
  }
}

function wrapTextNodeSegment(node: Text, start: number, end: number) {
  const selected = node.splitText(start);
  selected.splitText(end - start);

  const mark = document.createElement("mark");
  mark.setAttribute(SEARCH_MARK_ATTRIBUTE, "");
  mark.style.backgroundColor = "rgb(250 204 21 / 0.5)";
  mark.style.borderRadius = "3px";
  mark.style.boxShadow = "0 0 0 1px rgb(250 204 21 / 0.3)";
  mark.style.color = "inherit";
  mark.style.padding = "0 1px";
  mark.textContent = selected.nodeValue;

  selected.parentNode?.replaceChild(mark, selected);
}

function getRenderedDiffFileName(instance: unknown) {
  return (instance as RenderedDiffInstance | undefined)?.fileDiff?.name;
}

function escapeSelectorValue(value: string) {
  return globalThis.CSS?.escape?.(value) ?? value.replaceAll('"', '\\"');
}
