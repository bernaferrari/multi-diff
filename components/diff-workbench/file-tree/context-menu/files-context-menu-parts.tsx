import { type ReactNode } from "react";
import { Folder } from "lucide-react";

import { ContextMenuLabel } from "@/components/ui/context-menu";

import { FileTypeIcon } from "../../shared/file-icons";

export function FilesMenuLabel({ children }: { children: ReactNode }) {
  return (
    <ContextMenuLabel className="px-2 text-[10px] tracking-wide uppercase">
      {children}
    </ContextMenuLabel>
  );
}

export function FileMenuSummary({ path }: { path: string }) {
  return (
    <MenuSummaryRow>
      <FileTypeIcon path={path} />
      <span className="min-w-0 truncate font-mono text-[11px] text-muted-foreground">{path}</span>
    </MenuSummaryRow>
  );
}

export function DirectoryMenuSummary({ count, label }: { count: number; label: string }) {
  return (
    <MenuSummaryRow>
      <Folder className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
        {label}
      </span>
      <span className="shrink-0 text-[10px] text-muted-foreground/70 tabular-nums">{count}</span>
    </MenuSummaryRow>
  );
}

function MenuSummaryRow({ children }: { children: ReactNode }) {
  return (
    <div className="mx-1 mb-1 flex min-w-0 items-center gap-2 rounded-md bg-muted/45 px-2 py-1.5">
      {children}
    </div>
  );
}
