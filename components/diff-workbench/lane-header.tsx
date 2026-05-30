import { Children, type ComponentProps, type RefObject } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  MoreHorizontal,
  Trash2,
  Upload,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { DiffFileInput } from "./diff-file-input"
import { DiffStatText } from "./diff-stat-text"
import { LaneBadge } from "./lane-badge"
import { getLaneHeaderState } from "./lane-header-state"
import { type LaneStyle } from "./lanes"
import type { PaneView, ParsedPane } from "./types"

export function LaneHeader({
  importInputRef,
  isEmpty,
  pane,
  style,
  view,
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
  view: PaneView
  canMoveLeft: boolean
  canMoveRight: boolean
  onClear: () => void
  onHide: () => void
  onImport: (files: FileList | null) => void
  onMoveLeft: () => void
  onMoveRight: () => void
}) {
  const header = getLaneHeaderState({
    isEmpty,
    label: pane.label,
    view,
  })

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
      {header.stats ? <DiffStatText {...header.stats} className="text-xs" /> : null}
      <DiffFileInput ref={importInputRef} onFiles={onImport} />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label={header.actions.label}
              title={header.actions.label}
              className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground/65 hover:bg-muted hover:text-foreground data-popup-open:bg-muted data-popup-open:text-foreground"
            >
              <MoreHorizontal className="size-4" />
            </button>
          }
        />
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-48 rounded-xl p-1.5 shadow-xl ring-1 ring-border/80"
        >
          <LaneMenuItem disabled={!canMoveLeft} onClick={onMoveLeft}>
            <ArrowLeft className="size-3.5" />
            Move left
          </LaneMenuItem>
          <LaneMenuItem disabled={!canMoveRight} onClick={onMoveRight}>
            <ArrowRight className="size-3.5" />
            Move right
          </LaneMenuItem>
          <LaneMenuItem onClick={() => importInputRef.current?.click()}>
            <Upload className="size-3.5" />
            Replace diff
          </LaneMenuItem>
          <LaneMenuItem onClick={onHide}>
            <Eye className="size-3.5" />
            Hide panel
          </LaneMenuItem>

          <DropdownMenuSeparator className="my-1.5" />

          <DropdownMenuItem
            disabled={!header.actions.canClear}
            variant="destructive"
            onClick={onClear}
            className="h-9 gap-2 rounded-lg px-2 text-xs"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-destructive/10 text-destructive">
              <Trash2 className="size-3.5" />
            </span>
            Clear diff
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

function LaneMenuItem({
  children,
  className,
  ...props
}: ComponentProps<typeof DropdownMenuItem>) {
  const [icon, label] = Children.toArray(children)

  return (
    <DropdownMenuItem
      className={cn("h-9 gap-2 rounded-lg px-2 text-xs", className)}
      {...props}
    >
      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground group-focus/dropdown-menu-item:bg-background group-focus/dropdown-menu-item:text-foreground">
        {icon}
      </span>
      <span className="min-w-0 flex-1">{label}</span>
    </DropdownMenuItem>
  )
}
