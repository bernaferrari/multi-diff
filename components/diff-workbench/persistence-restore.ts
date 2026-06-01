import { MAX_LANES, laneIdAt, laneTitle } from "./lanes"
import type { DiffStyle, LaneMarkerStyle, Layout, Pane } from "./types"

type RestoredWorkbenchState = {
  panes?: Pane[]
  notes?: string
  layout?: Layout
  diffStyle?: DiffStyle
  wrap?: boolean
  lineNumbers?: boolean
  laneMarkerStyle?: LaneMarkerStyle
  sidebarOpen?: boolean
}

const STORED_LAYOUTS = ["columns", "rows"] satisfies Layout[]
const STORED_DIFF_STYLES = ["split", "unified"] satisfies DiffStyle[]
const STORED_LANE_MARKER_STYLES = [
  "letters",
  "bars",
] satisfies LaneMarkerStyle[]

export function restoreStoredWorkbenchState(
  value: unknown
): RestoredWorkbenchState | null {
  if (!isRecord(value)) return null

  return {
    panes: restorePanes(value.panes),
    notes: restoreString(value.notes),
    layout: restoreLayout(value.layout),
    diffStyle: restoreDiffStyle(value.diffStyle),
    wrap: restoreBoolean(value.wrap),
    lineNumbers: restoreBoolean(value.lineNumbers),
    laneMarkerStyle: restoreLaneMarkerStyle(value.laneMarkerStyle),
    sidebarOpen: restoreBoolean(value.sidebarOpen),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value)
}

function restoreBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined
}

function restoreString(value: unknown) {
  return typeof value === "string" ? value : undefined
}

function restoreStringEnum<TValue extends string>(
  value: unknown,
  allowed: readonly TValue[]
): TValue | undefined {
  return typeof value === "string" && allowed.includes(value as TValue)
    ? (value as TValue)
    : undefined
}

function restoreLayout(value: unknown): Layout | undefined {
  return restoreStringEnum(value, STORED_LAYOUTS)
}

function restoreDiffStyle(value: unknown): DiffStyle | undefined {
  return restoreStringEnum(value, STORED_DIFF_STYLES)
}

function restoreLaneMarkerStyle(value: unknown): LaneMarkerStyle | undefined {
  return restoreStringEnum(value, STORED_LANE_MARKER_STYLES)
}

function restorePanes(value: unknown): Pane[] | undefined {
  if (!Array.isArray(value)) return undefined

  const restored = value.slice(0, MAX_LANES).map(restorePane)

  return restored.length > 0 ? restored : undefined
}

function restorePane(pane: unknown, index: number): Pane {
  const id = laneIdAt(index)
  const savedPane = isRecord(pane) ? pane : {}

  return {
    id,
    label: laneTitle(id),
    text: typeof savedPane.text === "string" ? savedPane.text : "",
    filename:
      typeof savedPane.filename === "string" ? savedPane.filename : undefined,
  }
}
