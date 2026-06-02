import { type CodeViewHandle } from "@pierre/diffs/react";

import type { LaneId, PaneView } from "./types";

type CodeViewInstance = NonNullable<ReturnType<CodeViewHandle<undefined>["getInstance"]>>;

type PaneScrollInstance = Pick<CodeViewInstance, "scrollTo">;
type PaneScrollCancelableInstance = Pick<CodeViewInstance, "getScrollTop" | "scrollTo">;

const PROGRAMMATIC_SCROLL_SUPPRESSION_MS = 1400;
const USER_SCROLL_DRIVER_MS = 1400;

type PaneScrollTarget = {
  id: LaneId;
  instance: PaneScrollInstance | undefined;
  paneView: PaneView;
};

type PaneScrollDriver = { id: LaneId; until: number } | null;

export function scrollMatchingPaneTargets({
  activeFile,
  behavior = "instant",
  onTargetScroll,
  sourceId,
  targets,
}: {
  activeFile: { name: string; intraOffset: number };
  behavior?: "instant" | "smooth";
  onTargetScroll?: (id: LaneId) => void;
  sourceId: LaneId;
  targets: PaneScrollTarget[];
}) {
  for (const target of targets) {
    if (target.id === sourceId) continue;
    const targetId = target.paneView.idByName.get(activeFile.name);
    if (!target.instance || !targetId) continue;
    onTargetScroll?.(target.id);
    target.instance.scrollTo({
      type: "item",
      id: targetId,
      align: "start",
      offset: activeFile.intraOffset,
      behavior,
    });
  }
}

export function scrollPaneToFile(targets: PaneScrollTarget[], name: string) {
  const primary = targets.find((target) => target.instance && target.paneView.idByName.has(name));
  const targetId = primary?.paneView.idByName.get(name);
  if (!primary?.instance || !targetId) return false;

  primary.instance.scrollTo({
    type: "item",
    id: targetId,
    align: "start",
    offset: 0,
    behavior: "instant",
  });

  scrollMatchingPaneTargets({
    activeFile: { name, intraOffset: 0 },
    behavior: "instant",
    sourceId: primary.id,
    targets,
  });
  return true;
}

export function cancelProgrammaticScroll(instance: PaneScrollCancelableInstance | undefined) {
  if (!instance) return;
  instance.scrollTo({
    type: "position",
    position: instance.getScrollTop(),
    behavior: "instant",
  });
}

export function claimScrollDriver(
  driver: { current: PaneScrollDriver },
  id: LaneId,
  now = Date.now(),
) {
  driver.current = {
    id,
    until: now + USER_SCROLL_DRIVER_MS,
  };
}

export function isScrollDriver(driver: PaneScrollDriver, sourceId: LaneId, now = Date.now()) {
  return !driver || driver.until <= now || driver.id === sourceId;
}

export function suppressProgrammaticScroll(
  suppressedUntil: Map<LaneId, number>,
  id: LaneId,
  now = Date.now(),
) {
  suppressedUntil.set(id, now + PROGRAMMATIC_SCROLL_SUPPRESSION_MS);
}

export function isProgrammaticScrollSuppressed(
  suppressedUntil: Map<LaneId, number>,
  id: LaneId,
  now = Date.now(),
) {
  const until = suppressedUntil.get(id);
  if (!until) return false;
  if (until > now) return true;
  suppressedUntil.delete(id);
  return false;
}
