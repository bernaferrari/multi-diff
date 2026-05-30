type NotepadDisplayState = {
  characterCount: number
  copyFeedbackMs: number
  copyLabel: string
  hasContent: boolean
}

const NOTE_COPY_FEEDBACK_MS = 1400

export function getNotepadState({
  copied,
  value,
}: {
  copied: boolean
  value: string
}): NotepadDisplayState {
  return {
    characterCount: value.length,
    copyFeedbackMs: NOTE_COPY_FEEDBACK_MS,
    copyLabel: copied ? "Notes copied" : "Copy notes",
    hasContent: value.trim().length > 0,
  }
}
