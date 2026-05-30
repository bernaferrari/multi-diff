"use client"

import { DiffPaneViewport } from "./diff-workbench/diff-pane-viewport"
import { DropOverlay } from "./diff-workbench/drop-overlay"
import { FilesPanel } from "./diff-workbench/files-panel"
import { Notepad } from "./diff-workbench/notepad"
import { Toolbar } from "./diff-workbench/toolbar"
import { useWorkbenchController } from "./diff-workbench/use-workbench-controller"
import { WorkbenchShell } from "./diff-workbench/workbench-shell"

export function DiffWorkbench() {
  const {
    dragging,
    filesPanel,
    notes,
    sidebarOpen,
    toolbar,
    viewport,
  } = useWorkbenchController()

  return (
    <main className="bg-grid flex h-svh flex-col overflow-hidden bg-background text-foreground">
      <Toolbar settings={toolbar.settings} actions={toolbar.actions} />

      <WorkbenchShell
        sidebarOpen={sidebarOpen}
        sidebar={
          <FilesPanel view={filesPanel.view} actions={filesPanel.actions} />
        }
        viewport={
          <DiffPaneViewport view={viewport.view} actions={viewport.actions} />
        }
      />

      <Notepad {...notes} />

      {dragging ? <DropOverlay /> : null}
    </main>
  )
}
