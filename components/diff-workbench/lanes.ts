import type { LaneId } from "./types";

export type LaneStyle = {
  text: string;
  dot: string;
  bar: string;
  soft: string;
  border: string;
};

export const MAX_LANES = 5;
export const LANE_ORDER: LaneId[] = ["a", "b", "c", "d", "e"];

const LANE_STYLES: LaneStyle[] = [
  {
    text: "text-lane-a",
    dot: "bg-lane-a",
    bar: "bg-lane-a",
    soft: "bg-lane-a/10",
    border: "border-lane-a/40",
  },
  {
    text: "text-lane-b",
    dot: "bg-lane-b",
    bar: "bg-lane-b",
    soft: "bg-lane-b/10",
    border: "border-lane-b/40",
  },
  {
    text: "text-lane-c",
    dot: "bg-lane-c",
    bar: "bg-lane-c",
    soft: "bg-lane-c/10",
    border: "border-lane-c/40",
  },
  {
    text: "text-lane-d",
    dot: "bg-lane-d",
    bar: "bg-lane-d",
    soft: "bg-lane-d/10",
    border: "border-lane-d/40",
  },
  {
    text: "text-lane-e",
    dot: "bg-lane-e",
    bar: "bg-lane-e",
    soft: "bg-lane-e/10",
    border: "border-lane-e/40",
  },
];

export function laneIndex(id: LaneId) {
  const index = LANE_ORDER.indexOf(id);
  return index >= 0 ? index : 0;
}

export function laneIdAt(index: number) {
  return LANE_ORDER[index] ?? LANE_ORDER[0];
}

export function laneLabel(id: LaneId) {
  return id.toUpperCase();
}

export function laneTitle(id: LaneId) {
  return `Diff ${laneLabel(id)}`;
}

export function laneRangeLabel() {
  return `${laneLabel(LANE_ORDER[0])}-${laneLabel(LANE_ORDER[MAX_LANES - 1])}`;
}

export function laneStyle(id: LaneId) {
  return LANE_STYLES[laneIndex(id) % LANE_STYLES.length];
}
