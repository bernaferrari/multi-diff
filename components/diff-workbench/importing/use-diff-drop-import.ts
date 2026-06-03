import { useEffect, useRef } from "react";

import { getDragDepthState, hasDraggedFiles, laneTargetFromDragEvent } from "./drop-import-state";
import { dispatchImportDropRequest } from "./import-drop-request";

export function useDiffDropImport({
  onDraggingChange,
}: {
  onDraggingChange: (dragging: boolean) => void;
}) {
  const onDraggingChangeRef = useRef(onDraggingChange);

  useEffect(() => {
    onDraggingChangeRef.current = onDraggingChange;
  }, [onDraggingChange]);

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
      dispatchImportDropRequest(event.dataTransfer?.files ?? null, laneTargetFromDragEvent(event));
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
