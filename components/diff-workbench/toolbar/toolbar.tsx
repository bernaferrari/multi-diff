"use client";

import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ContentSearchPopover } from "../search/content-search-popover";
import type { ContentSearchActions, ContentSearchView } from "../search/content-search-popover";
import { DisplayPopover } from "./display-popover";
import { ImportDialog } from "../importing/import-dialog";
import { ThemeToggle } from "./theme-toggle";
import { DiffStyleControl, LayoutModeControl } from "./toolbar-mode-controls";
import { ToolbarIconButton, ToolbarTooltip } from "./toolbar-controls";
import type { ImportFileSource, StagedImportFile } from "../importing/import-staging-state";
import type { DiffStyle, LaneMarkerStyle, Layout, Pane } from "../shared/types";

export type ToolbarSettings = {
  sidebarOpen: boolean;
  layout: Layout;
  diffStyle: DiffStyle;
  laneMarkerStyle: LaneMarkerStyle;
  wrap: boolean;
  lineNumbers: boolean;
  panes: Pane[];
  search: ContentSearchView;
};

export type ToolbarActions = {
  setSidebarOpen: (v: boolean) => void;
  setLayout: (l: Layout) => void;
  setDiffStyle: (s: DiffStyle) => void;
  setLaneMarkerStyle: (s: LaneMarkerStyle) => void;
  setWrap: (v: boolean) => void;
  setLineNumbers: (v: boolean) => void;
  onImportFiles: (files: ImportFileSource | StagedImportFile[]) => void | Promise<void>;
  onLoadGuide: () => void;
  onLoadSamples: () => void;
  search: ContentSearchActions;
};

export function Toolbar({
  actions,
  settings,
}: {
  actions: ToolbarActions;
  settings: ToolbarSettings;
}) {
  return (
    <header className="z-20 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/70 bg-card/80 px-3 py-2 backdrop-blur">
      <div className="flex items-center gap-2">
        <ToolbarIconButton
          variant="ghost"
          onClick={() => actions.setSidebarOpen(!settings.sidebarOpen)}
          aria-pressed={settings.sidebarOpen}
          aria-label={settings.sidebarOpen ? "Hide files panel" : "Show files panel"}
          title={settings.sidebarOpen ? "Hide files panel" : "Show files panel"}
          className="-ml-1 rounded-md text-muted-foreground hover:text-foreground"
        >
          <PanelLeft className="size-4" />
        </ToolbarIconButton>
        <ContentSearchPopover actions={actions.search} view={settings.search} />
        <span className="text-sm font-semibold tracking-tight text-muted-foreground">
          Multi Diff
        </span>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        <LayoutModeControl layout={settings.layout} onLayout={actions.setLayout} />
        <DiffStyleControl diffStyle={settings.diffStyle} onDiffStyle={actions.setDiffStyle} />

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
          onLoadGuide={actions.onLoadGuide}
          onLoadSamples={actions.onLoadSamples}
          panes={settings.panes}
        />
        <ToolbarTooltip label="Open GitHub repository">
          <Button
            nativeButton={false}
            render={
              <a
                href="https://github.com/bernaferrari/multi-diff"
                target="_blank"
                rel="noreferrer"
              />
            }
            variant="outline"
            size="icon-xs"
            aria-label="Open GitHub repository"
            className="text-muted-foreground"
          >
            <GitHubMark className="size-3.5" />
          </Button>
        </ToolbarTooltip>
        <ThemeToggle />
      </div>
    </header>
  );
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.95c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.95.68 1.92v2.84c0 .27.18.59.69.49A10.11 10.11 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}
