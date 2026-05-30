import { CodeView, type CodeViewHandle, FileDiff } from "@pierre/diffs/react"
import { type Ref } from "react"

import { cn } from "@/lib/utils"

import { diffTotalsFor } from "./diff-data"
import { DiffFileHeader } from "./diff-file-header"
import { codeViewOptions, fileDiffOptions } from "./diff-render-options"
import { diffStyleVariables } from "./diff-styles"
import type { DiffRenderSettings, LaneId, PaneView } from "./types"

const rowDiffMetrics = {
  diffHeaderHeight: 0,
  hunkLineCount: 50,
  hunkSeparatorHeight: 4,
  lineHeight: 20,
  paddingBottom: 0,
  paddingTop: 0,
  spacing: 0,
}

export function RowDiffList({
  paneId,
  settings,
  view,
}: {
  paneId: LaneId
  settings: DiffRenderSettings
  view: PaneView
}) {
  return (
    <div className="min-w-0 bg-card">
      {view.files.map((fileDiff, index) => (
        <RowFileDiff
          key={fileDiff.name}
          fileDiff={fileDiff}
          isLast={index === view.files.length - 1}
          paneId={paneId}
          settings={settings}
        />
      ))}
    </div>
  )
}

function RowFileDiff({
  fileDiff,
  isLast,
  paneId,
  settings,
}: {
  fileDiff: PaneView["files"][number]
  isLast: boolean
  paneId: LaneId
  settings: DiffRenderSettings
}) {
  const totals = diffTotalsFor(fileDiff)

  return (
    <div data-row-file-name={fileDiff.name} data-row-lane-id={paneId}>
      <DiffFileHeader
        additions={totals.additions}
        deletions={totals.deletions}
        fileName={fileDiff.name}
        paneId={paneId}
        compact
        sticky
      />
      <FileDiff
        fileDiff={fileDiff}
        metrics={rowDiffMetrics}
        options={fileDiffOptions(settings)}
        renderCustomHeader={() => null}
        className={cn("block bg-card", isLast && "overflow-hidden rounded-b-xl")}
        style={diffStyleVariables}
      />
    </div>
  )
}

export function ColumnCodeView({
  containerRef,
  refCallback,
  settings,
  view,
  onScroll,
}: {
  containerRef: Ref<HTMLDivElement>
  refCallback: (handle: CodeViewHandle<undefined> | null) => void
  settings: DiffRenderSettings
  view: PaneView
  onScroll: () => void
}) {
  return (
    <CodeView
      containerRef={containerRef}
      ref={refCallback}
      items={view.items}
      onScroll={onScroll}
      options={codeViewOptions(settings)}
      renderCustomHeader={(item) => {
        if (item.type !== "diff") return null
        const totals = diffTotalsFor(item.fileDiff)
        return (
          <DiffFileHeader
            additions={totals.additions}
            deletions={totals.deletions}
            fileName={item.fileDiff.name}
          />
        )
      }}
      className={cn(
        "scroll-thin min-h-0 overflow-auto bg-card",
        "h-full w-full flex-1"
      )}
      style={diffStyleVariables}
    />
  )
}
