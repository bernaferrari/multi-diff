import { useCallback, useReducer, useRef } from "react";

import {
  getFocusModeToggleAction,
  getNavigationFallbackFile,
  getNavigationScrollLockUntil,
  getRowsLayoutNavigationTarget,
  initialWorkbenchNavigationState,
  isNavigationScrollLocked,
  reduceWorkbenchNavigationState,
  type PaneFileLookup,
} from "./workbench-navigation-state";
import type { FileNavigationTarget, FileRow, LaneId, Layout } from "../shared/types";
import type { WorkbenchSetters } from "../workbench/workbench-state-model";

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
  const navigationToken = useRef(0);

  const activateFile = useCallback(
    ({
      behavior,
      clearFocus,
      focus,
      laneIds,
      lineNumber,
      name,
      occurrenceIndex,
      side,
    }: {
      behavior?: FileNavigationTarget["behavior"];
      clearFocus?: boolean;
      focus?: boolean;
      laneIds?: LaneId[];
      lineNumber?: FileNavigationTarget["lineNumber"];
      name: string;
      occurrenceIndex?: FileNavigationTarget["occurrenceIndex"];
      side?: FileNavigationTarget["side"];
    }) => {
      navigationToken.current += 1;
      if (clearFocus) clearFocusedFile();
      setters.setActiveFile(name);
      if (focus) setters.setFocusFile(name);
      dispatchNavigation({
        displayedPaneViews,
        behavior,
        fallbackName: getNavigationFallbackFile({
          activeFile,
          fileRows,
          indexActiveFile,
        }),
        focusMode: focus ? true : undefined,
        laneIds,
        lineNumber,
        name,
        navigationLockUntil: getNavigationScrollLockUntil(Date.now()),
        occurrenceIndex,
        side,
        token: navigationToken.current,
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
    (name: string, behavior?: FileNavigationTarget["behavior"]) => {
      activateFile({ behavior, clearFocus: true, name });
    },
    [activateFile],
  );

  const focusFile = useCallback(
    (name: string, behavior?: FileNavigationTarget["behavior"]) => {
      activateFile({ behavior, focus: true, name });
    },
    [activateFile],
  );

  const navigateOrFocusFile = useCallback(
    (name: string, options?: FileNavigationOptions) => {
      if (navigation.focusMode) {
        focusFile(name, options?.behavior);
        return;
      }
      navigateFile(name, options?.behavior);
    },
    [focusFile, navigation.focusMode, navigateFile],
  );

  const navigateLaneFile = useCallback(
    (laneId: LaneId, name: string, options?: FileNavigationOptions) => {
      activateFile({
        behavior: options?.behavior,
        clearFocus: !navigation.focusMode,
        focus: navigation.focusMode,
        laneIds: [laneId],
        lineNumber: options?.lineNumber,
        name,
        occurrenceIndex: options?.occurrenceIndex,
        side: options?.side,
      });
    },
    [activateFile, navigation.focusMode],
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
    navigateLaneFile,
    navigateOrFocusFile,
    navigationTarget: navigation.navigationTarget,
    setLayout,
    toggleFocusMode,
  };
}

type FileNavigationOptions = Pick<
  FileNavigationTarget,
  "behavior" | "lineNumber" | "occurrenceIndex" | "side"
>;
