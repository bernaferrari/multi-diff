import { Fragment } from "react"

import { getVisibleDiffStatParts } from "./diff-stat-format"
import { LaneBadge } from "./lane-badge"
import { laneStyle } from "./lanes"
import type { FileRow, LaneId, LaneMarkerStyle, Layout } from "./types"

type TextPart = {
  highlighted: boolean
  text: string
}

export function splitHighlightedText(text: string, query: string): TextPart[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return [{ highlighted: false, text }]

  const lower = text.toLowerCase()
  const parts: TextPart[] = []
  let cursor = 0
  let match = lower.indexOf(needle)

  while (match !== -1) {
    if (match > cursor) {
      parts.push({ highlighted: false, text: text.slice(cursor, match) })
    }
    parts.push({
      highlighted: true,
      text: text.slice(match, match + needle.length),
    })
    cursor = match + needle.length
    match = lower.indexOf(needle, cursor)
  }

  if (cursor < text.length) {
    parts.push({ highlighted: false, text: text.slice(cursor) })
  }

  return parts
}

export function HighlightMatch({
  query,
  text,
}: {
  query: string
  text: string
}) {
  return (
    <>
      {splitHighlightedText(text, query).map((part, index) =>
        part.highlighted ? (
          <mark
            key={index}
            className="rounded-[2px] bg-amber-300/55 text-inherit dark:bg-amber-400/30"
          >
            {part.text}
          </mark>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        )
      )}
    </>
  )
}

export function LaneBadges({
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
          <LaneMarkerBar
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

function LaneMarkerBar({
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

export function DiffStats({ row }: { row: FileRow }) {
  const stats = getVisibleDiffStatParts(row)

  return (
    <span className="flex w-16 shrink-0 items-center justify-end gap-1.5 text-right font-mono text-[10px] leading-none tabular-nums">
      {stats.additions ? (
        <span className="text-add">{stats.additions}</span>
      ) : null}
      {stats.deletions ? (
        <span className="text-del">{stats.deletions}</span>
      ) : null}
    </span>
  )
}
