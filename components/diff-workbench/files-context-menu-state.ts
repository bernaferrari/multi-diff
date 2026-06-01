import type { DirectoryContext, FileRow } from "./types"
import { formatHiddenFileCount } from "./file-count-format"
import { getHiddenFileNameState } from "./file-visibility-state"

const RESTORE_MENU_LIMIT = 6

type DirectoryMenuState = {
  allHidden: boolean
  hiddenNames: string[]
  someHidden: boolean
}

export type RestoreMenuState = {
  overflowLabel: string | null
  restoreRows: FileRow[]
  showRestoreAll: boolean
}

type FilesContextMenuState = {
  hasPrimaryAction: boolean
  hasRestoreAction: boolean
  restoreMenu: RestoreMenuState
  shouldRender: boolean
  showSeparator: boolean
}

export function getFilesContextMenuState({
  contextDirectory,
  contextFile,
  hiddenFileRows,
  restorableRows,
}: {
  contextDirectory: DirectoryContext | null
  contextFile: string | null
  hiddenFileRows: FileRow[]
  restorableRows: FileRow[]
}): FilesContextMenuState {
  const hasPrimaryAction = Boolean(contextFile || contextDirectory)
  const hasRestoreAction = restorableRows.length > 0

  return {
    hasPrimaryAction,
    hasRestoreAction,
    restoreMenu: getRestoreMenuState({ hiddenFileRows, restorableRows }),
    shouldRender: hasPrimaryAction || hiddenFileRows.length > 0,
    showSeparator: hasPrimaryAction && hasRestoreAction,
  }
}

export function getDirectoryMenuState(
  contextDirectory: DirectoryContext,
  hiddenFiles: Set<string>
): DirectoryMenuState {
  const hidden = getHiddenFileNameState(contextDirectory.names, hiddenFiles)

  return {
    allHidden: hidden.allHidden,
    hiddenNames: hidden.hiddenNames,
    someHidden: hidden.hiddenCount > 0,
  }
}

function getRestoreMenuState({
  hiddenFileRows,
  restorableRows,
}: {
  hiddenFileRows: FileRow[]
  restorableRows: FileRow[]
}): RestoreMenuState {
  const hasOverflow = hiddenFileRows.length > RESTORE_MENU_LIMIT

  return {
    overflowLabel: hasOverflow
      ? `Show all ${formatHiddenFileCount(hiddenFileRows.length)}`
      : null,
    restoreRows: restorableRows.slice(0, RESTORE_MENU_LIMIT),
    showRestoreAll: hiddenFileRows.length > 1 && !hasOverflow,
  }
}
