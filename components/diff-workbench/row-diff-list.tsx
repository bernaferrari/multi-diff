import { FileDiff } from "@pierre/diffs/react";

import { cn } from "@/lib/utils";

import { diffTotalsFor } from "./diff-totals";
import { DiffFileHeader } from "./diff-file-header";
import { ROW_DIFF_METRICS } from "./diff-render-metrics";
import { fileDiffOptions } from "./diff-render-options";
import { diffStyleVariables } from "./diff-styles";
import { getSearchSelectedLineRange } from "./search-line-selection";
import type { DiffRenderSettings, LaneId, PaneView, SearchNavigationTarget } from "./types";

export function RowDiffList({
  paneId,
  searchTarget,
  settings,
  view,
}: {
  paneId: LaneId;
  searchTarget: SearchNavigationTarget | null;
  settings: DiffRenderSettings;
  view: PaneView;
}) {
  return (
    <div className="min-w-0 bg-card">
      {view.files.map((fileDiff, index) => (
        <RowFileDiff
          key={getRowFileDiffKey(paneId, fileDiff.name, index)}
          fileDiff={fileDiff}
          isLast={index === view.files.length - 1}
          occurrence={getRowFileOccurrence(view, index)}
          paneId={paneId}
          searchTarget={searchTarget}
          settings={settings}
        />
      ))}
    </div>
  );
}

function getRowFileDiffKey(paneId: LaneId, fileName: string, index: number) {
  return `${paneId}-${index}-${fileName}`;
}

function getRowFileOccurrence(view: PaneView, index: number) {
  const item = view.items[index];
  return item ? view.occurrenceById.get(item.id) : undefined;
}

function RowFileDiff({
  fileDiff,
  isLast,
  occurrence,
  paneId,
  searchTarget,
  settings,
}: {
  fileDiff: PaneView["files"][number];
  isLast: boolean;
  occurrence: ReturnType<typeof getRowFileOccurrence>;
  paneId: LaneId;
  searchTarget: SearchNavigationTarget | null;
  settings: DiffRenderSettings;
}) {
  const totals = diffTotalsFor(fileDiff);

  return (
    <div data-row-file-name={fileDiff.name} data-row-lane-id={paneId}>
      <DiffFileHeader
        additions={totals.additions}
        deletions={totals.deletions}
        fileName={fileDiff.name}
        occurrence={occurrence}
        paneId={paneId}
        sticky
        stickyOffsetClassName="-top-3"
      />
      <FileDiff
        fileDiff={fileDiff}
        selectedLines={getSearchSelectedLineRange(paneId, fileDiff.name, searchTarget)}
        metrics={ROW_DIFF_METRICS}
        options={fileDiffOptions(settings)}
        renderCustomHeader={() => null}
        className={cn("block bg-card", isLast && "overflow-hidden rounded-b-xl")}
        style={diffStyleVariables}
      />
    </div>
  );
}
