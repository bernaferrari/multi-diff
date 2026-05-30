import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function WorkbenchShell({
  sidebar,
  sidebarOpen,
  viewport,
}: {
  sidebar: ReactNode
  sidebarOpen: boolean
  viewport: ReactNode
}) {
  return (
    <div className={workbenchGridClass(sidebarOpen)}>
      <div className="min-w-0 overflow-hidden">
        <div className={sidebarPanelClass(sidebarOpen)}>{sidebar}</div>
      </div>
      {viewport}
    </div>
  )
}

function workbenchGridClass(sidebarOpen: boolean) {
  return cn(
    "grid min-h-0 flex-1 transition-[grid-template-columns] duration-[240ms] ease-in-out motion-reduce:transition-none",
    sidebarOpen
      ? "grid-cols-[16rem_minmax(0,1fr)]"
      : "grid-cols-[0rem_minmax(0,1fr)]"
  )
}

function sidebarPanelClass(sidebarOpen: boolean) {
  return cn(
    "h-full transition-[opacity,transform] duration-[240ms] ease-in-out motion-reduce:transition-none",
    sidebarOpen
      ? "translate-x-0 opacity-100"
      : "pointer-events-none -translate-x-3 opacity-0"
  )
}
