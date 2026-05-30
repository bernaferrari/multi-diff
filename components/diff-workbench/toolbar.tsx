"use client"

import { PanelLeft } from "lucide-react"

import { DisplayPopover } from "./display-popover"
import { ImportDialog } from "./import-dialog"
import { ThemeToggle } from "./theme-toggle"
import { DiffStyleControl, LayoutModeControl } from "./toolbar-mode-controls"
import { ToolbarIconButton } from "./toolbar-controls"
import {
  getDisplayPopoverState,
  getSidebarToggleState,
} from "./toolbar-state"
import type { DiffStyle, LaneMarkerStyle, Layout } from "./types"

export type ToolbarSettings = {
  sidebarOpen: boolean
  layout: Layout
  diffStyle: DiffStyle
  laneMarkerStyle: LaneMarkerStyle
  wrap: boolean
  lineNumbers: boolean
}

export type ToolbarActions = {
  setSidebarOpen: (v: boolean) => void
  setLayout: (l: Layout) => void
  setDiffStyle: (s: DiffStyle) => void
  setLaneMarkerStyle: (s: LaneMarkerStyle) => void
  setWrap: (v: boolean) => void
  setLineNumbers: (v: boolean) => void
  onImportFiles: (files: FileList | null) => void | Promise<void>
  onReset: () => void
}

export function Toolbar({
  actions,
  settings,
}: {
  actions: ToolbarActions
  settings: ToolbarSettings
}) {
  const sidebarToggle = getSidebarToggleState(settings.sidebarOpen)
  const displayPopover = getDisplayPopoverState({ actions, settings })

  return (
    <header className="z-20 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/70 bg-card/80 px-3 py-2 backdrop-blur">
      <div className="flex items-center gap-2">
        <ToolbarIconButton
          onClick={() => actions.setSidebarOpen(!settings.sidebarOpen)}
          aria-pressed={sidebarToggle.pressed}
          aria-label={sidebarToggle.ariaLabel}
          className={sidebarToggle.className}
        >
          <PanelLeft className="size-4" />
        </ToolbarIconButton>
        <span className="text-sm font-semibold tracking-tight">
          Diff Workbench
        </span>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        <LayoutModeControl
          layout={settings.layout}
          onLayout={actions.setLayout}
        />
        <DiffStyleControl
          diffStyle={settings.diffStyle}
          onDiffStyle={actions.setDiffStyle}
        />

        <DisplayPopover
          settings={displayPopover.settings}
          actions={displayPopover.actions}
        />

        <div className="mx-0.5 h-6 w-px bg-border" />

        <ImportDialog
          onImportFiles={actions.onImportFiles}
          onReset={actions.onReset}
        />
        <ThemeToggle />
      </div>
    </header>
  )
}
