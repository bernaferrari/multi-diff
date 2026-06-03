import { EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

import { getEqualColumnGridStyle } from "../workbench/grid-layout";
import { laneLabel, laneStyle } from "../lanes/lanes";
import type { LaneId, LanePane } from "../shared/types";

export function FilesLaneFilter({
  hidden,
  panes,
  onToggleLane,
}: {
  hidden: Set<LaneId>;
  panes: LanePane[];
  onToggleLane: (id: LaneId) => void;
}) {
  return (
    <div className="grid gap-1" style={getEqualColumnGridStyle(panes.length)}>
      {panes.map((pane) => (
        <FilesLaneFilterButton
          key={pane.id}
          hidden={hidden.has(pane.id)}
          pane={pane}
          onToggleLane={onToggleLane}
        />
      ))}
    </div>
  );
}

function FilesLaneFilterButton({
  hidden,
  pane,
  onToggleLane,
}: {
  hidden: boolean;
  pane: LanePane;
  onToggleLane: (id: LaneId) => void;
}) {
  const style = laneStyle(pane.id);
  const label = `${hidden ? "Show" : "Hide"} ${pane.label}`;

  return (
    <button
      type="button"
      onClick={() => onToggleLane(pane.id)}
      aria-label={label}
      aria-pressed={!hidden}
      title={label}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-md border py-1 text-xs font-medium transition-[background-color,border-color,color,opacity]",
        hidden
          ? "border-dashed border-border text-muted-foreground/50"
          : cn("border-transparent", style.soft, style.text),
      )}
    >
      <span>{laneLabel(pane.id)}</span>
      {hidden ? <EyeOff className="size-3" /> : null}
    </button>
  );
}
