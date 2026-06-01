import { FileDiff } from "@pierre/diffs/react"

import { cn } from "@/lib/utils"

import { diffTotalsFor } from "./diff-totals"
import { DiffFileHeader } from "./diff-file-header"
import { ROW_DIFF_METRICS } from "./diff-render-metrics"
import { fileDiffOptions } from "./diff-render-options"
import { diffStyleVariables } from "./diff-styles"
import type { DiffRenderSettings, LaneId, PaneView } from "./types"

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
          key={getRowFileDiffKey(paneId, fileDiff.name, index)}
          fileDiff={fileDiff}
          isLast={index === view.files.length - 1}
          paneId={paneId}
          settings={settings}
        />
      ))}
    </div>
  )
}

function getRowFileDiffKey(
  paneId: LaneId,
  fileName: string,
  index: number
) {
  return `${paneId}-${index}-${fileName}`
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
        metrics={ROW_DIFF_METRICS}
        options={fileDiffOptions(settings)}
        renderCustomHeader={() => null}
        className={cn(
          "block bg-card",
          isLast && "overflow-hidden rounded-b-xl"
        )}
        style={diffStyleVariables}
      />
    </div>
  )
}
