import { SlidersHorizontal } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import {
  DISPLAY_OPTIONS,
  type DisplayActions,
  type DisplaySettings,
} from "./display-options"
import { DisplaySwitch } from "./display-switch"
import { laneLabel, laneStyle } from "./lanes"
import type { LaneId, LaneMarkerStyle } from "./types"

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

function LaneMarkerStyleControl({
  layout,
  value,
  onValueChange,
}: {
  layout: DisplaySettings["layout"]
  value: LaneMarkerStyle
  onValueChange: (value: LaneMarkerStyle) => void
}) {
  return (
    <div className="grid gap-2 border-t border-border/70 pt-3">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <div className="text-xs font-medium">Sidebar markers</div>
          <div className="text-xs text-muted-foreground">
            Choose lane letters or compact color blocks.
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 dark:bg-muted/65">
        <LaneMarkerButton
          active={value === "letters"}
          layout={layout}
          markerStyle="letters"
          label="Letters"
          onClick={() => onValueChange("letters")}
        />
        <LaneMarkerButton
          active={value === "bars"}
          layout={layout}
          markerStyle="bars"
          label="Bars"
          onClick={() => onValueChange("bars")}
        />
      </div>
    </div>
  )
}

function LaneMarkerButton({
  active,
  label,
  layout,
  markerStyle,
  onClick,
}: {
  active: boolean
  label: string
  layout: DisplaySettings["layout"]
  markerStyle: LaneMarkerStyle
  onClick: () => void
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-9 justify-center gap-2 rounded-md border border-transparent px-2 text-xs",
        active
          ? "bg-background text-foreground shadow-sm hover:bg-background dark:bg-foreground/10 dark:hover:bg-foreground/12"
          : "text-muted-foreground hover:border-border/60 hover:bg-background/70 hover:text-foreground dark:hover:bg-foreground/8"
      )}
    >
      <LaneMarkerPreview layout={layout} markerStyle={markerStyle} />
      {label}
    </Button>
  )
}

function LaneMarkerPreview({
  layout,
  markerStyle,
}: {
  layout: DisplaySettings["layout"]
  markerStyle: LaneMarkerStyle
}) {
  const lanes: LaneId[] = ["a", "b", "c"]

  if (markerStyle === "bars") {
    return (
      <span
        className={cn(
          "flex items-center gap-0.5",
          layout === "rows" && "flex-col gap-px"
        )}
        aria-hidden
      >
        {lanes.map((id) => (
          <span
            key={id}
            className={cn(
              "rounded-[2px]",
              layout === "rows" ? "h-1 w-3.5" : "h-3.5 w-1.5",
              laneStyle(id).bar
            )}
          />
        ))}
      </span>
    )
  }

  return (
    <span className="flex items-center gap-0.5 font-mono text-[10px]" aria-hidden>
      {lanes.map((id) => (
        <span key={id} className={laneStyle(id).text}>
          {laneLabel(id)}
        </span>
      ))}
    </span>
  )
}
