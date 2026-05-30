import { ContextMenuGroup } from "@/components/ui/context-menu"

import {
  RestoreMenuItem,
  ShowMenuItem,
  VisibilityMenuItem,
} from "./files-context-menu-items"
import {
  DirectoryMenuSummary,
  FileMenuSummary,
  FilesMenuLabel,
} from "./files-context-menu-parts"
import {
  getDirectoryMenuState,
  type FilesRestoreMenuState,
} from "./files-context-menu-state"
import type { DirectoryContext } from "./types"

export function FileContextMenuGroup({
  hidden,
  name,
  onHideFiles,
  onShowFiles,
}: {
  hidden: boolean
  name: string
  onHideFiles: (names: string[]) => void
  onShowFiles: (names: string[]) => void
}) {
  return (
    <ContextMenuGroup>
      <FilesMenuLabel>File</FilesMenuLabel>
      <FileMenuSummary path={name} />
      <VisibilityMenuItem
        hidden={hidden}
        hideLabel="Hide file"
        showLabel="Show file"
        onHide={() => onHideFiles([name])}
        onShow={() => onShowFiles([name])}
      />
    </ContextMenuGroup>
  )
}

export function DirectoryContextMenuGroup({
  contextDirectory,
  hiddenFiles,
  onHideFiles,
  onShowFiles,
}: {
  contextDirectory: DirectoryContext
  hiddenFiles: Set<string>
  onHideFiles: (names: string[]) => void
  onShowFiles: (names: string[]) => void
}) {
  const { allHidden, hiddenNames, someHidden } = getDirectoryMenuState(
    contextDirectory,
    hiddenFiles
  )

  return (
    <ContextMenuGroup>
      <FilesMenuLabel>Folder</FilesMenuLabel>
      <DirectoryMenuSummary
        count={contextDirectory.names.length}
        label={contextDirectory.label}
      />
      <VisibilityMenuItem
        hidden={allHidden}
        hideLabel="Hide folder"
        showLabel="Show folder"
        onHide={() => onHideFiles(contextDirectory.names)}
        onShow={() => onShowFiles(contextDirectory.names)}
      />
      {someHidden && !allHidden ? (
        <ShowMenuItem onClick={() => onShowFiles(hiddenNames)}>
          Show hidden children
        </ShowMenuItem>
      ) : null}
    </ContextMenuGroup>
  )
}

export function RestoreContextMenuGroup({
  restoreMenu,
  onShowAllFiles,
  onShowFiles,
}: {
  restoreMenu: FilesRestoreMenuState
  onShowAllFiles: () => void
  onShowFiles: (names: string[]) => void
}) {
  const { overflowLabel, restoreRows, showRestoreAll } = restoreMenu

  return (
    <ContextMenuGroup>
      <FilesMenuLabel>Restore</FilesMenuLabel>
      {showRestoreAll ? (
        <RestoreMenuItem onClick={onShowAllFiles}>
          Show all hidden files
        </RestoreMenuItem>
      ) : null}
      {restoreRows.map((row) => (
        <RestoreMenuItem
          key={row.name}
          onClick={() => onShowFiles([row.name])}
          className="min-w-0"
        >
          <span className="truncate font-mono text-xs">{row.name}</span>
        </RestoreMenuItem>
      ))}
      {overflowLabel ? (
        <RestoreMenuItem onClick={onShowAllFiles}>{overflowLabel}</RestoreMenuItem>
      ) : null}
    </ContextMenuGroup>
  )
}
