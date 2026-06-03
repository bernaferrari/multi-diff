"use client";

import { DiffPaneViewport } from "./diff-workbench/rendering/diff-pane-viewport";
import { DropOverlay } from "./diff-workbench/workbench/drop-overlay";
import { FilesPanel } from "./diff-workbench/file-tree/files-panel";
import { Notepad } from "./diff-workbench/workbench/notepad";
import { Toolbar } from "./diff-workbench/toolbar/toolbar";
import { useWorkbenchController } from "./diff-workbench/workbench/use-workbench-controller";
import { WorkbenchShell } from "./diff-workbench/workbench/workbench-shell";

export function DiffWorkbench() {
  const { dragging, filesPanel, notes, sidebarOpen, toolbar, viewport } = useWorkbenchController();

  return (
    <main className="bg-grid flex h-svh flex-col overflow-hidden bg-background text-foreground">
      <Toolbar settings={toolbar.settings} actions={toolbar.actions} />

      <WorkbenchShell
        onSidebarClose={() => toolbar.actions.setSidebarOpen(false)}
        sidebarOpen={sidebarOpen}
        sidebar={<FilesPanel view={filesPanel.view} actions={filesPanel.actions} />}
        viewport={<DiffPaneViewport view={viewport.view} actions={viewport.actions} />}
      />

      <Notepad {...notes} />

      {dragging ? <DropOverlay /> : null}
    </main>
  );
}
