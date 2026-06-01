import type { ReactNode } from "react"
import { SlidersHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

import {
  DISPLAY_OPTIONS,
  type DisplayActions,
  type DisplaySettings,
} from "./display-options"
import { LaneMarkerStyleControl } from "./lane-marker-style-control"

export function DisplayPopover({
  actions,
  settings,
}: {
  actions: DisplayActions
  settings: DisplaySettings
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="Display options"
            title="Display options"
            className="text-muted-foreground"
          >
            <SlidersHorizontal className="size-3.5" />
          </Button>
        }
      />
      <PopoverContent align="end" sideOffset={8} className="w-72 gap-3 p-3">
        <PopoverHeader className="gap-1 border-b border-border/70 pb-2">
          <PopoverTitle className="flex items-center gap-2 text-sm">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            Display
          </PopoverTitle>
          <PopoverDescription className="text-xs">
            Tune how diffs are rendered.
          </PopoverDescription>
        </PopoverHeader>

        <div className="grid gap-1">
          {DISPLAY_OPTIONS.map((option) => (
            <DisplaySwitch
              key={option.key}
              checked={settings[option.key]}
              description={option.description}
              icon={option.icon}
              label={option.label}
              onCheckedChange={actions[option.key]}
            />
          ))}
        </div>

        <LaneMarkerStyleControl
          layout={settings.layout}
          value={settings.laneMarkerStyle}
          onValueChange={actions.setLaneMarkerStyle}
        />
      </PopoverContent>
    </Popover>
  )
}

function DisplaySwitch({
  checked,
  description,
  icon,
  label,
  onCheckedChange,
}: {
  checked: boolean
  description: string
  icon: ReactNode
  label: string
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/65">
      <span
        className={cn(
          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border",
          checked
            ? "border-primary/20 bg-primary/10 text-primary"
            : "border-border bg-background text-muted-foreground"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-none font-medium">{label}</span>
        <span className="mt-1 block text-xs leading-snug text-muted-foreground">
          {description}
        </span>
      </span>
      <Switch
        checked={checked}
        className="self-center"
        onCheckedChange={onCheckedChange}
        size="sm"
      />
    </label>
  )
}
