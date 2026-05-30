"use client"

import { RotateCcw, Upload } from "lucide-react"
import { useState, type DragEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

import { DIFF_FILE_ACCEPT_LABEL, DiffFileInput } from "./diff-file-input"
import { laneRangeLabel, MAX_LANES } from "./lanes"

export function ImportDialog({
  onImportFiles,
  onReset,
}: {
  onImportFiles: (files: FileList | null) => void | Promise<void>
  onReset: () => void
}) {
  const [open, setOpen] = useState(false)
  const [dragging, setDragging] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    await onImportFiles(files)
    setOpen(false)
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    setDragging(true)
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    void handleFiles(event.dataTransfer.files)
  }

  function handleReset() {
    onReset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="xs"
            className="h-6 gap-1.5 px-2.5"
          >
            <Upload className="size-3" />
            Import
          </Button>
        }
      />
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="px-5 pt-5 pr-12 pb-3">
          <DialogTitle className="text-lg">Import diffs</DialogTitle>
          <DialogDescription className="text-sm">
            Load up to {MAX_LANES} diff files into lanes {laneRangeLabel()}.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-5">
          <label
            onDragOver={handleDragOver}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "group grid min-h-32 cursor-pointer place-items-center rounded-lg border border-dashed p-5 text-center transition-colors",
              dragging
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:border-primary/45 hover:bg-muted/25"
            )}
          >
            <DiffFileInput multiple onFiles={handleFiles} />
            <span className="flex items-center gap-3 text-left">
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-lg border bg-muted/30 text-muted-foreground transition-colors",
                  dragging
                    ? "border-primary/40 text-primary"
                    : "border-border group-hover:text-foreground"
                )}
              >
                <Upload className="size-5" />
              </span>
              <span className="grid gap-0.5">
                <span className="text-sm font-medium">
                  Drop diff files here
                </span>
                <span className="text-xs text-muted-foreground">
                  {DIFF_FILE_ACCEPT_LABEL}
                </span>
              </span>
            </span>
          </label>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="mt-3 px-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Reset samples
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
