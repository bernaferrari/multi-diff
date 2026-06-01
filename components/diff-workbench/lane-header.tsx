import { type RefObject } from "react"
import { cn } from "@/lib/utils"

import { DiffFileInput } from "./diff-file-input"
import { DiffStatText } from "./diff-stat-text"
import type { ImportFileSource } from "./import-staging-state"
import { LaneActionsMenu } from "./lane-actions-menu"
import { LaneBadge } from "./lane-badge"
import { type LaneStyle } from "./lanes"
import type { ParsedPane } from "./types"

export function LaneHeader({
  importInputRef,
  isEmpty,
  pane,
  style,
  canMoveLeft,
  canMoveRight,
  onClear,
  onHide,
  onImport,
  onMoveLeft,
  onMoveRight,
}: {
  importInputRef: RefObject<HTMLInputElement | null>
  isEmpty: boolean
  pane: ParsedPane
  style: LaneStyle
  canMoveLeft: boolean
  canMoveRight: boolean
  onClear: () => void
  onHide: () => void
  onImport: (files: ImportFileSource) => void
  onMoveLeft: () => void
  onMoveRight: () => void
}) {
  const showStats = pane.items.length > 0

  return (
    <header className="relative flex min-h-11 shrink-0 items-center gap-2 overflow-hidden rounded-t-xl border-b border-border/70 bg-background/40 pr-1.5 pl-3">
      <span
        className={cn("absolute top-0 bottom-0 left-0 w-1", style.bar)}
        aria-hidden
      />
      <LaneBadge id={pane.id} />
      <div className="flex min-w-0 flex-1 items-center whitespace-nowrap">
        <span className="min-w-0 truncate text-sm font-semibold">
          {pane.label}
        </span>
      </div>
      {showStats ? (
        <DiffStatText
          additions={pane.additions}
          deletions={pane.deletions}
          className="text-xs"
        />
      ) : null}
      <DiffFileInput ref={importInputRef} onFiles={onImport} />
      <LaneActionsMenu
        actions={{
          canClear: !isEmpty,
          label: `${pane.label} actions`,
        }}
        canMoveLeft={canMoveLeft}
        canMoveRight={canMoveRight}
        importInputRef={importInputRef}
        onClear={onClear}
        onHide={onHide}
        onMoveLeft={onMoveLeft}
        onMoveRight={onMoveRight}
      />
    </header>
  )
}
