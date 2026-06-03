import { type UIEvent, type WheelEvent, useEffect, useRef } from "react";

import { getActiveRowsFile, getRowNavigationTop } from "./row-viewport-state";
import { routeWheelToScroller } from "./scrolling";
import type { FileNavigationTarget, LaneId, Layout } from "../shared/types";

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
    const fileSelector = `[data-row-file-name="${CSS.escape(navigationTarget.name)}"]`;
    const laneSelector =
      navigationTarget.laneIds?.length === 1
        ? `[data-row-lane-id="${CSS.escape(navigationTarget.laneIds[0] ?? "")}"]`
        : "";
    const block = rowScrollerRef.current?.querySelector<HTMLElement>(
      `${fileSelector}${laneSelector}`,
    );
    const behavior =
      navigationTarget.behavior === "smooth" || navigationTarget.behavior === "smooth-auto"
        ? "smooth"
        : "auto";

    if (block && rowScrollerRef.current) {
      rowScrollerRef.current.scrollTo({
        top: getRowNavigationTop(rowScrollerRef.current, block),
        behavior,
      });
    }
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
