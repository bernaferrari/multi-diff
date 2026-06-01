import {
  ContextMenuContent,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"

import {
  DirectoryContextMenuGroup,
  FileContextMenuGroup,
} from "./files-context-menu-groups"
import { getFilesContextMenuState } from "./files-context-menu-state"
import { RestoreContextMenuGroup } from "./restore-context-menu-group"
import type { DirectoryContext, FileRow } from "./types"

export function FilesContextMenuContent({
  contextDirectory,
  contextFile,
  hiddenFileRows,
  hiddenFiles,
  restorableRows,
  onHideFiles,
  onShowAllFiles,
  onShowFiles,
}: {
  contextDirectory: DirectoryContext | null
  contextFile: string | null
  hiddenFileRows: FileRow[]
  hiddenFiles: Set<string>
  restorableRows: FileRow[]
  onHideFiles: (names: string[]) => void
  onShowAllFiles: () => void
  onShowFiles: (names: string[]) => void
}) {
  const menu = getFilesContextMenuState({
    contextDirectory,
    contextFile,
    hiddenFileRows,
    restorableRows,
  })

  if (!menu.shouldRender) return null

  return (
    <ContextMenuContent className="w-72 p-1.5">
      {contextFile ? (
        <FileContextMenuGroup
          hidden={hiddenFiles.has(contextFile)}
          name={contextFile}
          onHideFiles={onHideFiles}
          onShowFiles={onShowFiles}
        />
      ) : null}

      {contextDirectory ? (
        <DirectoryContextMenuGroup
          contextDirectory={contextDirectory}
          hiddenFiles={hiddenFiles}
          onHideFiles={onHideFiles}
          onShowFiles={onShowFiles}
        />
      ) : null}

      {menu.showSeparator ? <ContextMenuSeparator /> : null}

      {menu.hasRestoreAction ? (
        <RestoreContextMenuGroup
          restoreMenu={menu.restoreMenu}
          onShowAllFiles={onShowAllFiles}
          onShowFiles={onShowFiles}
        />
      ) : null}
    </ContextMenuContent>
  )
}
