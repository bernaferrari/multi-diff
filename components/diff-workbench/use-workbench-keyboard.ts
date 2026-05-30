import { useEffect } from "react"

import {
  getWorkbenchKeyboardAction,
  isEditableKeyboardTarget,
} from "./keyboard-state"

export function useWorkbenchKeyboard({
  focusFile,
  onClearFocus,
  onMoveFocus,
  onToggleNotes,
}: {
  focusFile: string | null
  onClearFocus: () => void
  onMoveFocus: (delta: number) => void
  onToggleNotes: () => void
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const action = getWorkbenchKeyboardAction({
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        defaultPrevented: event.defaultPrevented,
        focusFile,
        key: event.key,
        metaKey: event.metaKey,
        targetEditable: isEditableKeyboardTarget(event.target),
      })

      if (!action) return
      if (action.type === "toggle-notes") onToggleNotes()
      else if (action.type === "clear-focus") onClearFocus()
      else onMoveFocus(action.delta)
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [focusFile, onClearFocus, onMoveFocus, onToggleNotes])
}
