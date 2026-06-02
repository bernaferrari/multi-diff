import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { laneLabel, laneStyle } from "./lanes";
import type { LaneId, LaneMarkerStyle, Layout } from "./types";

type LaneMarkerStyleOption = {
  label: string;
  value: LaneMarkerStyle;
};

const LANE_MARKER_OPTIONS = [
  { label: "Letters", value: "letters" },
  { label: "Bars", value: "bars" },
] satisfies LaneMarkerStyleOption[];

const PREVIEW_LANES: LaneId[] = ["a", "b", "c"];

export function LaneMarkerStyleControl({
  layout,
  value,
  onValueChange,
}: {
  layout: Layout;
  value: LaneMarkerStyle;
  onValueChange: (value: LaneMarkerStyle) => void;
}) {
  return (
    <div className="grid gap-2 border-t border-border/70 pt-3">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <div className="text-xs font-medium">Sidebar markers</div>
          <div className="text-xs text-muted-foreground">
            Choose lane letters or compact color blocks.
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 dark:bg-muted/65">
        {LANE_MARKER_OPTIONS.map((option) => (
          <LaneMarkerButton
            key={option.value}
            active={value === option.value}
            layout={layout}
            option={option}
            onClick={() => onValueChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
}

function LaneMarkerButton({
  active,
  layout,
  option,
  onClick,
}: {
  active: boolean;
  layout: Layout;
  option: LaneMarkerStyleOption;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-9 justify-center gap-2 rounded-md border border-transparent px-2 text-xs",
        active
          ? "bg-background text-foreground shadow-sm hover:bg-background dark:bg-foreground/10 dark:hover:bg-foreground/12"
          : "text-muted-foreground hover:border-border/60 hover:bg-background/70 hover:text-foreground dark:hover:bg-foreground/8",
      )}
    >
      <LaneMarkerPreview layout={layout} markerStyle={option.value} />
      {option.label}
    </Button>
  );
}

function LaneMarkerPreview({
  layout,
  markerStyle,
}: {
  layout: Layout;
  markerStyle: LaneMarkerStyle;
}) {
  if (markerStyle === "bars") {
    return (
      <span
        className={cn("flex items-center gap-0.5", layout === "rows" && "flex-col gap-px")}
        aria-hidden
      >
        {PREVIEW_LANES.map((id) => (
          <span
            key={id}
            className={cn(
              "rounded-[2px]",
              layout === "rows" ? "h-1 w-3.5" : "h-3.5 w-1.5",
              laneStyle(id).bar,
            )}
          />
        ))}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-0.5 font-mono text-[10px]" aria-hidden>
      {PREVIEW_LANES.map((id) => (
        <span key={id} className={laneStyle(id).text}>
          {laneLabel(id)}
        </span>
      ))}
    </span>
  );
}
