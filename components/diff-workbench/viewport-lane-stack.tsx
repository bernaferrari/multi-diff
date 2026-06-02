"use client";

import type { CodeViewHandle } from "@pierre/diffs/react";

import type { ImportFileSource } from "./import-staging-state";
import { Lane } from "./lane";
import type { DisplayedPaneView } from "./pane-view-model";
import { getViewportLaneMoveState } from "./viewport-layout-state";
import type { DiffRenderSettings, LaneId, Layout } from "./types";

export type ViewportLaneStackActions = {
  onClearLaneDiff: (paneId: LaneId) => void;
  onHideLane: (paneId: LaneId) => void;
  onImportFiles: (files: ImportFileSource, paneId?: LaneId) => void;
  onMoveLane: (sourcePaneId: LaneId, targetPaneId: LaneId) => void;
  onPaneScroll: (paneId: LaneId) => void;
  onPaneScrollIntent: (paneId: LaneId) => void;
  onViewerRef: (paneId: LaneId, handle: CodeViewHandle<undefined> | null) => void;
};

export function ViewportLaneStack({
  actions,
  displayedPaneViews,
  layout,
  renderSettings,
}: {
  actions: ViewportLaneStackActions;
  displayedPaneViews: DisplayedPaneView[];
  layout: Layout;
  renderSettings: DiffRenderSettings;
}) {
  const displayedPaneIds = displayedPaneViews.map(({ pane }) => pane.id);

  return displayedPaneViews.map(({ pane, paneView }, paneIndex) => {
    const { leftPaneId, rightPaneId } = getViewportLaneMoveState(displayedPaneIds, paneIndex);

    return (
      <Lane
        key={pane.id}
        view={{
          layout,
          pane,
          paneView,
          renderSettings,
        }}
        actions={{
          canMoveLeft: Boolean(leftPaneId),
          canMoveRight: Boolean(rightPaneId),
          refCallback: (handle) => actions.onViewerRef(pane.id, handle),
          onClear: () => actions.onClearLaneDiff(pane.id),
          onHide: () => actions.onHideLane(pane.id),
          onImport: (files) => actions.onImportFiles(files, pane.id),
          onMoveLeft: () => {
            if (leftPaneId) actions.onMoveLane(pane.id, leftPaneId);
          },
          onMoveRight: () => {
            if (rightPaneId) actions.onMoveLane(pane.id, rightPaneId);
          },
          onScroll: () => actions.onPaneScroll(pane.id),
          onScrollIntent: () => actions.onPaneScrollIntent(pane.id),
        }}
      />
    );
  });
}
