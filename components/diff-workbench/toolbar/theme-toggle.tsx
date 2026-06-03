"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

import { ToolbarTooltip } from "./toolbar-controls";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
  const showLightThemeIcon = mounted && resolvedTheme === "dark";

  return (
    <ToolbarTooltip label="Toggle theme (d)">
      <Button
        variant="outline"
        size="icon-xs"
        aria-label="Toggle theme"
        onClick={() => setTheme(nextTheme)}
        className="text-muted-foreground"
      >
        {showLightThemeIcon ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
      </Button>
    </ToolbarTooltip>
  );
}
