import { useEffect } from "react"

import {
  getDragDepthState,
  hasDraggedFiles,
  laneTargetFromDragEvent,
} from "./drop-import-state"
import type { LaneId } from "./types"

export function useDiffDropImport({
  onDraggingChange,
  onImport,
}: {
  onDraggingChange: (dragging: boolean) => void
  onImport: (files: FileList | null, target?: LaneId) => void
}) {
  useEffect(() => {
    let depth = 0

    function onEnter(event: DragEvent) {
      if (!hasDraggedFiles(event)) return
      const next = getDragDepthState(depth, "enter")
      depth = next.depth
      onDraggingChange(next.dragging)
    }

    function onLeave(event: DragEvent) {
      if (!hasDraggedFiles(event)) return
      const next = getDragDepthState(depth, "leave")
      depth = next.depth
      onDraggingChange(next.dragging)
    }

    function onOver(event: DragEvent) {
      if (hasDraggedFiles(event)) event.preventDefault()
    }

    function onDrop(event: DragEvent) {
      if (!hasDraggedFiles(event)) return
      event.preventDefault()
      const next = getDragDepthState(depth, "drop")
      depth = next.depth
      onDraggingChange(next.dragging)
      onImport(
        event.dataTransfer?.files ?? null,
        laneTargetFromDragEvent(event)
      )
    }

    window.addEventListener("dragenter", onEnter)
    window.addEventListener("dragleave", onLeave)
    window.addEventListener("dragover", onOver)
    window.addEventListener("drop", onDrop)
    return () => {
      window.removeEventListener("dragenter", onEnter)
      window.removeEventListener("dragleave", onLeave)
      window.removeEventListener("dragover", onOver)
      window.removeEventListener("drop", onDrop)
    }
  }, [onDraggingChange, onImport])
}
