import type { DragEvent, Ref } from "react";

import type { ImportFileSource, StagedImportFile } from "./import-staging-state";
import type { LaneId, Pane } from "../shared/types";

export type ImportDialogBodyView = {
  dragging: boolean;
  inputRef: Ref<HTMLInputElement>;
  pendingFiles: StagedImportFile[];
  panes: Pane[];
};

export type ImportDialogBodyActions = {
  onAdd: () => void;
  onDragEnter: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: (event: DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  onFiles: (files: ImportFileSource) => void;
  onLoadGuide: () => void;
  onImport: () => void | Promise<void>;
  onLaneChange: (index: number, lane: LaneId) => void;
  onLoadSamples: () => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
  onSort: () => void;
};
