import { cn } from "@/lib/utils";

import type { Layout } from "./types";

const LANE_HEADER_HEIGHT = 44;
const EMPTY_LANE_BODY_HEIGHT = 148;
type LaneContentKind = "error" | "empty" | "rows" | "columns";

function getLaneContentKind({
  hasError,
  isEmpty,
  layout,
}: {
  hasError: boolean;
  isEmpty: boolean;
  layout: Layout;
}): LaneContentKind {
  if (hasError) return "error";
  if (isEmpty) return "empty";
  return layout;
}

export function getLaneColumnHeight({ isEmpty }: { isEmpty: boolean }) {
  return isEmpty ? LANE_HEADER_HEIGHT + EMPTY_LANE_BODY_HEIGHT : undefined;
}

function getLaneSectionStyle({ columnHeight, layout }: { columnHeight?: number; layout: Layout }) {
  if (layout !== "columns" || columnHeight === undefined) return undefined;
  return laneColumnStyle(columnHeight);
}

function laneColumnStyle(height: number) {
  return {
    height: `min(100%, ${height}px)`,
  };
}

function getLaneSectionClass({
  borderClass,
  isEmpty,
  layout,
}: {
  borderClass: string;
  isEmpty: boolean;
  layout: Layout;
}) {
  return cn(
    "flex min-h-0 flex-col rounded-xl border bg-card shadow-sm",
    borderClass,
    isEmpty && "border-dashed bg-card/55",
    layout === "columns" && "max-h-full overflow-hidden",
    layout === "columns" && !isEmpty && "h-full",
    layout === "rows" && "h-auto overflow-clip",
  );
}

function getLaneBodyClass({ isEmpty, layout }: { isEmpty: boolean; layout: Layout }) {
  return cn(
    "min-h-0",
    isEmpty
      ? "flex shrink-0 overflow-hidden"
      : layout === "rows"
        ? "block overflow-visible"
        : "flex flex-1 overflow-hidden",
  );
}

export function getLaneLayoutState({
  borderClass,
  hasError,
  isEmpty,
  layout,
}: {
  borderClass: string;
  hasError: boolean;
  isEmpty: boolean;
  layout: Layout;
}) {
  const columnHeight = getLaneColumnHeight({ isEmpty });

  return {
    bodyClass: getLaneBodyClass({ isEmpty, layout }),
    columnHeight,
    contentKind: getLaneContentKind({ hasError, isEmpty, layout }),
    sectionClass: getLaneSectionClass({ borderClass, isEmpty, layout }),
    sectionStyle: getLaneSectionStyle({ columnHeight, layout }),
  };
}
