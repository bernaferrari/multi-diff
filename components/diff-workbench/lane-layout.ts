import { cn } from "@/lib/utils"

import { laneColumnStyle } from "./diff-styles"
import { estimateCodeHeight } from "./lane-metrics"
import type { Layout, PaneView } from "./types"

const LANE_HEADER_HEIGHT = 44
const EMPTY_LANE_BODY_HEIGHT = 148
export type LaneContentKind = "error" | "empty" | "rows" | "columns"

export function getLaneContentKind({
  hasError,
  isEmpty,
  layout,
}: {
  hasError: boolean
  isEmpty: boolean
  layout: Layout
}): LaneContentKind {
  if (hasError) return "error"
  if (isEmpty) return "empty"
  return layout
}

function getLaneColumnHeight({
  isEmpty,
  view,
}: {
  isEmpty: boolean
  view: PaneView
}) {
  return (
    LANE_HEADER_HEIGHT +
    (isEmpty ? EMPTY_LANE_BODY_HEIGHT : estimateCodeHeight(view))
  )
}

function getLaneSectionStyle({
  columnHeight,
  layout,
}: {
  columnHeight: number
  layout: Layout
}) {
  return layout === "columns" ? laneColumnStyle(columnHeight) : undefined
}

function getLaneSectionClass({
  borderClass,
  isEmpty,
  layout,
}: {
  borderClass: string
  isEmpty: boolean
  layout: Layout
}) {
  return cn(
    "flex min-h-0 flex-col rounded-xl border bg-card shadow-sm",
    borderClass,
    isEmpty && "border-dashed bg-card/55",
    layout === "columns" && "max-h-full overflow-hidden",
    layout === "rows" && "h-auto overflow-clip"
  )
}

function getLaneBodyClass({
  isEmpty,
  layout,
}: {
  isEmpty: boolean
  layout: Layout
}) {
  return cn(
    "min-h-0",
    isEmpty
      ? "flex shrink-0 overflow-hidden"
      : layout === "rows"
        ? "block overflow-visible"
      : "flex flex-1 overflow-hidden"
  )
}

export function getLaneLayoutState({
  borderClass,
  hasError,
  isEmpty,
  layout,
  view,
}: {
  borderClass: string
  hasError: boolean
  isEmpty: boolean
  layout: Layout
  view: PaneView
}) {
  const columnHeight = getLaneColumnHeight({ isEmpty, view })

  return {
    bodyClass: getLaneBodyClass({ isEmpty, layout }),
    columnHeight,
    contentKind: getLaneContentKind({ hasError, isEmpty, layout }),
    sectionClass: getLaneSectionClass({ borderClass, isEmpty, layout }),
    sectionStyle: getLaneSectionStyle({ columnHeight, layout }),
  }
}
