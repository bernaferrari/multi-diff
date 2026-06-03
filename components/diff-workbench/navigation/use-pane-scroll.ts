import { type CodeViewHandle } from "@pierre/diffs/react";
import { useCallback, useRef } from "react";

import {
  cancelProgrammaticScroll,
  claimScrollDriver,
  isProgrammaticScrollSuppressed,
  isScrollDriver,
  scrollPaneToFile,
  suppressProgrammaticScroll,
} from "./pane-scroll-state";
import type { DisplayedPaneView } from "../rendering/pane-view-model";
import { getActiveScrollFile } from "./scroll-spy-state";
import type { FileNavigationTarget, LaneId, PaneView } from "../shared/types";

type PaneScrollOptions = {
  displayedPaneViews: DisplayedPaneView[];
  paneViews: Map<LaneId, PaneView>;
  onActiveFileChange: (name: string, sourceId: LaneId) => void;
};

export function usePaneScroll({
  displayedPaneViews,
  paneViews,
  onActiveFileChange,
}: PaneScrollOptions) {
  const viewerRefs = useRef(new Map<LaneId, CodeViewHandle<undefined> | null>());
  const driver = useRef<Parameters<typeof isScrollDriver>[0]>(null);
  const suppressedUntil = useRef(new Map<LaneId, number>());
  const spyFile = useRef<string | null>(null);

  const setViewerRef = useCallback((id: LaneId, handle: CodeViewHandle<undefined> | null) => {
    viewerRefs.current.set(id, handle);
  }, []);

  const handleScroll = useCallback(
    (sourceId: LaneId) => {
      if (!isScrollDriver(driver.current, sourceId)) return;
      if (isProgrammaticScrollSuppressed(suppressedUntil.current, sourceId)) {
        return;
      }
      claimScrollDriver(driver, sourceId);

      const srcInst = viewerRefs.current.get(sourceId)?.getInstance();
      const srcView = paneViews.get(sourceId);
      if (!srcInst || !srcView || srcView.items.length === 0) return;

      const activeFile = getActiveScrollFile(srcView, srcInst);
      if (!activeFile) return;

      const activeFileChanged = activeFile.name !== spyFile.current;
      if (activeFileChanged) {
        spyFile.current = activeFile.name;
        onActiveFileChange(activeFile.name, sourceId);
      }

      if (!activeFileChanged) return;
    },
    [onActiveFileChange, paneViews],
  );

  const markScrollDriver = useCallback((id: LaneId) => {
    suppressedUntil.current.delete(id);
    cancelProgrammaticScroll(viewerRefs.current.get(id)?.getInstance());
    claimScrollDriver(driver, id);
  }, []);

  const scrollToFile = useCallback(
    (
      name: string,
      behavior?: FileNavigationTarget["behavior"],
      laneIds?: FileNavigationTarget["laneIds"],
      lineNumber?: FileNavigationTarget["lineNumber"],
      side?: FileNavigationTarget["side"],
    ) => {
      const laneFilter = laneIds ? new Set(laneIds) : null;
      const targets = displayedPaneViews
        .filter(({ pane }) => !laneFilter || laneFilter.has(pane.id))
        .map(({ pane, paneView }) => ({
          id: pane.id,
          instance: viewerRefs.current.get(pane.id)?.getInstance(),
          paneView,
        }));

      for (const target of targets) {
        if (target.instance && target.paneView.idByName.has(name)) {
          suppressProgrammaticScroll(suppressedUntil.current, target.id);
        }
      }

      return scrollPaneToFile(targets, name, behavior, laneIds, lineNumber, side);
    },
    [displayedPaneViews],
  );

  return { handleScroll, markScrollDriver, scrollToFile, setViewerRef };
}
