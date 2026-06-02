import { Hash, WrapText } from "lucide-react";
import type { ReactNode } from "react";

import type { LaneMarkerStyle, Layout } from "./types";

type DisplayToggleKey = "wrap" | "lineNumbers";

export type DisplaySettings = Record<DisplayToggleKey, boolean> & {
  laneMarkerStyle: LaneMarkerStyle;
  layout: Layout;
};
export type DisplayActions = Record<DisplayToggleKey, (value: boolean) => void> & {
  setLaneMarkerStyle: (value: LaneMarkerStyle) => void;
};

type DisplayOption = {
  key: DisplayToggleKey;
  description: string;
  icon: ReactNode;
  label: string;
};

export const DISPLAY_OPTIONS = [
  {
    key: "wrap",
    description: "Keep long lines inside the panel.",
    icon: <WrapText className="size-4" />,
    label: "Wrap lines",
  },
  {
    key: "lineNumbers",
    description: "Show original and modified line positions.",
    icon: <Hash className="size-4" />,
    label: "Line numbers",
  },
] satisfies DisplayOption[];
