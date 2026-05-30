import { clearHiddenFileNames } from "./file-visibility-state"
import { createSamplePanes } from "./sample-panes"
import type { LaneId } from "./types"

function toggleFileFocus(current: string | null, name: string) {
  return current === name ? null : name
}

function toggleNotesOpen(open: boolean) {
  return !open
}

export function getWorkbenchResetState() {
  return {
    activeFile: null,
    focusFile: null,
    hidden: new Set<LaneId>(),
    hiddenFiles: clearHiddenFileNames(),
    panes: createSamplePanes(),
  }
}

export function getWorkbenchActionState() {
  return {
    getResetState: getWorkbenchResetState,
    toggleFileFocus,
    toggleNotesOpen,
  }
}
