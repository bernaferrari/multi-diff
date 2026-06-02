import type { SelectedLineRange, SelectionSide } from "@pierre/diffs/react";

import type { PaneView, SearchNavigationTarget } from "./types";

type CodeViewSearchSelection = {
  id: string;
  range: SelectedLineRange;
};

export function getSearchSelectedLineRange(
  paneId: string,
  fileName: string,
  searchTarget: SearchNavigationTarget | null,
): SelectedLineRange | null {
  if (
    !searchTarget?.lineNumber ||
    searchTarget.paneId !== paneId ||
    searchTarget.fileName !== fileName
  ) {
    return null;
  }

  return {
    end: searchTarget.lineNumber,
    endSide: getSearchSelectionSide(searchTarget.side),
    side: getSearchSelectionSide(searchTarget.side),
    start: searchTarget.lineNumber,
  };
}

export function getCodeViewSearchSelection(
  view: PaneView,
  searchTarget: SearchNavigationTarget | null,
): CodeViewSearchSelection | null {
  if (!searchTarget?.lineNumber || searchTarget.paneId !== view.id) return null;
  const id = view.idByName.get(searchTarget.fileName);
  if (!id) return null;

  return {
    id,
    range: {
      end: searchTarget.lineNumber,
      endSide: getSearchSelectionSide(searchTarget.side),
      side: getSearchSelectionSide(searchTarget.side),
      start: searchTarget.lineNumber,
    },
  };
}

function getSearchSelectionSide(side: SearchNavigationTarget["side"]): SelectionSide {
  return side === "deleted" ? "deletions" : "additions";
}
