import type { PaneView } from "./types";

export type ScrollSourceMetrics = {
  getHeight: () => number;
  getScrollTop: () => number;
  getTopForItem: (id: string) => number | undefined;
};

export type ActiveScrollFile = {
  intraOffset: number;
  name: string;
  top: number;
};

export function getActiveScrollFile(
  view: PaneView,
  metrics: ScrollSourceMetrics,
): ActiveScrollFile | null {
  if (view.items.length === 0) return null;

  const scrollTop = metrics.getScrollTop();
  const activationLine = scrollTop + Math.min(96, Math.max(32, metrics.getHeight() * 0.28));
  let activeName: string | null = null;
  let activeTop = 0;

  for (const item of view.items) {
    const top = metrics.getTopForItem(item.id);
    if (top == null) continue;
    if (top <= activationLine) {
      if (item.type === "diff") {
        activeName = item.fileDiff.name;
        activeTop = top;
      }
    } else {
      break;
    }
  }

  if (activeName == null && view.items[0]?.type === "diff") {
    activeName = view.items[0].fileDiff.name;
    activeTop = metrics.getTopForItem(view.items[0].id) ?? 0;
  }
  if (activeName == null) return null;

  return {
    intraOffset: Math.max(0, scrollTop - activeTop),
    name: activeName,
    top: activeTop,
  };
}
