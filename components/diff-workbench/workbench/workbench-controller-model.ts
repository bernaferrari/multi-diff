import type { DiffPaneViewportActions } from "../rendering/diff-pane-viewport";
import type { FilesPanelActions } from "../file-tree/files-panel-model";
import type { ToolbarActions, ToolbarSettings } from "../toolbar/toolbar";
import type { DisplayedPaneView } from "../rendering/pane-view-model";
import type {
  DiffRenderSettings,
  FileNavigationTarget,
  Layout,
  ParsedPane,
  SearchNavigationTarget,
} from "../shared/types";

export function getRenderSettings({
  codeTheme,
  diffStyle,
  lineNumbers,
  wrap,
}: DiffRenderSettings): DiffRenderSettings {
  return {
    codeTheme,
    diffStyle,
    lineNumbers,
    wrap,
  };
}

export function getToolbarSettings(settings: ToolbarSettings): ToolbarSettings {
  return settings;
}

export function getToolbarActions(actions: ToolbarActions): ToolbarActions {
  return actions;
}

export function getFilesPanelActions(actions: FilesPanelActions): FilesPanelActions {
  return actions;
}

export function getViewportView({
  displayedPaneViews,
  hasErrors,
  layout,
  navigationTarget,
  parseErrors,
  renderSettings,
  searchTarget,
  visiblePanes,
}: {
  displayedPaneViews: DisplayedPaneView[];
  hasErrors: boolean;
  layout: Layout;
  navigationTarget: FileNavigationTarget | null;
  parseErrors: { label: string; message: string }[];
  renderSettings: DiffRenderSettings;
  searchTarget: SearchNavigationTarget | null;
  visiblePanes: ParsedPane[];
}) {
  return {
    displayedPaneViews,
    hasErrors,
    layout,
    navigationTarget,
    parseErrors,
    renderSettings,
    searchTarget,
    visiblePanes,
  };
}

export function getViewportActions(actions: DiffPaneViewportActions): DiffPaneViewportActions {
  return actions;
}
