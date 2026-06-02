import { cn } from "@/lib/utils";

import { copyTextWithToast } from "./clipboard";
import { FileTypeIcon } from "./file-icons";
import { DiffStatText } from "./diff-stat-text";
import { LaneBadge } from "./lane-badge";
import { laneStyle } from "./lanes";
import type { FileOccurrence, LaneId } from "./types";

export function DiffFileHeader({
  additions,
  deletions,
  fileName,
  occurrence,
  paneId,
  sticky = false,
  stickyOffsetClassName = "top-0",
}: {
  additions: number;
  deletions: number;
  fileName: string;
  occurrence?: FileOccurrence;
  paneId?: LaneId;
  sticky?: boolean;
  stickyOffsetClassName?: string;
}) {
  const style = paneId ? laneStyle(paneId) : null;
  const copyLabel = getFilePathCopyLabel(fileName);

  return (
    <button
      type="button"
      data-diff-file-header
      aria-label={copyLabel}
      title={copyLabel}
      onClick={() => copyFilePath(fileName)}
      className={cn(
        "group relative flex w-full cursor-pointer items-center gap-2 overflow-hidden text-foreground shadow-[0_1px_0_rgb(255_255_255/0.03)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
        "h-10 border-y border-border/55 bg-card/95 px-3 hover:bg-muted/45",
        sticky && "border-t-0",
        paneId && "pl-4",
        sticky && cn("sticky z-20 backdrop-blur-md", stickyOffsetClassName),
      )}
    >
      {style ? (
        <span className={cn("absolute top-0 bottom-0 left-0 w-1", style.bar)} aria-hidden />
      ) : null}
      {paneId ? <LaneBadge id={paneId} size="md" tone="soft" /> : null}
      <FileTypeIcon path={fileName} />
      <span className="min-w-0 flex-1 truncate text-left font-mono text-[11px] text-muted-foreground underline-offset-4 group-hover:text-foreground group-hover:underline group-hover:decoration-dashed">
        {fileName}
      </span>
      {occurrence ? (
        <span
          className={cn(
            "shrink-0 rounded border border-border/70 bg-background/70 font-mono leading-none text-muted-foreground",
            "px-1.5 py-1 text-[10px]",
          )}
          title={`${occurrenceLabel(occurrence)} for ${fileName}`}
        >
          {occurrence.index}/{occurrence.total}
        </span>
      ) : null}
      <DiffStatText additions={additions} deletions={deletions} className="text-[10px]" />
    </button>
  );
}

function occurrenceLabel(occurrence: FileOccurrence) {
  return `Patch ${occurrence.index} of ${occurrence.total}`;
}

function copyFilePath(path: string) {
  void copyTextWithToast({
    description: path,
    text: path,
    title: "Copied file path",
  });
}

function getFilePathCopyLabel(path: string) {
  return `Copy ${path}`;
}
