"use client"

import { type CodeViewHandle } from "@pierre/diffs/react"
import { type UIEvent, type WheelEvent, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

import { getEqualColumnGridStyle } from "./grid-layout"
import { Lane } from "./lane"
import { routeWheelToScroller } from "./scrolling"
import type { DisplayedPaneView } from "./view-model"
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
  renderSettings: DiffRenderSettings
  visiblePanes: ParsedPane[]
}

export type DiffPaneViewportActions = {
  onClearLaneDiff: (paneId: LaneId) => void
  onHideLane: (paneId: LaneId) => void
  onImportFiles: (files: FileList | null, paneId?: LaneId) => void
  onMoveLane: (sourcePaneId: LaneId, targetPaneId: LaneId) => void
  onPaneScroll: (paneId: LaneId) => void
  onPaneScrollIntent: (paneId: LaneId) => void
  onRowsActiveFileChange: (name: string, laneId: LaneId) => void
  onViewerRef: (
    paneId: LaneId,
    handle: CodeViewHandle<undefined> | null
  ) => void
}

export function DiffPaneViewport({ actions, view }: DiffPaneViewportProps) {
  const rowScrollerRef = useRef<HTMLElement>(null)
  const lastRowsActiveFile = useRef<string | null>(null)
  const appliedRowsNavigationToken = useRef<number | null>(null)
  const layoutState = getViewportLayoutState({
    displayedPaneCount: view.displayedPaneViews.length,
    layout: view.layout,
    visiblePanes: view.visiblePanes,
  })

  function handleRowsWheel(event: WheelEvent<HTMLElement>) {
    if (view.layout !== "rows") return
    routeWheelToScroller(event, event.currentTarget)
  }

  function handleRowsScroll(event: UIEvent<HTMLElement>) {
    if (view.layout !== "rows") return
    reportRowsActiveFile(event.currentTarget)
  }

  function reportRowsActiveFile(scroller: HTMLElement) {
    const activeFile = getActiveRowsFile(scroller)
    if (!activeFile || activeFile.name === lastRowsActiveFile.current) return

    lastRowsActiveFile.current = activeFile.name
    actions.onRowsActiveFileChange(activeFile.name, activeFile.laneId)
  }

  useEffect(() => {
    if (!view.navigationTarget) return
    if (appliedRowsNavigationToken.current === view.navigationTarget.token) return
    if (view.layout !== "rows") return
    const block = rowScrollerRef.current?.querySelector<HTMLElement>(
      `[data-row-file-name="${CSS.escape(view.navigationTarget.name)}"]`
    )
    block?.scrollIntoView({ block: "start", behavior: "auto" })
    appliedRowsNavigationToken.current = view.navigationTarget.token
  }, [view.layout, view.navigationTarget])

  useEffect(() => {
    if (view.layout !== "rows" || !rowScrollerRef.current) return
    if (
      view.navigationTarget &&
      appliedRowsNavigationToken.current !== view.navigationTarget.token
    ) {
      return
    }
    reportRowsActiveFile(rowScrollerRef.current)
  })

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {view.hasErrors ? (
        <div className="shrink-0 border-b border-destructive/30 bg-destructive/10 px-4 py-1.5 text-xs text-destructive">
          One or more inputs could not be parsed as a unified diff.
        </div>
      ) : null}

      <section
        ref={rowScrollerRef}
        className={layoutState.sectionClass}
        onScroll={handleRowsScroll}
        onWheelCapture={handleRowsWheel}
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
            {view.displayedPaneViews.map(({ pane, paneView }, paneIndex) => {
              const leftPane = view.displayedPaneViews[paneIndex - 1]?.pane
              const rightPane = view.displayedPaneViews[paneIndex + 1]?.pane

              return (
                <Lane
                  key={pane.id}
                  view={{
                    layout: view.layout,
                    pane,
                    paneView,
                    renderSettings: view.renderSettings,
                  }}
                  actions={{
                    canMoveLeft: Boolean(leftPane),
                    canMoveRight: Boolean(rightPane),
                    refCallback: (handle) =>
                      actions.onViewerRef(pane.id, handle),
                    onClear: () => actions.onClearLaneDiff(pane.id),
                    onHide: () => actions.onHideLane(pane.id),
                    onImport: (files) => actions.onImportFiles(files, pane.id),
                    onMoveLeft: () => {
                      if (leftPane) actions.onMoveLane(pane.id, leftPane.id)
                    },
                    onMoveRight: () => {
                      if (rightPane) actions.onMoveLane(pane.id, rightPane.id)
                    },
                    onScroll: () => actions.onPaneScroll(pane.id),
                    onScrollIntent: () => actions.onPaneScrollIntent(pane.id),
                  }}
                />
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function getActiveRowsFile(scroller: HTMLElement) {
  const blocks = Array.from(
    scroller.querySelectorAll<HTMLElement>("[data-row-file-name]")
  )
  if (blocks.length === 0) return null

  const scrollerRect = scroller.getBoundingClientRect()
  const activationLine =
    scrollerRect.top +
    Math.min(96, Math.max(32, scrollerRect.height * 0.18))
  let active: { laneId: LaneId; name: string } | null = null

  for (const block of blocks) {
    const blockRect = block.getBoundingClientRect()
    if (blockRect.top <= activationLine && blockRect.bottom > scrollerRect.top) {
      const name = block.dataset.rowFileName
      const laneId = block.dataset.rowLaneId
      if (name && laneId) active = { laneId, name }
    } else if (blockRect.top > activationLine) {
      break
    }
  }

  if (active) return active
  const firstName = blocks[0]?.dataset.rowFileName
  const firstLaneId = blocks[0]?.dataset.rowLaneId
  return firstName && firstLaneId ? { laneId: firstLaneId, name: firstName } : null
}

function getViewportSectionClass(layout: Layout) {
  return cn(
    "min-h-0 flex-1",
    layout === "columns"
      ? "h-full overflow-hidden p-3"
      : "scroll-thin overflow-y-auto px-3 pt-3 pb-0"
  )
}

function getPaneStackClass(layout: Layout) {
  return cn(
    layout === "columns" ? "grid h-full min-h-0 gap-3" : "flex flex-col gap-3"
  )
}

function getPaneStackStyle({
  count,
  layout,
}: {
  count: number
  layout: Layout
}) {
  return layout === "columns"
    ? getEqualColumnGridStyle(count)
    : undefined
}

function getEmptyViewportMessage(visiblePanes: ParsedPane[]) {
  return visiblePanes.length === 0
    ? "All lanes hidden — re-enable one from the chips above."
    : "No visible lane modifies this file."
}

export function getViewportLayoutState({
  displayedPaneCount,
  layout,
  visiblePanes,
}: {
  displayedPaneCount: number
  layout: Layout
  visiblePanes: ParsedPane[]
}) {
  return {
    emptyMessage: getEmptyViewportMessage(visiblePanes),
    paneStackClass: getPaneStackClass(layout),
    paneStackStyle: getPaneStackStyle({
      count: displayedPaneCount,
      layout,
    }),
    sectionClass: getViewportSectionClass(layout),
  }
}
