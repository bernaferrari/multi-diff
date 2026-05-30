import { cn } from "@/lib/utils"

import { formatAdditionCount, formatDeletionCount } from "./diff-stat-format"

export function DiffStatText({
  additions,
  className,
  deletions,
}: {
  additions: number
  className?: string
  deletions: number
}) {
  return (
    <span className={cn("shrink-0 font-mono tabular-nums", className)}>
      <span className="text-add">{formatAdditionCount(additions)}</span>{" "}
      <span className="text-del">{formatDeletionCount(deletions)}</span>
    </span>
  )
}
