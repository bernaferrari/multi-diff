import { ContextMenuGroup } from "@/components/ui/context-menu";

import { RestoreMenuItem } from "./files-context-menu-items";
import { FilesMenuLabel } from "./files-context-menu-parts";
import type { RestoreMenuState } from "./files-context-menu-state";

export function RestoreContextMenuGroup({
  restoreMenu,
  onShowAllFiles,
  onShowFiles,
}: {
  restoreMenu: RestoreMenuState;
  onShowAllFiles: () => void;
  onShowFiles: (names: string[]) => void;
}) {
  const { overflowLabel, restoreRows, showRestoreAll } = restoreMenu;

  return (
    <ContextMenuGroup>
      <FilesMenuLabel>Restore</FilesMenuLabel>
      {showRestoreAll ? (
        <RestoreMenuItem onClick={onShowAllFiles}>Show all hidden files</RestoreMenuItem>
      ) : null}
      {restoreRows.map((row) => (
        <RestoreMenuItem key={row.name} onClick={() => onShowFiles([row.name])} className="min-w-0">
          <span className="truncate font-mono text-xs">{row.name}</span>
        </RestoreMenuItem>
      ))}
      {overflowLabel ? (
        <RestoreMenuItem onClick={onShowAllFiles}>{overflowLabel}</RestoreMenuItem>
      ) : null}
    </ContextMenuGroup>
  );
}
