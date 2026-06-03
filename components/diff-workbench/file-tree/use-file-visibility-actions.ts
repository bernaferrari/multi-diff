import { type Dispatch, type SetStateAction, useCallback } from "react";

import { clearHiddenFileNames, getFileVisibilityPatch } from "./file-visibility-state";

export function useFileVisibilityActions({
  setActiveFile,
  setFocusFile,
  setHiddenFiles,
}: {
  setActiveFile: Dispatch<SetStateAction<string | null>>;
  setFocusFile: Dispatch<SetStateAction<string | null>>;
  setHiddenFiles: Dispatch<SetStateAction<Set<string>>>;
}) {
  const hideFiles = useCallback(
    (names: string[]) => {
      const patch = getFileVisibilityPatch(names);
      if (!patch) return;
      setHiddenFiles(patch.hide);
      setFocusFile(patch.clearSelection);
      setActiveFile(patch.clearSelection);
    },
    [setActiveFile, setFocusFile, setHiddenFiles],
  );

  const showFiles = useCallback(
    (names: string[]) => {
      const patch = getFileVisibilityPatch(names);
      if (!patch) return;
      setHiddenFiles(patch.show);
    },
    [setHiddenFiles],
  );

  const showAllFiles = useCallback(() => {
    setHiddenFiles(clearHiddenFileNames());
  }, [setHiddenFiles]);

  return {
    hideFiles,
    showAllFiles,
    showFiles,
  };
}
