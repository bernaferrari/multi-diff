import type { ReactNode } from "react"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function DisplaySwitch({
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
