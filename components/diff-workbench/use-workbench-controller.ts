import { useTheme } from "next-themes";
import { useCallback, useMemo, useState } from "react";

import { searchDiffContent } from "./content-search-state";
import type { ContentSearchResult } from "./content-search-state";
import { useColumnsNavigationEffect } from "./use-columns-navigation-effect";
import { useDiffDropImport } from "./use-diff-drop-import";
import { usePaneScroll } from "./use-pane-scroll";
import { useWorkbenchActions } from "./use-workbench-actions";
import { useWorkbenchControllerModels } from "./use-workbench-controller-models";
import { useWorkbenchKeyboard } from "./use-workbench-keyboard";
import { useWorkbenchNavigation } from "./use-workbench-navigation";
import { useWorkbenchState } from "./use-workbench-state";
import { useWorkbenchViewModel } from "./use-workbench-view-model";

export function useWorkbenchController() {
  const { resolvedTheme } = useTheme();

  const { state, setters } = useWorkbenchState();
  const codeTheme = resolvedTheme === "dark" ? "dark" : "light";
  const [contentSearchOpen, setContentSearchOpen] = useState(false);
  const [contentSearchQuery, setContentSearchQuery] = useState("");

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
    navigateOrFocusFile,
    navigationTarget,
    setLayout,
    toggleFocusMode,
  } = useWorkbenchNavigation({
    activeFile: state.activeFile,
    clearFocusedFile: actions.clearFocusedFile,
    displayedPaneViews,
    fileRows,
    focusedFile: focused,
    indexActiveFile,
    layout: state.layout,
    setters,
  });

  const { handleScroll, markScrollDriver, scrollToFile, setViewerRef } = usePaneScroll({
    displayedPaneViews,
    paneViews,
    onActiveFileChange: handleActiveFileChange,
  });

  useColumnsNavigationEffect({
    layout: state.layout,
    navigationTarget,
    scrollToFile,
  });

  const contentSearchResults = useMemo(
    () =>
      searchDiffContent({
        panes: parsed,
        query: contentSearchQuery,
      }),
    [contentSearchQuery, parsed],
  );

  const openContentSearch = useCallback(() => {
    setContentSearchOpen(true);
  }, []);

  const selectContentSearchResult = useCallback(
    (result: ContentSearchResult) => {
      navigateOrFocusFile(result.fileName);
    },
    [navigateOrFocusFile],
  );

  useWorkbenchKeyboard({
    focusFile: state.focusFile,
    onClearFocus: clearFocusMode,
    onMoveFocus: actions.focusFileByOffset,
    onSearchContent: openContentSearch,
    onToggleNotes: actions.toggleNotes,
  });

  useDiffDropImport({
    onDraggingChange: setters.setDragging,
    onImport: actions.importFiles,
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
      onOpenChange: setContentSearchOpen,
      onQueryChange: setContentSearchQuery,
      onSelectResult: selectContentSearchResult,
      open: contentSearchOpen,
      query: contentSearchQuery,
      results: contentSearchResults,
    },
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
