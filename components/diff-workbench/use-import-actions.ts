import { type Dispatch, type SetStateAction, useCallback } from "react";

import { applyImportedFiles, readImportFiles } from "./import-state";
import { clearHiddenFileNames } from "./file-visibility-state";
import { getImportFiles, isStagedImportFiles } from "./import-staging-state";
import type { ImportFileSource, StagedImportFile } from "./import-staging-state";
import type { LaneId, Pane } from "./types";

export function useImportActions({
  setHidden,
  setHiddenFiles,
  setPanes,
}: {
  setHidden: Dispatch<SetStateAction<Set<LaneId>>>;
  setHiddenFiles: Dispatch<SetStateAction<Set<string>>>;
  setPanes: Dispatch<SetStateAction<Pane[]>>;
}) {
  const importFiles = useCallback(
    async (fileList: ImportFileSource | StagedImportFile[], target?: LaneId) => {
      const staged = isStagedImportFiles(fileList) ? fileList : null;
      const importSource: ImportFileSource = staged
        ? getImportFiles(staged)
        : (fileList as ImportFileSource);
      const reads = await readImportFiles(importSource);
      if (!reads.length) return;

      setPanes((current) =>
        applyImportedFiles({
          panes: current,
          reads,
          target,
          targets: staged?.map((item) => item.targetLane),
        }),
      );
      setHidden(new Set());
      setHiddenFiles(clearHiddenFileNames());
    },
    [setHidden, setHiddenFiles, setPanes],
  );

  return { importFiles };
}
