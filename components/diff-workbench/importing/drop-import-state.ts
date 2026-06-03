type DragFileSource = {
  dataTransfer?: {
    types?: Iterable<string> | null;
  } | null;
};

type LaneTarget = {
  closest?: (selector: string) => {
    dataset?: {
      lane?: string;
    };
  } | null;
};

type LaneIdTarget = string | undefined;

type DragTargetSource = {
  target: unknown;
};

type DragDepthAction = "drop" | "enter" | "leave";

export function hasDraggedFiles(event: DragFileSource) {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

function enterDragDepth(depth: number) {
  return depth + 1;
}

function leaveDragDepth(depth: number) {
  return Math.max(0, depth - 1);
}

export function getDragDepthState(depth: number, action: DragDepthAction) {
  const nextDepth =
    action === "enter" ? enterDragDepth(depth) : action === "leave" ? leaveDragDepth(depth) : 0;

  return {
    dragging: nextDepth > 0,
    depth: nextDepth,
  };
}

export function laneTargetFromElement(target: LaneTarget | null | undefined): LaneIdTarget {
  const lane = target?.closest?.("[data-lane]")?.dataset?.lane?.trim();
  return lane || undefined;
}

export function laneTargetFromDragEvent(event: DragTargetSource): LaneIdTarget {
  const target = event.target;
  if (typeof HTMLElement === "undefined") return undefined;
  if (!(target instanceof HTMLElement)) return undefined;
  return laneTargetFromElement(target);
}
