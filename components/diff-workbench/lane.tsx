"use client"

import { type CodeViewHandle } from "@pierre/diffs/react"
import { useRef } from "react"

import { LaneDropzone } from "./lane-dropzone"
import { LaneHeader } from "./lane-header"
import { getLaneLayoutState } from "./lane-layout"
import { ColumnCodeView } from "./lane-content"
import type { ImportFileSource } from "./import-staging-state"
import { laneStyle } from "./lanes"
import { estimateCodeHeight } from "./lane-metrics"
import { RowDiffList } from "./row-diff-list"
import type { DiffRenderSettings, Layout, PaneView, ParsedPane } from "./types"

type LaneView = {
  pane: ParsedPane
  paneView: PaneView
  layout: Layout
  renderSettings: DiffRenderSettings
}

type LaneActions = {
  canMoveLeft: boolean
  canMoveRight: boolean
  refCallback: (handle: CodeViewHandle<undefined> | null) => void
  onScroll: () => void
  onHide: () => void
  onImport: (files: ImportFileSource) => void
  onClear: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
  onScrollIntent: () => void
}

type LaneProps = {
  actions: LaneActions
  view: LaneView
}

export function Lane({ actions, view }: LaneProps) {
  const style = laneStyle(view.pane.id)
  const isEmpty = !view.pane.text.trim()
  const importInputRef = useRef<HTMLInputElement>(null)
  const codeViewContainerRef = useRef<HTMLDivElement>(null)
  const layoutState = getLaneLayoutState({
    borderClass: style.border,
    codeHeight: estimateCodeHeight(view.paneView),
    hasError: Boolean(view.pane.error),
    isEmpty,
    layout: view.layout,
  })

  function handleColumnWheel() {
    if (view.layout !== "columns") return
    actions.onScrollIntent()
  }

  return (
    <section
      data-lane={view.pane.id}
      aria-label={view.pane.label}
      className={layoutState.sectionClass}
      style={layoutState.sectionStyle}
    >
      <LaneHeader
        importInputRef={importInputRef}
        isEmpty={isEmpty}
        pane={view.pane}
        style={style}
        canMoveLeft={actions.canMoveLeft}
        canMoveRight={actions.canMoveRight}
        onClear={actions.onClear}
        onHide={actions.onHide}
        onImport={actions.onImport}
        onMoveLeft={actions.onMoveLeft}
        onMoveRight={actions.onMoveRight}
      />

      <div
        className={layoutState.bodyClass}
        onWheelCapture={isEmpty ? undefined : handleColumnWheel}
      >
        {layoutState.contentKind === "error" ? (
          <div role="alert" className="p-4 text-sm text-destructive">
            {view.pane.error}
          </div>
        ) : layoutState.contentKind === "empty" ? (
          <LaneDropzone style={style} onImport={actions.onImport} />
        ) : layoutState.contentKind === "rows" ? (
          <RowDiffList
            paneId={view.pane.id}
            settings={view.renderSettings}
            view={view.paneView}
          />
        ) : (
          <ColumnCodeView
            containerRef={codeViewContainerRef}
            refCallback={actions.refCallback}
            onScroll={actions.onScroll}
            settings={view.renderSettings}
            view={view.paneView}
          />
        )}
      </div>
    </section>
  )
}
