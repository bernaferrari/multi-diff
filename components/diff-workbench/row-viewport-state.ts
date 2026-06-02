import type { LaneId } from "./types";

type RowViewportBlock = {
  dataset: {
    rowFileName?: string;
    rowLaneId?: string;
  };
  getBoundingClientRect: () => Pick<DOMRect, "bottom" | "top">;
};

type RowViewportScroller = {
  getBoundingClientRect: () => Pick<DOMRect, "height" | "top">;
  querySelectorAll: (selector: string) => Iterable<RowViewportBlock>;
};

export function getActiveRowsFile(scroller: RowViewportScroller) {
  const blocks = Array.from(scroller.querySelectorAll("[data-row-file-name]"));
  if (blocks.length === 0) return null;

  const scrollerRect = scroller.getBoundingClientRect();
  const activationLine = scrollerRect.top + Math.min(96, Math.max(32, scrollerRect.height * 0.18));
  let active: { laneId: LaneId; name: string } | null = null;

  for (const block of blocks) {
    const blockRect = block.getBoundingClientRect();
    if (blockRect.top <= activationLine && blockRect.bottom > scrollerRect.top) {
      const name = block.dataset.rowFileName;
      const laneId = block.dataset.rowLaneId;
      if (name && laneId) active = { laneId: laneId as LaneId, name };
    } else if (blockRect.top > activationLine) {
      break;
    }
  }

  if (active) return active;
  const firstName = blocks[0]?.dataset.rowFileName;
  const firstLaneId = blocks[0]?.dataset.rowLaneId;
  return firstName && firstLaneId ? { laneId: firstLaneId as LaneId, name: firstName } : null;
}
