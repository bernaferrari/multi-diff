import type { LaneId, Pane } from "../shared/types";

export function toggleHiddenLane(current: Set<LaneId>, id: LaneId, paneCount: number) {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else if (canHideAnotherLane(next, paneCount)) next.add(id);
  return next;
}

export function canHideAnotherLane(hidden: Set<LaneId>, paneCount: number) {
  return hidden.size < Math.max(0, paneCount - 1);
}

export function clearLane(panes: Pane[], id: LaneId) {
  return panes.map((pane) => (pane.id === id ? { ...pane, text: "", filename: undefined } : pane));
}

export function swapLaneContents(panes: Pane[], sourceId: LaneId, targetId: LaneId) {
  if (sourceId === targetId) return panes;

  const source = panes.find((pane) => pane.id === sourceId);
  const target = panes.find((pane) => pane.id === targetId);
  if (!source || !target) return panes;

  return panes.map((pane) => {
    if (pane.id === sourceId) {
      return { ...pane, text: target.text, filename: target.filename };
    }
    if (pane.id === targetId) {
      return { ...pane, text: source.text, filename: source.filename };
    }
    return pane;
  });
}
