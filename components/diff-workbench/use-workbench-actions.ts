import { useCallback, useMemo } from "react";

import type { FileRow, Pane } from "./types";
import { useFileFocusActions } from "./use-file-focus-actions";
import { useFileVisibilityActions } from "./use-file-visibility-actions";
import { useImportActions } from "./use-import-actions";
import { useLaneActions } from "./use-lane-actions";
import { clearHiddenFileNames } from "./file-visibility-state";
import { createGuidePanes, GUIDE_NOTES } from "./guide-panes";
import { createEmptyPanes, createSamplePanes } from "./sample-panes";
import type { WorkbenchSetters } from "./workbench-state-model";

type WorkbenchActionSetters = Pick<
  WorkbenchSetters,
  | "setActiveFile"
  | "setDiffStyle"
  | "setFocusFile"
  | "setHidden"
  | "setHiddenFiles"
  | "setLayout"
  | "setNotes"
  | "setNotesOpen"
  | "setPanes"
  | "setWrap"
>;

export function useWorkbenchActions({
  activeFile,
  fileRows,
  focusFile,
  panes,
  setters,
}: {
  activeFile: string | null;
  fileRows: FileRow[];
  focusFile: string | null;
  panes: Pane[];
  setters: WorkbenchActionSetters;
}) {
  const {
    setActiveFile,
    setDiffStyle,
    setFocusFile,
    setHidden,
    setHiddenFiles,
    setLayout,
    setNotes,
    setNotesOpen,
    setPanes,
    setWrap,
  } = setters;

  const { clearLaneDiff, moveLaneDiff, toggleLane } = useLaneActions({
    panes,
    setHidden,
    setPanes,
  });

  const { hideFiles, showAllFiles, showFiles } = useFileVisibilityActions({
    setActiveFile,
    setFocusFile,
    setHiddenFiles,
  });

  const { clearFocusedFile, focusFileByOffset, toggleFocusFile } = useFileFocusActions({
    activeFile,
    fileRows,
    focusFile,
    setFocusFile,
  });

  const { importFiles } = useImportActions({
    setHidden,
    setHiddenFiles,
    setPanes,
  });

  const toggleNotes = useCallback(() => {
    setNotesOpen((open) => !open);
  }, [setNotesOpen]);

  const resetSelectionState = useCallback(() => {
    setHidden(new Set());
    setHiddenFiles(clearHiddenFileNames());
    setActiveFile(null);
    setFocusFile(null);
  }, [setActiveFile, setFocusFile, setHidden, setHiddenFiles]);

  const loadSampleWorkbench = useCallback(() => {
    setPanes(createSamplePanes());
    resetSelectionState();
  }, [resetSelectionState, setPanes]);

  const loadGuideWorkbench = useCallback(() => {
    setPanes(createGuidePanes());
    setLayout("columns");
    setDiffStyle("unified");
    setWrap(true);
    setNotes(GUIDE_NOTES);
    setNotesOpen(true);
    resetSelectionState();
  }, [resetSelectionState, setDiffStyle, setLayout, setNotes, setNotesOpen, setPanes, setWrap]);

  const clearWorkbench = useCallback(() => {
    setPanes(createEmptyPanes());
    resetSelectionState();
  }, [resetSelectionState, setPanes]);

  return useMemo(
    () => ({
      clearFocusedFile,
      clearLaneDiff,
      focusFileByOffset,
      hideFiles,
      importFiles,
      loadGuideWorkbench,
      moveLaneDiff,
      clearWorkbench,
      loadSampleWorkbench,
      showAllFiles,
      showFiles,
      toggleFocusFile,
      toggleLane,
      toggleNotes,
    }),
    [
      clearFocusedFile,
      clearLaneDiff,
      focusFileByOffset,
      hideFiles,
      importFiles,
      loadGuideWorkbench,
      moveLaneDiff,
      clearWorkbench,
      loadSampleWorkbench,
      showAllFiles,
      showFiles,
      toggleFocusFile,
      toggleLane,
      toggleNotes,
    ],
  );
}
