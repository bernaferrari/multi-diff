import { cn } from "@/lib/utils";

import { ImportStagedListToolbar } from "./import-staged-list-toolbar";
import { ImportStagedRow } from "./import-staged-row";
import { getImportPreviewRows } from "./import-state";
import type { StagedImportFile } from "./import-staging-state";
import type { LaneId, Pane } from "./types";

type ImportStagedListProps = {
  dragging: boolean;
  files: StagedImportFile[];
  onAdd: () => void;
  onLaneChange: (index: number, lane: LaneId) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
  onSort: () => void;
  panes: Pane[];
};

export function ImportStagedList({
  dragging,
  files,
  onAdd,
  onLaneChange,
  onMove,
  onRemove,
  onSort,
  panes,
}: ImportStagedListProps) {
  const previewRows = getImportPreviewRows({ files, panes });

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        dragging ? "border-primary bg-primary/10" : "border-border bg-muted/20",
      )}
    >
      <ImportStagedListToolbar count={files.length} onAdd={onAdd} onSort={onSort} />

      <ul className="space-y-0.5 px-1.5 pb-1.5">
        {files.map((item, index) => (
          <ImportStagedRow
            key={`${item.file.name}-${index}`}
            file={item}
            index={index}
            isLast={index === files.length - 1}
            lane={previewRows[index]?.lane ?? "a"}
            onLaneChange={onLaneChange}
            onMove={onMove}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </div>
  );
}
