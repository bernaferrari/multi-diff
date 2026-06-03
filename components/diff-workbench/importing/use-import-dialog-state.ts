import { useEffect, useRef, useState, type DragEvent } from "react";

import {
  isFileDragEvent,
  prepareImportDrop,
  stopImportDragPropagation,
} from "./import-drag-events";
import { IMPORT_DROP_REQUEST_EVENT, type ImportDropRequest } from "./import-drop-request";
import {
  appendImportFiles,
  removeImportFile,
  reorderImportFiles,
  setImportFileTargetLane,
  sortImportFilesByName,
  type ImportFileSource,
  type StagedImportFile,
} from "./import-staging-state";
import type { LaneId } from "../shared/types";
import type { ImportDialogBodyActions, ImportDialogBodyView } from "./import-dialog-model";

export function useImportDialogState({
  onImportFiles,
  onLoadGuide,
  onLoadSamples,
}: {
  onImportFiles: (files: ImportFileSource | StagedImportFile[]) => void | Promise<void>;
  onLoadGuide: () => void;
  onLoadSamples: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<StagedImportFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleImportDropRequest(event: Event) {
      const request = (event as CustomEvent<ImportDropRequest>).detail;
      if (!request?.files.length) return;

      setOpen(true);
      setDragging(false);
      setPendingFiles((current) =>
        appendImportFiles(current, request.files, undefined, request.target),
      );
    }

    window.addEventListener(IMPORT_DROP_REQUEST_EVENT, handleImportDropRequest);
    return () => window.removeEventListener(IMPORT_DROP_REQUEST_EVENT, handleImportDropRequest);
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    setDragging(false);
    if (!nextOpen) setPendingFiles([]);
  }

  function handleFiles(files: ImportFileSource) {
    setPendingFiles((current) => appendImportFiles(current, files));
  }

  function handleMove(fromIndex: number, toIndex: number) {
    setPendingFiles((current) => reorderImportFiles(current, fromIndex, toIndex));
  }

  function handleLaneChange(index: number, lane: LaneId) {
    setPendingFiles((current) => setImportFileTargetLane(current, index, lane));
  }

  function handleRemove(index: number) {
    setPendingFiles((current) => removeImportFile(current, index));
  }

  function handleSort() {
    setPendingFiles((current) => sortImportFilesByName(current));
  }

  function handleAdd() {
    inputRef.current?.click();
  }

  async function handleImport() {
    if (!pendingFiles.length) return;
    await onImportFiles(pendingFiles);
    closeAndClear();
  }

  function handleLoadSamples() {
    onLoadSamples();
    closeAndClear();
  }

  function handleLoadGuide() {
    onLoadGuide();
    closeAndClear();
  }

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    if (!isFileDragEvent(event)) return;
    stopImportDragPropagation(event);
    setDragging(true);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (!isFileDragEvent(event)) return;
    prepareImportDrop(event);
    event.dataTransfer.dropEffect = "copy";
    setDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    stopImportDragPropagation(event);
    setDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    if (!isFileDragEvent(event)) return;
    prepareImportDrop(event);
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  function closeAndClear() {
    setOpen(false);
    setPendingFiles([]);
  }

  const view: Omit<ImportDialogBodyView, "panes"> = {
    dragging,
    inputRef,
    pendingFiles,
  };

  const actions: ImportDialogBodyActions = {
    onAdd: handleAdd,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    onFiles: handleFiles,
    onImport: handleImport,
    onLaneChange: handleLaneChange,
    onLoadGuide: handleLoadGuide,
    onMove: handleMove,
    onRemove: handleRemove,
    onLoadSamples: handleLoadSamples,
    onSort: handleSort,
  };

  return {
    actions,
    open,
    setOpen: handleOpenChange,
    view,
  };
}
