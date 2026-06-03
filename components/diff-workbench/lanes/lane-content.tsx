import { CodeView, type CodeViewHandle } from "@pierre/diffs/react";
import { type Ref } from "react";

import { cn } from "@/lib/utils";

import { diffTotalsFor } from "../rendering/diff-totals";
import { DiffFileHeader } from "../rendering/diff-file-header";
import { codeViewOptions } from "../rendering/diff-render-options";
import { diffStyleVariables } from "../rendering/diff-styles";
import type { DiffRenderSettings, PaneView, SearchNavigationTarget } from "../shared/types";

export function ColumnCodeView({
  containerRef,
  refCallback,
  searchTarget,
  settings,
  view,
  onScroll,
}: {
  containerRef: Ref<HTMLDivElement>;
  refCallback: (handle: CodeViewHandle<undefined> | null) => void;
  searchTarget: SearchNavigationTarget | null;
  settings: DiffRenderSettings;
  view: PaneView;
  onScroll: () => void;
}) {
  return (
    <CodeView
      containerRef={containerRef}
      ref={refCallback}
      items={view.items}
      onScroll={onScroll}
      options={codeViewOptions(settings, searchTarget, view.id)}
      renderCustomHeader={(item) => {
        if (item.type !== "diff") return null;
        const totals = diffTotalsFor(item.fileDiff);
        return (
          <DiffFileHeader
            additions={totals.additions}
            deletions={totals.deletions}
            fileName={item.fileDiff.name}
            occurrence={view.occurrenceById.get(item.id)}
          />
        );
      }}
      className={cn("scroll-thin min-h-0 overflow-auto bg-card", "h-full w-full flex-1")}
      style={diffStyleVariables}
    />
  );
}
