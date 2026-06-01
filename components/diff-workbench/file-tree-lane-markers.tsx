import type { FileRow, LaneId, LaneMarkerStyle, Layout } from "./types"

import { LaneBadge } from "./lane-badge"
import { laneStyle } from "./lanes"

export function FileTreeLaneMarkers({
  laneIds,
  layout,
  markerStyle = "letters",
  row,
}: {
  laneIds: LaneId[]
  layout: Layout
  markerStyle?: LaneMarkerStyle
  row: FileRow
}) {
  if (markerStyle === "bars") {
    return (
      <span
        className={
          layout === "rows"
            ? "ml-2 flex shrink-0 flex-col items-end justify-center gap-px"
            : "ml-2 flex shrink-0 justify-end gap-0.5"
        }
      >
        {laneIds.map((id) => (
          <FileTreeLaneMarkerBar
            key={id}
            id={id}
            layout={layout}
            present={Boolean(row.panes[id])}
          />
        ))}
      </span>
    )
  }

  return (
    <span className="ml-1 flex shrink-0 justify-end gap-0.5">
      {laneIds.map((id) => (
        <LaneBadge
          key={id}
          id={id}
          present={Boolean(row.panes[id])}
          size="sm"
          tone="soft"
        />
      ))}
    </span>
  )
}

function FileTreeLaneMarkerBar({
  id,
  layout,
  present,
}: {
  id: LaneId
  layout: Layout
  present: boolean
}) {
  const style = laneStyle(id)
  const shape = layout === "rows" ? "h-1 w-3.5" : "h-3 w-1.5"

  return (
    <span
      aria-hidden
      className={
        present
          ? `${shape} rounded-[2px] ${style.bar}`
          : `${shape} rounded-[2px] bg-muted`
      }
    />
  )
}
