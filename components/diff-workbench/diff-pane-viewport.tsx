"use client"

import type { DisplayedPaneView } from "./pane-view-model"
import { useRowViewportScroll } from "./use-row-viewport-scroll"
import { getViewportLayoutState } from "./viewport-layout-state"
import {
  ViewportLaneStack,
  type ViewportLaneStackActions,
} from "./viewport-lane-stack"
import type {
  DiffRenderSettings,
  FileNavigationTarget,
  LaneId,
  Layout,
  ParsedPane,
} from "./types"

type DiffPaneViewportProps = {
  actions: DiffPaneViewportActions
  view: DiffPaneViewportView
}

export type DiffPaneViewportView = {
  displayedPaneViews: DisplayedPaneView[]
  hasErrors: boolean
  layout: Layout
  navigationTarget: FileNavigationTarget | null
  parseErrors: { label: string; message: string }[]
  renderSettings: DiffRenderSettings
  visiblePanes: ParsedPane[]
}

export type DiffPaneViewportActions = ViewportLaneStackActions & {
  onRowsActiveFileChange: (name: string, laneId: LaneId) => void
}

export function DiffPaneViewport({ actions, view }: DiffPaneViewportProps) {
  const layoutState = getViewportLayoutState({
    displayedPaneCount: view.displayedPaneViews.length,
    layout: view.layout,
    visiblePaneCount: view.visiblePanes.length,
  })
  const { onRowsScroll, onRowsWheel, rowScrollerRef } = useRowViewportScroll({
    layout: view.layout,
    navigationTarget: view.navigationTarget,
    onActiveFileChange: actions.onRowsActiveFileChange,
  })

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {view.hasErrors ? (
        <ParseErrorBanner errors={view.parseErrors} />
      ) : null}

      <section
        ref={rowScrollerRef}
        className={layoutState.sectionClass}
        onScroll={onRowsScroll}
        onWheelCapture={onRowsWheel}
      >
        {view.displayedPaneViews.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            {layoutState.emptyMessage}
          </div>
        ) : (
          <div
            className={layoutState.paneStackClass}
            style={layoutState.paneStackStyle}
          >
            <ViewportLaneStack
              actions={actions}
              displayedPaneViews={view.displayedPaneViews}
              layout={view.layout}
              renderSettings={view.renderSettings}
            />
          </div>
        )}
      </section>
    </div>
  )
}

function ParseErrorBanner({
  errors,
}: {
  errors: DiffPaneViewportView["parseErrors"]
}) {
  const count = errors.length
  const summary =
    count === 1
      ? `${errors[0]?.label ?? "One diff"} could not be parsed.`
      : `${count} diffs could not be parsed.`

  return (
    <div
      role="status"
      className="shrink-0 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive"
    >
      <div className="font-medium">{summary}</div>
      {errors.length ? (
        <div className="mt-0.5 truncate text-destructive/80">
          {errors
            .map((error) => `${error.label}: ${error.message}`)
            .join(" · ")}
        </div>
      ) : null}
    </div>
  )
}
