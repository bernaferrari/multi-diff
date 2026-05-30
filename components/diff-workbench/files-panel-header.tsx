import { ChevronLeft, Search } from "lucide-react"

import { Button } from "@/components/ui/button"

import { formatFileCount } from "./file-count-format"
import { FilesLaneFilter } from "./files-lane-filter"
import type { LaneId, LanePane } from "./types"

type FilesHeaderStatus =
  | { mode: "focused"; label: "All files" }
  | {
      count: number
      mode: "overview"
      title: string | undefined
    }

export function FilesPanelHeader({
  activeFile,
  focusFile,
  focusMode,
  hidden,
  panes,
  query,
  sharedCount,
  visibleCount,
  onOverview,
  onQuery,
  onToggleLane,
  onToggleFocusMode,
}: {
  activeFile: string | null
  focusFile: string | null
  focusMode: boolean
  hidden: Set<LaneId>
  panes: LanePane[]
  query: string
  sharedCount: number
  visibleCount: number
  onOverview: () => void
  onQuery: (q: string) => void
  onToggleLane: (id: LaneId) => void
  onToggleFocusMode: () => void
}) {
  const status = getFilesHeaderStatus({
    focusFile,
    sharedCount,
    visibleCount,
  })

  return (
    <>
      <div className="flex flex-col gap-2 border-b border-border/70 p-2.5">
        <FilesLaneFilter
          hidden={hidden}
          panes={panes}
          onToggleLane={onToggleLane}
        />

        <div className="flex items-center gap-1.5">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              aria-label="Filter files"
              placeholder="Filter files..."
              spellCheck={false}
              className="h-8 w-full rounded-md border border-border bg-background pr-2 pl-8 text-xs transition-colors outline-none focus:border-ring"
            />
          </div>
          <Button
            variant={focusMode ? "secondary" : "outline"}
            size="sm"
            aria-pressed={focusMode}
            aria-label={focusMode ? "Turn off file focus" : "Turn on file focus"}
            title={
              focusMode
                ? "Return to normal file navigation"
                : activeFile
                  ? `Focus ${activeFile}`
                  : "Click a file to focus it"
            }
            onClick={onToggleFocusMode}
            className="h-8 px-2 text-xs"
          >
            Focus
          </Button>
        </div>
      </div>

      <div className="flex h-7 items-center gap-2 px-3 pt-2 pb-1">
        {status.mode === "focused" ? (
          <button
            type="button"
            onClick={onOverview}
            className="-ml-0.5 flex h-4 items-center gap-0.5 rounded px-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground/70 uppercase transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-3" />
            {status.label}
          </button>
        ) : (
          <>
            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
              Files
            </span>
            <span
              title={status.title}
              className="grid h-4 min-w-4 place-items-center rounded-full bg-muted px-1 text-[10px] font-medium text-muted-foreground tabular-nums"
            >
              {status.count}
            </span>
          </>
        )}
      </div>
    </>
  )
}

function getFilesHeaderStatus({
  focusFile,
  sharedCount,
  visibleCount,
}: {
  focusFile: string | null
  sharedCount: number
  visibleCount: number
}): FilesHeaderStatus {
  if (focusFile) return { mode: "focused", label: "All files" }

  return {
    count: visibleCount,
    mode: "overview",
    title: getSharedCountTitle(sharedCount),
  }
}

function getSharedCountTitle(sharedCount: number) {
  if (sharedCount <= 0) return undefined
  return `${formatFileCount(sharedCount)} changed in every lane`
}
