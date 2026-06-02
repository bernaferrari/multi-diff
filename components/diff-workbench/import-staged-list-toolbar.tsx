import { ArrowDownAZ, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { MAX_LANES } from "./lanes";

export function ImportStagedListToolbar({
  count,
  onAdd,
  onSort,
}: {
  count: number;
  onAdd: () => void;
  onSort: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-2.5 pt-2 pb-1.5">
      <span className="pl-1 text-xs font-medium text-muted-foreground">
        {count} of {MAX_LANES} files
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="xs"
          onClick={onSort}
          disabled={count < 2}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowDownAZ className="size-3.5" />
          Sort
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={onAdd}
          disabled={count >= MAX_LANES}
          className="text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>
    </div>
  );
}
