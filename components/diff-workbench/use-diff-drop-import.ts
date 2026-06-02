import { useEffect, useRef } from "react";

import { getDragDepthState, hasDraggedFiles, laneTargetFromDragEvent } from "./drop-import-state";
import type { ImportFileSource } from "./import-staging-state";
import type { LaneId } from "./types";

export function useDiffDropImport({
  onDraggingChange,
  onImport,
}: {
  onDraggingChange: (dragging: boolean) => void;
  onImport: (files: ImportFileSource, target?: LaneId) => void;
}) {
  const onDraggingChangeRef = useRef(onDraggingChange);
  const onImportRef = useRef(onImport);

  useEffect(() => {
    onDraggingChangeRef.current = onDraggingChange;
    onImportRef.current = onImport;
  }, [onDraggingChange, onImport]);

  useEffect(() => {
    let depth = 0;

    function onEnter(event: DragEvent) {
      if (!hasDraggedFiles(event)) return;
      const next = getDragDepthState(depth, "enter");
      depth = next.depth;
      onDraggingChangeRef.current(next.dragging);
    }

    function onLeave(event: DragEvent) {
      if (!hasDraggedFiles(event)) return;
      const next = getDragDepthState(depth, "leave");
      depth = next.depth;
      onDraggingChangeRef.current(next.dragging);
    }

    function onOver(event: DragEvent) {
      if (hasDraggedFiles(event)) event.preventDefault();
    }

    function onDrop(event: DragEvent) {
      if (!hasDraggedFiles(event)) return;
      event.preventDefault();
      const next = getDragDepthState(depth, "drop");
      depth = next.depth;
      onDraggingChangeRef.current(next.dragging);
      onImportRef.current(event.dataTransfer?.files ?? null, laneTargetFromDragEvent(event));
    }

    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("dragover", onOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("drop", onDrop);
    };
  }, []);
}
