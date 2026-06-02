import type { FileDiffMetadata } from "@pierre/diffs/react";

import { buildDiffCodeItems } from "./diff-data";
import { diffTotalsForFiles } from "./diff-totals";
import { compareFilePath } from "./file-order";
import type { LaneId, PaneView, ParsedPane } from "./types";

export type DisplayedPaneView = {
  pane: ParsedPane;
  paneView: PaneView;
};

export function buildPaneViewModel({
  displayedPanes,
  focused,
  hiddenFiles,
  parsed,
}: {
  displayedPanes: ParsedPane[];
  focused: string | null;
  hiddenFiles: Set<string>;
  parsed: ParsedPane[];
}) {
  const displayedPaneIds = new Set(displayedPanes.map((pane) => pane.id));
  const displayedPaneViews: DisplayedPaneView[] = [];
  const paneViews = new Map<LaneId, PaneView>();

  for (const pane of parsed) {
    const paneView = buildPaneView(pane, focused, hiddenFiles);
    paneViews.set(pane.id, paneView);

    if (displayedPaneIds.has(pane.id)) {
      displayedPaneViews.push({ pane, paneView });
    }
  }

  return { displayedPaneViews, paneViews };
}

export function buildPaneView(
  pane: ParsedPane,
  focused: string | null,
  hiddenFiles: Set<string>,
): PaneView {
  const files = getPaneViewFiles({
    files: pane.files,
    focused,
    hiddenFiles,
  });
  const { idByName, items } = buildDiffCodeItems(pane.id, files);
  const { additions, deletions } = diffTotalsForFiles(files);

  return {
    id: pane.id,
    files,
    items,
    idByName,
    additions,
    deletions,
  };
}

function getPaneViewFiles({
  files,
  focused,
  hiddenFiles,
}: {
  files: FileDiffMetadata[];
  focused: string | null;
  hiddenFiles: Set<string>;
}) {
  const visibleFiles = focused
    ? files.filter((file) => file.name === focused)
    : files.filter((file) => !hiddenFiles.has(file.name));

  return [...visibleFiles].sort((a, b) => compareFilePath(a.name, b.name));
}
