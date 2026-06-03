import { X } from "lucide-react";

import { cn } from "@/lib/utils";

import { ImportLaneSelect, ImportStagedMoveControls } from "./import-staged-controls";
import type { StagedImportFile } from "./import-staging-state";
import { laneStyle } from "../lanes/lanes";
import type { LaneId } from "../shared/types";

export function ImportStagedRow({
  file,
  index,
  isLast,
  lane,
  onLaneChange,
  onMove,
  onRemove,
}: {
  file: StagedImportFile;
  index: number;
  isLast: boolean;
  lane: LaneId;
  onLaneChange: (index: number, lane: LaneId) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
}) {
  const style = laneStyle(lane);
  const fileName = file.file.name;

  return (
    <li className="group flex min-w-0 items-center gap-2 rounded-lg bg-background/60 px-2 py-2 text-sm transition-colors hover:bg-background">
      <ImportStagedMoveControls fileName={fileName} index={index} isLast={isLast} onMove={onMove} />
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold",
          style.soft,
          style.text,
        )}
      >
        {lane.toUpperCase()}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{fileName}</span>
      <ImportLaneSelect
        fileName={fileName}
        lane={file.targetLane ?? lane}
        onChange={(nextLane) => onLaneChange(index, nextLane)}
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground/60 opacity-0 transition-[color,opacity] group-hover:opacity-100 hover:bg-muted hover:text-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`Remove ${fileName}`}
      >
        <X className="size-3.5" />
      </button>
    </li>
  );
}
