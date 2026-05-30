import { cn } from "@/lib/utils"

import type { DisplayActions, DisplaySettings } from "./display-options"
import type { ToolbarActions, ToolbarSettings } from "./toolbar"

export function getSidebarToggleState(sidebarOpen: boolean) {
  return {
    ariaLabel: sidebarOpen ? "Hide files panel" : "Show files panel",
    className: cn(
      "-ml-1 rounded-md border-transparent bg-transparent",
      sidebarOpen
        ? "text-foreground"
        : "text-muted-foreground hover:text-foreground"
    ),
    pressed: sidebarOpen,
  }
}

export function getThemeToggleState({
  mounted,
  resolvedTheme,
}: {
  mounted: boolean
  resolvedTheme: string | undefined
}) {
  return {
    nextTheme: resolvedTheme === "dark" ? "light" : "dark",
    showLightThemeIcon: mounted && resolvedTheme === "dark",
  }
}

export function getDisplayPopoverState({
  actions,
  settings,
}: {
  actions: ToolbarActions
  settings: ToolbarSettings
}): {
  actions: DisplayActions
  settings: DisplaySettings
} {
  return {
    actions: {
      lineNumbers: actions.setLineNumbers,
      setLaneMarkerStyle: actions.setLaneMarkerStyle,
      wrap: actions.setWrap,
    },
    settings: {
      lineNumbers: settings.lineNumbers,
      laneMarkerStyle: settings.laneMarkerStyle,
      layout: settings.layout,
      wrap: settings.wrap,
    },
  }
}
