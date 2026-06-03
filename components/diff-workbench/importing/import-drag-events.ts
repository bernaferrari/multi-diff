import type { DragEvent } from "react";

type ImportNativeDragEvent = Pick<
  DragEvent<HTMLElement>["nativeEvent"],
  "stopImmediatePropagation"
>;

type FileDragEvent = {
  dataTransfer: Pick<DragEvent<HTMLElement>["dataTransfer"], "types">;
};

type ImportDragEvent = FileDragEvent &
  Pick<DragEvent<HTMLElement>, "preventDefault" | "stopPropagation"> & {
    nativeEvent: ImportNativeDragEvent;
  };

export function isFileDragEvent(event: FileDragEvent) {
  return Array.from(event.dataTransfer.types).includes("Files");
}

export function prepareImportDrop(event: ImportDragEvent) {
  event.stopPropagation();
  event.nativeEvent.stopImmediatePropagation();
  event.preventDefault();
}

export function stopImportDragPropagation(event: ImportDragEvent) {
  event.stopPropagation();
  event.nativeEvent.stopImmediatePropagation();
}
