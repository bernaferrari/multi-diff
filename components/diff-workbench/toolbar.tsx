"use client"

import { PanelLeft } from "lucide-react"

import { cn } from "@/lib/utils"

import { DisplayPopover } from "./display-popover"
import { ImportDialog } from "./import-dialog"
import { ThemeToggle } from "./theme-toggle"
import { DiffStyleControl, LayoutModeControl } from "./toolbar-mode-controls"
import { ToolbarIconButton } from "./toolbar-controls"
import type { ImportFileSource, StagedImportFile } from "./import-staging-state"
import type { DiffStyle, LaneMarkerStyle, Layout, Pane } from "./types"

export type ToolbarSettings = {
  sidebarOpen: boolean
  layout: Layout
  diffStyle: DiffStyle
  laneMarkerStyle: LaneMarkerStyle
  wrap: boolean
  lineNumbers: boolean
  panes: Pane[]
}

export type ToolbarActions = {
  setSidebarOpen: (v: boolean) => void
  setLayout: (l: Layout) => void
  setDiffStyle: (s: DiffStyle) => void
  setLaneMarkerStyle: (s: LaneMarkerStyle) => void
  setWrap: (v: boolean) => void
  setLineNumbers: (v: boolean) => void
  onImportFiles: (
    files: ImportFileSource | StagedImportFile[]
  ) => void | Promise<void>
  onClearAll: () => void
  onLoadSamples: () => void
}

export function Toolbar({
  actions,
  settings,
}: {
  actions: ToolbarActions
  settings: ToolbarSettings
}) {
  return (
    <header className="z-20 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/70 bg-card/80 px-3 py-2 backdrop-blur">
      <div className="flex items-center gap-2">
        <ToolbarIconButton
          variant="ghost"
          onClick={() => actions.setSidebarOpen(!settings.sidebarOpen)}
          aria-pressed={settings.sidebarOpen}
          aria-label={
            settings.sidebarOpen ? "Hide files panel" : "Show files panel"
          }
          className={cn(
            "-ml-1 rounded-md",
            settings.sidebarOpen
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <PanelLeft className="size-4" />
        </ToolbarIconButton>
        <span className="text-sm font-semibold tracking-tight">
          Multi Diff
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
          settings={{
            lineNumbers: settings.lineNumbers,
            laneMarkerStyle: settings.laneMarkerStyle,
            layout: settings.layout,
            wrap: settings.wrap,
          }}
          actions={{
            lineNumbers: actions.setLineNumbers,
            setLaneMarkerStyle: actions.setLaneMarkerStyle,
            wrap: actions.setWrap,
          }}
        />

        <div className="mx-0.5 h-6 w-px bg-border" />

        <ImportDialog
          onImportFiles={actions.onImportFiles}
          onClearAll={actions.onClearAll}
          onLoadSamples={actions.onLoadSamples}
          panes={settings.panes}
        />
        <ThemeToggle />
      </div>
    </header>
  )
}
