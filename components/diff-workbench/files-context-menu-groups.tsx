import { ContextMenuGroup } from "@/components/ui/context-menu";

import { ShowMenuItem, VisibilityMenuItem } from "./files-context-menu-items";
import { DirectoryMenuSummary, FileMenuSummary, FilesMenuLabel } from "./files-context-menu-parts";
import { getDirectoryMenuState } from "./files-context-menu-state";
import type { DirectoryContext } from "./types";

export function FileContextMenuGroup({
  hidden,
  name,
  onHideFiles,
  onShowFiles,
}: {
  hidden: boolean;
  name: string;
  onHideFiles: (names: string[]) => void;
  onShowFiles: (names: string[]) => void;
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
  );
}

export function DirectoryContextMenuGroup({
  contextDirectory,
  hiddenFiles,
  onHideFiles,
  onShowFiles,
}: {
  contextDirectory: DirectoryContext;
  hiddenFiles: Set<string>;
  onHideFiles: (names: string[]) => void;
  onShowFiles: (names: string[]) => void;
}) {
  const { allHidden, hiddenNames, someHidden } = getDirectoryMenuState(
    contextDirectory,
    hiddenFiles,
  );

  return (
    <ContextMenuGroup>
      <FilesMenuLabel>Folder</FilesMenuLabel>
      <DirectoryMenuSummary count={contextDirectory.names.length} label={contextDirectory.label} />
      <VisibilityMenuItem
        hidden={allHidden}
        hideLabel="Hide folder"
        showLabel="Show folder"
        onHide={() => onHideFiles(contextDirectory.names)}
        onShow={() => onShowFiles(contextDirectory.names)}
      />
      {someHidden && !allHidden ? (
        <ShowMenuItem onClick={() => onShowFiles(hiddenNames)}>Show hidden children</ShowMenuItem>
      ) : null}
    </ContextMenuGroup>
  );
}
