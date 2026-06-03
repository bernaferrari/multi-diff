import { useCallback, useMemo } from "react";

import { getFilesPanelView } from "../file-tree/files-panel-view-state";
import type { ContentSearchActions, ContentSearchView } from "../search/content-search-popover";
import type { DiffPaneViewportActions } from "../rendering/diff-pane-viewport";
import {
  getFilesPanelActions,
  getRenderSettings,
  getToolbarActions,
  getToolbarSettings,
  getViewportActions,
  getViewportView,
} from "./workbench-controller-model";
import type { useWorkbenchActions } from "./use-workbench-actions";
import type { DisplayedPaneView } from "../rendering/pane-view-model";
import type {
  ActiveFileByLane,
  FileNavigationTarget,
  FileRow,
  LaneId,
  Layout,
  ParsedPane,
  SearchNavigationTarget,
} from "../shared/types";
import { ADAPTIVE_FILE_NAVIGATION_BEHAVIOR } from "../shared/types";
import type { WorkbenchSetters, WorkbenchState } from "./workbench-state-model";

type WorkbenchActionModel = ReturnType<typeof useWorkbenchActions>;

export function useWorkbenchControllerModels({
  actions,
  activeFileByLane,
  allFileRows,
  codeTheme,
  clearFocusMode,
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
  search,
  searchTarget,
  setLayout,
  setSidebarOpen,
  setters,
  setViewerRef,
  sharedCount,
  state,
  toolbarSidebarOpen,
  toggleFocusMode,
  visiblePanes,
}: {
  actions: WorkbenchActionModel;
  activeFileByLane: ActiveFileByLane;
  allFileRows: FileRow[];
  codeTheme: "dark" | "light";
  clearFocusMode: () => void;
  displayedPaneViews: DisplayedPaneView[];
  fileRows: FileRow[];
  focused: string | null;
  focusMode: boolean;
  handleActiveFileChange: (name: string, sourceId: LaneId) => void;
  handleScroll: (sourceId: LaneId) => void;
  hasErrors: boolean;
  hiddenFileRows: FileRow[];
  indexActiveFile: string | null;
  markScrollDriver: (id: LaneId) => void;
  navigateOrFocusFile: (
    name: string,
    options?: Pick<FileNavigationTarget, "behavior" | "lineNumber" | "side">,
  ) => void;
  navigationTarget: FileNavigationTarget | null;
  parsed: ParsedPane[];
  search: ContentSearchActions & ContentSearchView;
  searchTarget: SearchNavigationTarget | null;
  setLayout: (layout: Layout) => void;
  setSidebarOpen: (open: boolean) => void;
  setters: WorkbenchSetters;
  setViewerRef: DiffPaneViewportActions["onViewerRef"];
  sharedCount: number;
  state: WorkbenchState;
  toolbarSidebarOpen: boolean;
  toggleFocusMode: (preferredFile?: string | null) => void;
  visiblePanes: ParsedPane[];
}) {
  const renderSettings = useMemo(
    () =>
      getRenderSettings({
        codeTheme,
        diffStyle: state.diffStyle,
        lineNumbers: state.lineNumbers,
        wrap: state.wrap,
      }),
    [codeTheme, state.diffStyle, state.lineNumbers, state.wrap],
  );

  const toolbarSettings = useMemo(
    () =>
      getToolbarSettings({
        diffStyle: state.diffStyle,
        laneMarkerStyle: state.laneMarkerStyle,
        layout: state.layout,
        lineNumbers: state.lineNumbers,
        panes: state.panes,
        search: {
          activeTarget: searchTarget,
          lanes: search.lanes,
          open: search.open,
          query: search.query,
          results: search.results,
        },
        sidebarOpen: toolbarSidebarOpen,
        wrap: state.wrap,
      }),
    [
      state.diffStyle,
      state.laneMarkerStyle,
      state.layout,
      state.lineNumbers,
      state.panes,
      search.open,
      search.lanes,
      search.query,
      search.results,
      searchTarget,
      toolbarSidebarOpen,
      state.wrap,
    ],
  );

  const toolbarActions = useMemo(
    () =>
      getToolbarActions({
        onImportFiles: actions.importFiles,
        onLoadGuide: actions.loadGuideWorkbench,
        onLoadSamples: actions.loadSampleWorkbench,
        search: {
          onOpenChange: search.onOpenChange,
          onQueryChange: search.onQueryChange,
          onSelectResult: search.onSelectResult,
          onToggleLane: search.onToggleLane,
        },
        setDiffStyle: setters.setDiffStyle,
        setLaneMarkerStyle: setters.setLaneMarkerStyle,
        setLayout,
        setLineNumbers: setters.setLineNumbers,
        setSidebarOpen,
        setWrap: setters.setWrap,
      }),
    [
      actions.importFiles,
      actions.loadGuideWorkbench,
      actions.loadSampleWorkbench,
      search,
      setLayout,
      setters.setDiffStyle,
      setters.setLaneMarkerStyle,
      setters.setLineNumbers,
      setSidebarOpen,
      setters.setWrap,
    ],
  );

  const filesPanelView = getFilesPanelView({
    activeFileByLane,
    allFileRows,
    fileRows,
    focused,
    focusMode,
    hiddenFileRows,
    indexActiveFile,
    parsed,
    sharedCount,
    state,
  });

  const navigateFromFilesPanel = useCallback(
    (name: string) => navigateOrFocusFile(name, { behavior: ADAPTIVE_FILE_NAVIGATION_BEHAVIOR }),
    [navigateOrFocusFile],
  );

  const filesPanelActions = useMemo(
    () =>
      getFilesPanelActions({
        onFilterFile: actions.toggleFocusFile,
        onHideFiles: actions.hideFiles,
        onNavigate: navigateFromFilesPanel,
        onOverview: clearFocusMode,
        onQuery: setters.setFileQuery,
        onShowAllFiles: actions.showAllFiles,
        onShowFiles: actions.showFiles,
        onToggleFocusMode: toggleFocusMode,
        onToggleLane: actions.toggleLane,
      }),
    [
      actions.hideFiles,
      actions.showAllFiles,
      actions.showFiles,
      actions.toggleFocusFile,
      actions.toggleLane,
      clearFocusMode,
      navigateFromFilesPanel,
      setters.setFileQuery,
      toggleFocusMode,
    ],
  );

  const viewportView = useMemo(
    () =>
      getViewportView({
        displayedPaneViews,
        hasErrors,
        layout: state.layout,
        navigationTarget,
        parseErrors: parsed
          .filter((pane) => pane.error)
          .map((pane) => ({
            label: pane.label,
            message: pane.error ?? "",
          })),
        renderSettings,
        searchTarget,
        visiblePanes,
      }),
    [
      displayedPaneViews,
      hasErrors,
      navigationTarget,
      parsed,
      renderSettings,
      searchTarget,
      state.layout,
      visiblePanes,
    ],
  );

  const viewportActions = useMemo(
    () =>
      getViewportActions({
        onClearLaneDiff: actions.clearLaneDiff,
        onHideLane: actions.toggleLane,
        onImportFiles: actions.importFiles,
        onMoveLane: actions.moveLaneDiff,
        onPaneScroll: handleScroll,
        onPaneScrollIntent: markScrollDriver,
        onRowsActiveFileChange: handleActiveFileChange,
        onViewerRef: setViewerRef,
      }),
    [
      actions.clearLaneDiff,
      actions.importFiles,
      actions.moveLaneDiff,
      actions.toggleLane,
      handleActiveFileChange,
      handleScroll,
      markScrollDriver,
      setViewerRef,
    ],
  );
  const closeNotes = useCallback(() => setters.setNotesOpen(false), [setters]);
  const openNotes = useCallback(() => setters.setNotesOpen(true), [setters]);

  return {
    filesPanelActions,
    filesPanelView,
    notes: {
      onChange: setters.setNotes,
      onClose: closeNotes,
      onOpen: openNotes,
      open: state.notesOpen,
      value: state.notes,
    },
    toolbarActions,
    toolbarSettings,
    viewportActions,
    viewportView,
  };
}
