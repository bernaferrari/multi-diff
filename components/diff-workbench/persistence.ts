import { MAX_LANES, laneIdAt, laneTitle } from "./lanes"
import type { DiffStyle, LaneMarkerStyle, Layout, Pane } from "./types"

export const STORAGE_KEY = "sf-diff:v1"

type WorkbenchStorage = Pick<Storage, "getItem" | "setItem">
type JsonRecord = Record<string, unknown>

export type StoredWorkbenchState = {
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

export function readStoredWorkbenchState(
  storage: WorkbenchStorage = localStorage
): StoredWorkbenchState | null {
  const saved = readStoredRecord(storage)
  if (!saved) return null

  return {
    panes: restorePanes(saved.panes),
    notes: restoreString(saved.notes),
    layout: restoreLayout(saved.layout),
    diffStyle: restoreDiffStyle(saved.diffStyle),
    wrap: restoreBoolean(saved.wrap),
    lineNumbers: restoreBoolean(saved.lineNumbers),
    laneMarkerStyle: restoreLaneMarkerStyle(saved.laneMarkerStyle),
    sidebarOpen: restoreBoolean(saved.sidebarOpen),
  }
}

function readStoredRecord(storage: WorkbenchStorage): JsonRecord | null {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved: unknown = JSON.parse(raw)
    if (!isRecord(saved)) return null
    return saved
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return value != null && typeof value === "object" && !Array.isArray(value)
}

function restoreBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined
}

function restoreString(value: unknown) {
  return typeof value === "string" ? value : undefined
}

export function restoreStringEnum<TValue extends string>(
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

export function writeStoredWorkbenchState(
  state: StoredWorkbenchState,
  storage: WorkbenchStorage = localStorage
) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota errors
  }
}

function restorePanes(value: unknown): Pane[] | undefined {
  if (!Array.isArray(value)) return undefined

  const restored = value.slice(0, MAX_LANES).map(restorePane)

  return restored.length > 0 ? restored : undefined
}

export function restorePane(pane: unknown, index: number): Pane {
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
