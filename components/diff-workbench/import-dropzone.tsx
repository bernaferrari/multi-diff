import { Upload } from "lucide-react";
import type { DragEvent } from "react";

import { cn } from "@/lib/utils";

import { DIFF_FILE_ACCEPT_LABEL } from "./diff-file-input";
import { MAX_LANES } from "./lanes";

export function ImportEmptyDropzone({
  dragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}: {
  dragging: boolean;
  onDragEnter: (event: DragEvent<HTMLLabelElement>) => void;
  onDragLeave: (event: DragEvent<HTMLLabelElement>) => void;
  onDragOver: (event: DragEvent<HTMLLabelElement>) => void;
  onDrop: (event: DragEvent<HTMLLabelElement>) => void;
}) {
  return (
    <label
      aria-label="Import diff files"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "group flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center transition-colors",
        dragging
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background hover:border-primary/45 hover:bg-muted/25",
      )}
    >
      <span
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-xl border bg-muted/30 text-muted-foreground transition-colors",
          dragging ? "border-primary/40 text-primary" : "border-border group-hover:text-foreground",
        )}
      >
        <Upload className="size-5" />
      </span>
      <span className="grid gap-0.5">
        <span className="text-sm font-medium text-foreground">
          Drop diff files here, or click to browse
        </span>
        <span className="text-xs text-muted-foreground">
          {DIFF_FILE_ACCEPT_LABEL} · up to {MAX_LANES}
        </span>
      </span>
    </label>
  );
}
