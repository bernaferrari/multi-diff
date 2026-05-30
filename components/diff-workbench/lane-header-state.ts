import type { PaneView } from "./types"

export type LaneHeaderStats = {
  additions: number
  deletions: number
}

export type LaneHeaderActionsState = {
  canClear: boolean
  label: string
}

type LaneHeaderState = {
  actions: LaneHeaderActionsState
  stats: LaneHeaderStats | null
}

function getLaneHeaderStats(view: PaneView): LaneHeaderStats | null {
  if (view.items.length === 0) return null
  return {
    additions: view.additions,
    deletions: view.deletions,
  }
}

function getLaneActionsLabel(label: string) {
  return `${label} actions`
}

function getLaneHeaderActionsState({
  isEmpty,
  label,
}: {
  isEmpty: boolean
  label: string
}): LaneHeaderActionsState {
  return {
    canClear: !isEmpty,
    label: getLaneActionsLabel(label),
  }
}

export function getLaneHeaderState({
  isEmpty,
  label,
  view,
}: {
  isEmpty: boolean
  label: string
  view: PaneView
}): LaneHeaderState {
  return {
    actions: getLaneHeaderActionsState({ isEmpty, label }),
    stats: getLaneHeaderStats(view),
  }
}
