import { cn } from "@/lib/utils";

import { getDirectoryTreeRowLabel, getDirectoryTreeRowTitle } from "./file-tree-row-labels";
import { getHiddenFileNameState } from "./file-visibility-state";

const DIRECTORY_TREE_ROW_BASE_CLASS =
  "group flex h-7 w-full items-center gap-1.5 rounded-md pr-1 text-left text-[12px] font-medium transition-colors";

type DirectoryHiddenState = {
  fullyHidden: boolean;
  hiddenCount: number;
  partiallyHidden: boolean;
};

export function getDirectoryHiddenState(
  fileNames: string[],
  hiddenFiles: Set<string>,
): DirectoryHiddenState {
  const hidden = getHiddenFileNameState(fileNames, hiddenFiles);

  return {
    fullyHidden: hidden.allHidden,
    hiddenCount: hidden.hiddenCount,
    partiallyHidden: hidden.partiallyHidden,
  };
}

function getDirectoryTreeRowToneClass(fullyHidden: boolean) {
  return fullyHidden
    ? "text-muted-foreground/45 opacity-60 hover:bg-muted/35 hover:opacity-80"
    : "text-muted-foreground hover:bg-muted/55 hover:text-foreground";
}

function getDirectoryHiddenIconClass({
  fullyHidden,
  partiallyHidden,
}: {
  fullyHidden: boolean;
  partiallyHidden: boolean;
}) {
  if (!fullyHidden && !partiallyHidden) return null;
  return partiallyHidden && !fullyHidden ? "size-3 shrink-0 opacity-55" : "size-3 shrink-0";
}

export function getDirectoryTreeRowChrome({
  collapsed,
  fullyHidden,
  hasSummary,
  partiallyHidden,
  path,
}: {
  collapsed: boolean;
  fullyHidden: boolean;
  hasSummary: boolean;
  partiallyHidden: boolean;
  path: string;
}) {
  return {
    ariaLabel: getDirectoryTreeRowLabel({ collapsed, path }),
    className: cn(DIRECTORY_TREE_ROW_BASE_CLASS, getDirectoryTreeRowToneClass(fullyHidden)),
    hiddenIconClass: getDirectoryHiddenIconClass({
      fullyHidden,
      partiallyHidden,
    }),
    showSummary: collapsed && hasSummary,
    title: getDirectoryTreeRowTitle({ collapsed, path }),
  };
}
