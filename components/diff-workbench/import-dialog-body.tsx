"use client"

import { RotateCcw, Upload } from "lucide-react"
import { type DragEvent, type ReactNode } from "react"

import { Button } from "@/components/ui/button"

import { DiffFileInput } from "./diff-file-input"
import { ImportEmptyDropzone } from "./import-dropzone"
import { ImportStagedList } from "./import-staged-list"
import type {
  ImportDialogBodyActions,
  ImportDialogBodyView,
} from "./import-dialog-model"

export function ImportDialogBody({
  actions,
  view,
}: {
  actions: ImportDialogBodyActions
  view: ImportDialogBodyView
}) {
  const { dragging, inputRef, pendingFiles, panes } = view
  const {
    onAdd,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onFiles,
    onImport,
    onLaneChange,
    onMove,
    onRemove,
    onReset,
    onSort,
  } = actions
  const pendingCount = pendingFiles.length
  const hasPending = pendingCount > 0

  return (
    <div className="space-y-3 px-5 pb-5">
      <DiffFileInput ref={inputRef} multiple onFiles={onFiles} />

      {hasPending ? (
        <DropBoundary
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <ImportStagedList
            dragging={dragging}
            files={pendingFiles}
            onAdd={onAdd}
            onLaneChange={onLaneChange}
            onMove={onMove}
            onRemove={onRemove}
            onSort={onSort}
            panes={panes}
          />
        </DropBoundary>
      ) : (
        <ImportEmptyDropzone
          dragging={dragging}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        />
      )}

      <ImportDialogFooter
        count={pendingCount}
        hasPending={hasPending}
        onImport={onImport}
        onReset={onReset}
      />
    </div>
  )
}

function ImportDialogFooter({
  count,
  hasPending,
  onImport,
  onReset,
}: {
  count: number
  hasPending: boolean
  onImport: () => void | Promise<void>
  onReset: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="px-1.5 text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="size-3.5" />
        Reset samples
      </Button>
      <Button
        size="sm"
        onClick={() => void onImport()}
        disabled={!hasPending}
        className="min-w-24"
      >
        <Upload className="size-3.5" />
        {hasPending ? `Import ${count}` : "Import"}
      </Button>
    </div>
  )
}

function DropBoundary({
  children,
  onDragLeave,
  onDragOver,
  onDrop,
}: {
  children: ReactNode
  onDragLeave: (event: DragEvent<HTMLElement>) => void
  onDragOver: (event: DragEvent<HTMLElement>) => void
  onDrop: (event: DragEvent<HTMLElement>) => void
}) {
  return (
    <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      {children}
    </div>
  )
}
