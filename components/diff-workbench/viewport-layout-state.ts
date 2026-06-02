import { cn } from "@/lib/utils";

import { getEqualColumnGridStyle } from "./grid-layout";
import type { LaneId, Layout } from "./types";

function getViewportSectionClass(layout: Layout) {
  return cn(
    "min-h-0 flex-1",
    layout === "columns"
      ? "h-full overflow-hidden p-3 pb-5"
      : "scroll-thin overflow-y-auto px-3 pt-3 pb-5",
  );
}

function getPaneStackClass(layout: Layout) {
  return cn(layout === "columns" ? "grid h-full min-h-0 gap-3" : "flex flex-col gap-3");
}

function getPaneStackStyle({ count, layout }: { count: number; layout: Layout }) {
  return layout === "columns" ? getEqualColumnGridStyle(count) : undefined;
}

function getEmptyViewportMessage(visiblePaneCount: number) {
  return visiblePaneCount === 0
    ? "All lanes hidden — re-enable one from the chips above."
    : "No visible lane modifies this file.";
}

export function getViewportLayoutState({
  displayedPaneCount,
  layout,
  visiblePaneCount,
}: {
  displayedPaneCount: number;
  layout: Layout;
  visiblePaneCount: number;
}) {
  return {
    emptyMessage: getEmptyViewportMessage(visiblePaneCount),
    paneStackClass: getPaneStackClass(layout),
    paneStackStyle: getPaneStackStyle({
      count: displayedPaneCount,
      layout,
    }),
    sectionClass: getViewportSectionClass(layout),
  };
}

export function getViewportLaneMoveState(paneIds: LaneId[], index: number) {
  return {
    leftPaneId: paneIds[index - 1] ?? null,
    rightPaneId: paneIds[index + 1] ?? null,
  };
}
