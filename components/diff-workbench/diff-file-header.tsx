import { cn } from "@/lib/utils"

import {
  copyTextWithToast,
  getCopiedFilePathToast,
  getCopyLabel,
} from "./clipboard"
import { FileTypeIcon } from "./file-icons"
import { DiffStatText } from "./diff-stat-text"
import { LaneBadge } from "./lane-badge"
import { laneStyle } from "./lanes"
import type { LaneId } from "./types"

export function DiffFileHeader({
  additions,
  compact = false,
  deletions,
  fileName,
  paneId,
  sticky = false,
}: {
  additions: number
  compact?: boolean
  deletions: number
  fileName: string
  paneId?: LaneId
  sticky?: boolean
}) {
  const style = paneId ? laneStyle(paneId) : null
  const copyLabel = getCopyLabel(fileName)

  return (
    <button
      type="button"
      data-diff-file-header
      aria-label={copyLabel}
      title={copyLabel}
      onClick={() => copyFilePath(fileName)}
      className={cn(
        "group relative flex w-full cursor-pointer items-center gap-2 overflow-hidden text-foreground shadow-[0_1px_0_rgb(255_255_255/0.03)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
        compact
          ? "h-7 border-t border-border/45 bg-background/80 px-3 pl-4"
          : "h-10 border-y border-border/55 bg-card/95 px-3 hover:bg-muted/45",
        sticky &&
          cn(
            "sticky z-20 backdrop-blur-md",
            compact ? "-top-3" : "top-0"
          )
      )}
    >
      {style && compact ? (
        <span
          className={cn("absolute top-1.5 bottom-1.5 left-0 w-1", style.bar)}
          aria-hidden
        />
      ) : null}
      {paneId ? (
        <LaneBadge
          id={paneId}
          size={compact ? "sm" : "md"}
          tone="soft"
        />
      ) : null}
      <FileTypeIcon path={fileName} />
      <span className="min-w-0 flex-1 truncate text-left font-mono text-[11px] text-muted-foreground underline-offset-4 group-hover:text-foreground group-hover:underline group-hover:decoration-dashed">
        {fileName}
      </span>
      <DiffStatText
        additions={additions}
        deletions={deletions}
        className={compact ? "text-[9px]" : "text-[10px]"}
      />
    </button>
  )
}

function copyFilePath(path: string) {
  const toast = getCopiedFilePathToast(path)
  void copyTextWithToast({
    description: toast.description,
    text: path,
    title: toast.title,
  })
}
