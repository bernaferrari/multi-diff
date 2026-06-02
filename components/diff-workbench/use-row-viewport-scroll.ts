import { type UIEvent, type WheelEvent, useEffect, useRef } from "react";

import { getActiveRowsFile } from "./row-viewport-state";
import { routeWheelToScroller } from "./scrolling";
import type { FileNavigationTarget, LaneId, Layout } from "./types";

type RowViewportScrollOptions = {
  layout: Layout;
  navigationTarget: FileNavigationTarget | null;
  onActiveFileChange: (name: string, laneId: LaneId) => void;
};

export function useRowViewportScroll({
  layout,
  navigationTarget,
  onActiveFileChange,
}: RowViewportScrollOptions) {
  const rowScrollerRef = useRef<HTMLElement>(null);
  const lastRowsActiveFile = useRef<string | null>(null);
  const appliedRowsNavigationToken = useRef<number | null>(null);

  function reportRowsActiveFile(scroller: HTMLElement) {
    const activeFile = getActiveRowsFile(scroller);
    if (!activeFile || activeFile.name === lastRowsActiveFile.current) return;

    lastRowsActiveFile.current = activeFile.name;
    onActiveFileChange(activeFile.name, activeFile.laneId);
  }

  function handleRowsWheel(event: WheelEvent<HTMLElement>) {
    if (layout !== "rows") return;
    routeWheelToScroller(event, event.currentTarget);
  }

  function handleRowsScroll(event: UIEvent<HTMLElement>) {
    if (layout !== "rows") return;
    reportRowsActiveFile(event.currentTarget);
  }

  useEffect(() => {
    if (!navigationTarget) return;
    if (appliedRowsNavigationToken.current === navigationTarget.token) return;
    if (layout !== "rows") return;
    const block = rowScrollerRef.current?.querySelector<HTMLElement>(
      `[data-row-file-name="${CSS.escape(navigationTarget.name)}"]`,
    );
    block?.scrollIntoView({ block: "start", behavior: "auto" });
    appliedRowsNavigationToken.current = navigationTarget.token;
  }, [layout, navigationTarget]);

  useEffect(() => {
    if (layout !== "rows" || !rowScrollerRef.current) return;
    if (navigationTarget && appliedRowsNavigationToken.current !== navigationTarget.token) {
      return;
    }
    reportRowsActiveFile(rowScrollerRef.current);
  });

  return {
    onRowsScroll: handleRowsScroll,
    onRowsWheel: handleRowsWheel,
    rowScrollerRef,
  };
}
