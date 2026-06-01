import { useRef, useState, type DragEvent } from "react"

import {
  isFileDragEvent,
  prepareImportDrop,
  stopImportDragPropagation,
} from "./import-drag-events"
import {
  appendImportFiles,
  removeImportFile,
  reorderImportFiles,
  setImportFileTargetLane,
  sortImportFilesByName,
  type ImportFileSource,
  type StagedImportFile,
} from "./import-staging-state"
import type { LaneId } from "./types"
import type {
  ImportDialogBodyActions,
  ImportDialogBodyView,
} from "./import-dialog-model"

export function useImportDialogState({
  onImportFiles,
  onReset,
}: {
  onImportFiles: (
    files: ImportFileSource | StagedImportFile[]
  ) => void | Promise<void>
  onReset: () => void
}) {
  const [open, setOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<StagedImportFile[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    setDragging(false)
    if (!nextOpen) setPendingFiles([])
  }

  function handleFiles(files: ImportFileSource) {
    setPendingFiles((current) => appendImportFiles(current, files))
  }

  function handleMove(fromIndex: number, toIndex: number) {
    setPendingFiles((current) =>
      reorderImportFiles(current, fromIndex, toIndex)
    )
  }

  function handleLaneChange(index: number, lane: LaneId) {
    setPendingFiles((current) => setImportFileTargetLane(current, index, lane))
  }

  function handleRemove(index: number) {
    setPendingFiles((current) => removeImportFile(current, index))
  }

  function handleSort() {
    setPendingFiles((current) => sortImportFilesByName(current))
  }

  function handleAdd() {
    inputRef.current?.click()
  }

  async function handleImport() {
    if (!pendingFiles.length) return
    await onImportFiles(pendingFiles)
    closeAndClear()
  }

  function handleReset() {
    onReset()
    closeAndClear()
  }

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    if (isFileDragEvent(event)) setDragging(true)
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (!isFileDragEvent(event)) return
    prepareImportDrop(event)
    event.dataTransfer.dropEffect = "copy"
    setDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    stopImportDragPropagation(event)
    setDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    if (!isFileDragEvent(event)) return
    prepareImportDrop(event)
    setDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  function closeAndClear() {
    setOpen(false)
    setPendingFiles([])
  }

  const view: Omit<ImportDialogBodyView, "panes"> = {
    dragging,
    inputRef,
    pendingFiles,
  }

  const actions: ImportDialogBodyActions = {
    onAdd: handleAdd,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    onFiles: handleFiles,
    onImport: handleImport,
    onLaneChange: handleLaneChange,
    onMove: handleMove,
    onRemove: handleRemove,
    onReset: handleReset,
    onSort: handleSort,
  }

  return {
    actions,
    open,
    setOpen: handleOpenChange,
    view,
  }
}
