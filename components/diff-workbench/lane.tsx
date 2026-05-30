"use client"

import { type CodeViewHandle } from "@pierre/diffs/react"
import { type WheelEvent, useRef } from "react"

import { LaneDropzone } from "./lane-dropzone"
import { LaneHeader } from "./lane-header"
import { getLaneLayoutState } from "./lane-layout"
import { ColumnCodeView, RowDiffList } from "./lane-content"
import { laneStyle } from "./lanes"
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
  onImport: (files: FileList | null) => void
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
    hasError: Boolean(view.pane.error),
    isEmpty,
    layout: view.layout,
    view: view.paneView,
  })

  function handleColumnWheel(event: WheelEvent<HTMLDivElement>) {
    if (view.layout !== "columns") return
    actions.onScrollIntent()
  }

  return (
    <section
      data-lane={view.pane.id}
      className={layoutState.sectionClass}
      style={layoutState.sectionStyle}
    >
      <LaneHeader
        importInputRef={importInputRef}
        isEmpty={isEmpty}
        pane={view.pane}
        style={style}
        view={view.paneView}
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
          <div className="p-4 text-sm text-destructive">{view.pane.error}</div>
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
