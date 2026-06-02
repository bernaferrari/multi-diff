"use client";

import { FlaskConical, Upload } from "lucide-react";
import { type DragEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

import { DiffFileInput } from "./diff-file-input";
import { ImportEmptyDropzone } from "./import-dropzone";
import { ImportStagedList } from "./import-staged-list";
import type { ImportDialogBodyActions, ImportDialogBodyView } from "./import-dialog-model";

export function ImportDialogBody({
  actions,
  view,
}: {
  actions: ImportDialogBodyActions;
  view: ImportDialogBodyView;
}) {
  const { dragging, inputRef, pendingFiles, panes } = view;
  const {
    onAdd,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onFiles,
    onImport,
    onLaneChange,
    onLoadSamples,
    onMove,
    onRemove,
    onSort,
  } = actions;
  const pendingCount = pendingFiles.length;
  const hasPending = pendingCount > 0;

  return (
    <div className="space-y-3 px-5 pb-5">
      <DiffFileInput ref={inputRef} multiple onFiles={onFiles} />

      {hasPending ? (
        <DropBoundary
          onDragEnter={onDragEnter}
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
        onLoadSamples={onLoadSamples}
      />
    </div>
  );
}

function ImportDialogFooter({
  count,
  hasPending,
  onImport,
  onLoadSamples,
}: {
  count: number;
  hasPending: boolean;
  onImport: () => void | Promise<void>;
  onLoadSamples: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLoadSamples}
          className="px-1.5 text-muted-foreground hover:text-foreground"
        >
          <FlaskConical className="size-3.5" />
          Load samples
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {hasPending ? <span className="text-xs text-muted-foreground">{count} staged</span> : null}
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
    </div>
  );
}

function DropBoundary({
  children,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}: {
  children: ReactNode;
  onDragEnter: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: (event: DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}) {
  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
    </div>
  );
}
