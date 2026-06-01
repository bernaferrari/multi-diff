import { Children, type ComponentProps, type RefObject } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  MoreHorizontal,
  Trash2,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function LaneActionsMenu({
  actions,
  canMoveLeft,
  canMoveRight,
  importInputRef,
  onClear,
  onHide,
  onMoveLeft,
  onMoveRight,
}: {
  actions: {
    canClear: boolean
    label: string
  }
  canMoveLeft: boolean
  canMoveRight: boolean
  importInputRef: RefObject<HTMLInputElement | null>
  onClear: () => void
  onHide: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={actions.label}
            title={actions.label}
            className="shrink-0 text-muted-foreground/65 hover:bg-muted hover:text-foreground data-popup-open:bg-muted data-popup-open:text-foreground"
          >
            <MoreHorizontal className="size-4" />
          </Button>
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
          disabled={!actions.canClear}
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
