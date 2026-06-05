import { type UIEvent, type WheelEvent, useEffect, useRef } from "react";

import {
  getActiveRowsFile,
  getRowNavigationLineTop,
  getRowNavigationTop,
} from "./row-viewport-state";
import { routeWheelToScroller } from "./scrolling";
import type { FileNavigationTarget, LaneId, Layout, PaneView } from "../shared/types";
import { ADAPTIVE_FILE_NAVIGATION_BEHAVIOR } from "../shared/types";

type RowViewportScrollOptions = {
  displayedPaneViews: { pane: { id: LaneId }; paneView: PaneView }[];
  diffStyle: "split" | "unified";
  layout: Layout;
  navigationTarget: FileNavigationTarget | null;
  onActiveFileChange: (name: string, laneId: LaneId) => void;
};

export function useRowViewportScroll({
  displayedPaneViews,
  diffStyle,
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
      navigationTarget.behavior === "smooth" ||
      navigationTarget.behavior === ADAPTIVE_FILE_NAVIGATION_BEHAVIOR
        ? "smooth"
        : "auto";

    if (block && rowScrollerRef.current) {
      const line =
        navigationTarget.lineNumber != null
          ? block.querySelector<HTMLElement>(
              `[data-line="${CSS.escape(String(navigationTarget.lineNumber))}"]`,
            )
          : null;
      const computedLineTop =
        !line && navigationTarget.lineNumber != null
          ? getComputedRowLineTop({
              block,
              displayedPaneViews,
              diffStyle,
              navigationTarget,
            })
          : null;

      rowScrollerRef.current.scrollTo({
        top: computedLineTop ?? getRowNavigationTop(rowScrollerRef.current, line ?? block),
        behavior,
      });
    }
    appliedRowsNavigationToken.current = navigationTarget.token;
  }, [displayedPaneViews, diffStyle, layout, navigationTarget]);

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

function getComputedRowLineTop({
  block,
  displayedPaneViews,
  diffStyle,
  navigationTarget,
}: {
  block: HTMLElement;
  displayedPaneViews: RowViewportScrollOptions["displayedPaneViews"];
  diffStyle: RowViewportScrollOptions["diffStyle"];
  navigationTarget: FileNavigationTarget;
}) {
  if (navigationTarget.lineNumber == null) return null;

  const paneId = navigationTarget.laneIds?.length === 1 ? navigationTarget.laneIds[0] : null;
  if (!paneId) return null;

  const paneView = displayedPaneViews.find(({ pane }) => pane.id === paneId)?.paneView;
  const fileDiff = paneView?.files.find((file) => file.name === navigationTarget.name);
  if (!fileDiff) return null;

  const lineTop = getRowNavigationLineTop({
    diffStyle,
    fileDiff,
    lineNumber: navigationTarget.lineNumber,
    side: navigationTarget.side,
  });
  if (lineTop == null) return null;

  const blockTop = block.getBoundingClientRect().top;
  const scroller = block.closest<HTMLElement>("[data-row-viewport]");
  const scrollerTop = scroller?.getBoundingClientRect().top ?? 0;
  const scrollTop = scroller?.scrollTop ?? 0;
  const targetTop = blockTop - scrollerTop + scrollTop + lineTop;
  const maxScrollTop =
    typeof scroller?.scrollHeight === "number" && typeof scroller.clientHeight === "number"
      ? Math.max(scroller.scrollHeight - scroller.clientHeight, 0)
      : targetTop;

  return Math.max(0, Math.min(targetTop, maxScrollTop));
}
