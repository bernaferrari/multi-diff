import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function ToolbarTooltip({
  label,
  children,
}: {
  label: string
  children: ReactElement
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

export function ToolbarIconButton({
  className,
  openState,
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  openState?: boolean
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-xs"
      {...props}
      className={cn(
        "text-muted-foreground",
        openState && "data-popup-open:bg-muted data-popup-open:text-foreground",
        className
      )}
    />
  )
}

export function SegmentedControl({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-background p-0.5">
      {children}
    </div>
  )
}

export function SegmentedControlItem({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  )
}
