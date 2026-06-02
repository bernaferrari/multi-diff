import { Upload } from "lucide-react";

import { cn } from "@/lib/utils";

import { DIFF_FILE_ACCEPT_LABEL, DiffFileInput } from "./diff-file-input";
import type { ImportFileSource } from "./import-staging-state";
import { type LaneStyle } from "./lanes";

export function LaneDropzone({
  style,
  onImport,
}: {
  style: LaneStyle;
  onImport: (files: ImportFileSource) => void;
}) {
  return (
    <label
      aria-label="Import a diff file into this lane"
      className={cn(
        "grid flex-1 cursor-pointer place-items-center text-center transition-colors hover:bg-muted/30",
        style.text,
      )}
    >
      <DiffFileInput onFiles={onImport} />
      <div className="px-6 pt-4 pb-0">
        <div
          className={cn(
            "mx-auto mb-3 grid size-10 place-items-center rounded-xl",
            style.soft,
            style.text,
          )}
        >
          <Upload className="size-5" />
        </div>
        <div className="text-sm font-semibold">Drop diff here</div>
        <div className="mt-1 text-xs text-muted-foreground">{DIFF_FILE_ACCEPT_LABEL}</div>
      </div>
    </label>
  );
}
