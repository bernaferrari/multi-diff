"use client";

import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ImportDialogBody } from "./import-dialog-body";
import type { ImportFileSource, StagedImportFile } from "./import-staging-state";
import { useImportDialogState } from "./use-import-dialog-state";
import type { Pane } from "./types";

export function ImportDialog({
  onClearAll,
  onImportFiles,
  onLoadSamples,
  panes,
}: {
  onClearAll: () => void;
  onImportFiles: (files: ImportFileSource | StagedImportFile[]) => void | Promise<void>;
  onLoadSamples: () => void;
  panes: Pane[];
}) {
  const dialog = useImportDialogState({ onClearAll, onImportFiles, onLoadSamples });

  return (
    <Dialog open={dialog.open} onOpenChange={dialog.setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="xs" className="h-6 gap-1.5 px-2.5">
            <Upload className="size-3" />
            Import
          </Button>
        }
      />
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="px-5 pt-5 pr-12 pb-3">
          <DialogTitle className="text-lg">Import diffs</DialogTitle>
          <DialogDescription className="text-sm">
            Stage files, choose lanes, or reset the workspace before importing.
          </DialogDescription>
        </DialogHeader>

        <ImportDialogBody actions={dialog.actions} view={{ ...dialog.view, panes }} />
      </DialogContent>
    </Dialog>
  );
}
