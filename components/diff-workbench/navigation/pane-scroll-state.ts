import { type CodeViewHandle } from "@pierre/diffs/react";

import type { FileNavigationTarget, LaneId, PaneView } from "../shared/types";

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
  activeFile: {
    name: string;
    intraOffset: number;
    lineNumber?: FileNavigationTarget["lineNumber"];
    occurrenceIndex?: FileNavigationTarget["occurrenceIndex"];
    side?: FileNavigationTarget["side"];
  };
  behavior?: FileNavigationTarget["behavior"];
  onTargetScroll?: (id: LaneId) => void;
  sourceId: LaneId;
  targets: PaneScrollTarget[];
}) {
  for (const target of targets) {
    if (target.id === sourceId) continue;
    const targetId = getPaneViewTargetId(
      target.paneView,
      activeFile.name,
      activeFile.occurrenceIndex,
    );
    if (!target.instance || !targetId) continue;
    onTargetScroll?.(target.id);
    scrollPaneTarget(target.instance, {
      behavior,
      id: targetId,
      lineNumber: activeFile.lineNumber,
      offset: activeFile.intraOffset,
      side: activeFile.side,
    });
  }
}

export function scrollPaneToFile(
  targets: PaneScrollTarget[],
  name: string,
  behavior: FileNavigationTarget["behavior"] = "instant",
  laneIds?: FileNavigationTarget["laneIds"],
  lineNumber?: FileNavigationTarget["lineNumber"],
  occurrenceIndex?: FileNavigationTarget["occurrenceIndex"],
  side?: FileNavigationTarget["side"],
) {
  const laneFilter = laneIds ? new Set(laneIds) : null;
  const visibleTargets = laneFilter
    ? targets.filter((target) => laneFilter.has(target.id))
    : targets;
  const primary = visibleTargets.find(
    (target) => target.instance && getPaneViewTargetId(target.paneView, name, occurrenceIndex),
  );
  const targetId = primary
    ? getPaneViewTargetId(primary.paneView, name, occurrenceIndex)
    : undefined;
  if (!primary?.instance || !targetId) return false;

  scrollPaneTarget(primary.instance, {
    behavior,
    id: targetId,
    lineNumber,
    offset: 0,
    side,
  });

  scrollMatchingPaneTargets({
    activeFile: { name, intraOffset: 0, lineNumber, occurrenceIndex, side },
    behavior,
    sourceId: primary.id,
    targets: visibleTargets,
  });
  return true;
}

function getPaneViewTargetId(
  paneView: PaneView,
  name: string,
  occurrenceIndex: FileNavigationTarget["occurrenceIndex"],
) {
  if (!occurrenceIndex || occurrenceIndex <= 1) return paneView.idByName.get(name);

  for (const item of paneView.items) {
    if (item.fileDiff.name !== name) continue;
    const occurrence = paneView.occurrenceById.get(item.id);
    if (occurrence?.index === occurrenceIndex) return item.id;
  }

  return undefined;
}

function scrollPaneTarget(
  instance: PaneScrollInstance,
  {
    behavior,
    id,
    lineNumber,
    offset,
    side,
  }: {
    behavior: FileNavigationTarget["behavior"];
    id: string;
    lineNumber?: FileNavigationTarget["lineNumber"];
    offset: number;
    side?: FileNavigationTarget["side"];
  },
) {
  if (lineNumber) {
    instance.scrollTo({
      type: "line",
      id,
      lineNumber,
      side,
      align: "center",
      behavior,
    });
    return;
  }

  instance.scrollTo({
    type: "item",
    id,
    align: "start",
    offset,
    behavior,
  });
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
