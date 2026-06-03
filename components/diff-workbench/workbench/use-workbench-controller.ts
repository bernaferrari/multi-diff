import { useTheme } from "next-themes";

import { useDiffDropImport } from "../importing/use-diff-drop-import";
import { useContentSearch } from "../search/use-content-search";
import { useWorkbenchActions } from "./use-workbench-actions";
import { useWorkbenchControllerModels } from "./use-workbench-controller-models";
import { useWorkbenchKeyboard } from "../navigation/use-workbench-keyboard";
import { useWorkbenchNavigationController } from "./use-workbench-navigation-controller";
import { useWorkbenchState } from "./use-workbench-state";
import { useWorkbenchViewModel } from "./use-workbench-view-model";

export function useWorkbenchController() {
  const { resolvedTheme } = useTheme();

  const { state, setters } = useWorkbenchState();
  const codeTheme = resolvedTheme === "dark" ? "dark" : "light";

  const {
    allFileRows,
    displayedPaneViews,
    fileRows,
    focused,
    hasErrors,
    hiddenFileRows,
    indexActiveFile,
    paneViews,
    parsed,
    sharedCount,
    visiblePanes,
  } = useWorkbenchViewModel({
    activeFile: state.activeFile,
    focusFile: state.focusFile,
    hidden: state.hidden,
    hiddenFiles: state.hiddenFiles,
    panes: state.panes,
  });

  const actions = useWorkbenchActions({
    activeFile: state.activeFile,
    fileRows,
    focusFile: state.focusFile,
    panes: state.panes,
    setters,
  });

  const {
    activeFileByLane,
    clearFocusMode,
    focusMode,
    handleActiveFileChange,
    handleScroll,
    markScrollDriver,
    navigateLaneFile,
    navigateOrFocusFile,
    navigationTarget,
    setLayout,
    setViewerRef,
    toggleFocusMode,
  } = useWorkbenchNavigationController({
    activeFile: state.activeFile,
    clearFocusedFile: actions.clearFocusedFile,
    displayedPaneViews,
    fileRows,
    focusedFile: focused,
    indexActiveFile,
    layout: state.layout,
    paneViews,
    setters,
  });

  const contentSearch = useContentSearch({
    parsed,
    onNavigateResult: navigateLaneFile,
  });

  useWorkbenchKeyboard({
    focusFile: state.focusFile,
    onClearFocus: clearFocusMode,
    onMoveFocus: actions.focusFileByOffset,
    onSearchContent: contentSearch.openSearch,
    onToggleNotes: actions.toggleNotes,
  });

  useDiffDropImport({
    onDraggingChange: setters.setDragging,
  });

  const {
    filesPanelActions,
    filesPanelView,
    notes,
    toolbarActions,
    toolbarSettings,
    viewportActions,
    viewportView,
  } = useWorkbenchControllerModels({
    actions,
    activeFileByLane,
    allFileRows,
    clearFocusMode,
    codeTheme,
    displayedPaneViews,
    fileRows,
    focused,
    focusMode,
    handleActiveFileChange,
    handleScroll,
    hasErrors,
    hiddenFileRows,
    indexActiveFile,
    markScrollDriver,
    navigateOrFocusFile,
    navigationTarget,
    parsed,
    search: {
      ...contentSearch.view,
      ...contentSearch.actions,
    },
    searchTarget: contentSearch.target,
    sharedCount,
    setLayout,
    setters,
    setViewerRef,
    state,
    toggleFocusMode,
    visiblePanes,
  });

  return {
    dragging: state.dragging,
    filesPanel: {
      actions: filesPanelActions,
      view: filesPanelView,
    },
    notes: {
      ...notes,
    },
    onInputFiles: actions.importFiles,
    sidebarOpen: state.sidebarOpen,
    toolbar: {
      actions: toolbarActions,
      settings: toolbarSettings,
    },
    viewport: {
      actions: viewportActions,
      view: viewportView,
    },
  };
}
