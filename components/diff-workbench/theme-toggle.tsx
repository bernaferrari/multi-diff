"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { useMounted } from "@/hooks/use-mounted"

import { ToolbarTooltip } from "./toolbar-controls"
import { getThemeToggleState } from "./toolbar-state"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const toggle = getThemeToggleState({
    mounted,
    resolvedTheme,
  })

  return (
    <ToolbarTooltip label="Toggle theme (d)">
      <Button
        variant="outline"
        size="icon-xs"
        aria-label="Toggle theme"
        onClick={() => setTheme(toggle.nextTheme)}
        className="text-muted-foreground"
      >
        {toggle.showLightThemeIcon ? (
          <Sun className="size-3.5" />
        ) : (
          <Moon className="size-3.5" />
        )}
      </Button>
    </ToolbarTooltip>
  )
}
