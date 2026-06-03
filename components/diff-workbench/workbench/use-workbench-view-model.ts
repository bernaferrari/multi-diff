import { useMemo } from "react";

import { parsePane } from "../rendering/diff-data";
import type { LaneId, Pane } from "../shared/types";
import { buildWorkbenchViewModel } from "./view-model";

export function useWorkbenchViewModel({
  activeFile,
  focusFile,
  hidden,
  hiddenFiles,
  panes,
}: {
  activeFile: string | null;
  focusFile: string | null;
  hidden: Set<LaneId>;
  hiddenFiles: Set<string>;
  panes: Pane[];
}) {
  const parsed = useMemo(() => panes.map(parsePane), [panes]);
  const viewModel = useMemo(
    () =>
      buildWorkbenchViewModel({
        focusFile,
        hidden,
        hiddenFiles,
        parsed,
      }),
    [focusFile, hidden, hiddenFiles, parsed],
  );

  return {
    parsed,
    ...viewModel,
    indexActiveFile: viewModel.focused ?? activeFile,
  };
}
