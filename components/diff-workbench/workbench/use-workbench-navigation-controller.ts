import { useColumnsNavigationEffect } from "../navigation/use-columns-navigation-effect";
import { usePaneScroll } from "../navigation/use-pane-scroll";
import { useWorkbenchNavigation } from "../navigation/use-workbench-navigation";
import type { DisplayedPaneView } from "../rendering/pane-view-model";
import type { FileRow, LaneId, Layout, PaneView } from "../shared/types";
import type { WorkbenchSetters } from "./workbench-state-model";

type WorkbenchNavigationControllerOptions = {
  activeFile: string | null;
  clearFocusedFile: () => void;
  displayedPaneViews: DisplayedPaneView[];
  fileRows: FileRow[];
  focusedFile: string | null;
  indexActiveFile: string | null;
  layout: Layout;
  paneViews: Map<LaneId, PaneView>;
  setters: Pick<WorkbenchSetters, "setActiveFile" | "setFocusFile" | "setLayout">;
};

export function useWorkbenchNavigationController({
  activeFile,
  clearFocusedFile,
  displayedPaneViews,
  fileRows,
  focusedFile,
  indexActiveFile,
  layout,
  paneViews,
  setters,
}: WorkbenchNavigationControllerOptions) {
  const navigation = useWorkbenchNavigation({
    activeFile,
    clearFocusedFile,
    displayedPaneViews,
    fileRows,
    focusedFile,
    indexActiveFile,
    layout,
    setters,
  });

  const paneScroll = usePaneScroll({
    displayedPaneViews,
    paneViews,
    onActiveFileChange: navigation.handleActiveFileChange,
  });

  useColumnsNavigationEffect({
    layout,
    navigationTarget: navigation.navigationTarget,
    scrollToFile: paneScroll.scrollToFile,
  });

  return {
    ...navigation,
    ...paneScroll,
  };
}
