import { useCallback, useReducer } from "react";

import {
  getFocusModeToggleAction,
  getNavigationFallbackFile,
  getRowsLayoutNavigationTarget,
  initialWorkbenchNavigationState,
  isNavigationScrollLocked,
  reduceWorkbenchNavigationState,
  type PaneFileLookup,
} from "./workbench-navigation-state";
import type { FileRow, LaneId, Layout } from "./types";
import type { WorkbenchSetters } from "./workbench-state-model";

type WorkbenchNavigationSetters = Pick<
  WorkbenchSetters,
  "setActiveFile" | "setFocusFile" | "setLayout"
>;

export function useWorkbenchNavigation({
  activeFile,
  clearFocusedFile,
  displayedPaneViews,
  fileRows,
  focusedFile,
  indexActiveFile,
  layout,
  setters,
}: {
  activeFile: string | null;
  clearFocusedFile: () => void;
  displayedPaneViews: PaneFileLookup[];
  fileRows: FileRow[];
  focusedFile: string | null;
  indexActiveFile: string | null;
  layout: Layout;
  setters: WorkbenchNavigationSetters;
}) {
  const [navigation, dispatchNavigation] = useReducer(
    reduceWorkbenchNavigationState,
    initialWorkbenchNavigationState,
  );

  const activateFile = useCallback(
    ({ clearFocus, focus, name }: { clearFocus?: boolean; focus?: boolean; name: string }) => {
      const token = Date.now();
      if (clearFocus) clearFocusedFile();
      setters.setActiveFile(name);
      if (focus) setters.setFocusFile(name);
      dispatchNavigation({
        displayedPaneViews,
        fallbackName: getNavigationFallbackFile({
          activeFile,
          fileRows,
          indexActiveFile,
        }),
        focusMode: focus ? true : undefined,
        name,
        token,
        type: "activate",
      });
    },
    [activeFile, clearFocusedFile, displayedPaneViews, fileRows, indexActiveFile, setters],
  );

  const handleActiveFileChange = useCallback(
    (name: string, sourceId: LaneId) => {
      if (
        isNavigationScrollLocked({
          lockUntil: navigation.navigationLockUntil,
          now: Date.now(),
        })
      ) {
        return;
      }
      setters.setActiveFile(name);
      dispatchNavigation({
        name,
        sourceId,
        type: "scroll",
        updateRowsFile: layout === "rows",
      });
    },
    [layout, navigation.navigationLockUntil, setters],
  );

  const navigateFile = useCallback(
    (name: string) => {
      activateFile({ clearFocus: true, name });
    },
    [activateFile],
  );

  const focusFile = useCallback(
    (name: string) => {
      activateFile({ focus: true, name });
    },
    [activateFile],
  );

  const navigateOrFocusFile = useCallback(
    (name: string) => {
      if (navigation.focusMode) {
        focusFile(name);
        return;
      }
      navigateFile(name);
    },
    [focusFile, navigation.focusMode, navigateFile],
  );

  const clearFocusMode = useCallback(() => {
    dispatchNavigation({ type: "clearFocusMode" });
    clearFocusedFile();
  }, [clearFocusedFile]);

  const toggleFocusMode = useCallback(
    (preferredFile?: string | null) => {
      const action = getFocusModeToggleAction({
        activeFile,
        activeFileByLane: navigation.activeFileByLane,
        fileRows,
        focusedFile,
        focusMode: navigation.focusMode,
        indexActiveFile,
        preferredFile,
      });

      if (action.type === "clear") {
        clearFocusMode();
        return;
      }

      if (action.type === "select") {
        focusFile(action.name);
      }
    },
    [
      activeFile,
      clearFocusMode,
      fileRows,
      focusedFile,
      focusFile,
      indexActiveFile,
      navigation.activeFileByLane,
      navigation.focusMode,
    ],
  );

  const setLayout = useCallback(
    (nextLayout: Layout) => {
      if (nextLayout === layout) return;
      if (nextLayout === "rows") {
        const target = getRowsLayoutNavigationTarget({
          activeFile,
          fileRows,
          indexActiveFile,
          rowsNavigationFile: navigation.rowsNavigationFile,
        });

        if (target) activateFile({ name: target });
      }
      setters.setLayout(nextLayout);
    },
    [
      activateFile,
      activeFile,
      fileRows,
      indexActiveFile,
      layout,
      navigation.rowsNavigationFile,
      setters,
    ],
  );

  return {
    activeFileByLane: navigation.activeFileByLane,
    clearFocusMode,
    focusMode: navigation.focusMode,
    handleActiveFileChange,
    navigateOrFocusFile,
    navigationTarget: navigation.navigationTarget,
    setLayout,
    toggleFocusMode,
  };
}
