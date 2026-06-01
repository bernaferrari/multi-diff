import { ArrowDown, ArrowUp } from "lucide-react"

import { LANE_ORDER } from "./lanes"
import type { LaneId } from "./types"

export function ImportStagedMoveControls({
  fileName,
  index,
  isLast,
  onMove,
}: {
  fileName: string
  index: number
  isLast: boolean
  onMove: (fromIndex: number, toIndex: number) => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
        className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        aria-label={`Move ${fileName} up`}
      >
        <ArrowUp className="size-3.5" />
      </button>
      <button
        type="button"
        disabled={isLast}
        onClick={() => onMove(index, index + 1)}
        className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        aria-label={`Move ${fileName} down`}
      >
        <ArrowDown className="size-3.5" />
      </button>
    </div>
  )
}

export function ImportLaneSelect({
  fileName,
  lane,
  onChange,
}: {
  fileName: string
  lane: LaneId
  onChange: (lane: LaneId) => void
}) {
  return (
    <select
      value={lane}
      onChange={(event) => onChange(event.currentTarget.value as LaneId)}
      className="h-7 shrink-0 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Lane for ${fileName}`}
    >
      {LANE_ORDER.map((option) => (
        <option key={option} value={option}>
          {option.toUpperCase()}
        </option>
      ))}
    </select>
  )
}
