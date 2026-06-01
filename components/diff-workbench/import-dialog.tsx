"use client"

import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { ImportDialogBody } from "./import-dialog-body"
import type { ImportFileSource, StagedImportFile } from "./import-staging-state"
import { laneRangeLabel } from "./lanes"
import { useImportDialogState } from "./use-import-dialog-state"
import type { Pane } from "./types"

export function ImportDialog({
  onImportFiles,
  onReset,
  panes,
}: {
  onImportFiles: (
    files: ImportFileSource | StagedImportFile[]
  ) => void | Promise<void>
  onReset: () => void
  panes: Pane[]
}) {
  const dialog = useImportDialogState({ onImportFiles, onReset })

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
            Drop diffs or pick files — they fill lanes {laneRangeLabel()} in the
            order shown.
          </DialogDescription>
        </DialogHeader>

        <ImportDialogBody
          actions={dialog.actions}
          view={{ ...dialog.view, panes }}
        />
      </DialogContent>
    </Dialog>
  )
}
