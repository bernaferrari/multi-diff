import { Copy } from "lucide-react"

import { laneRangeLabel, MAX_LANES } from "./lanes"

export function DropOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/50 bg-card/80 px-10 py-8 shadow-xl">
        <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Copy className="size-6" />
        </div>
        <div className="text-base font-semibold">Drop to import</div>
        <div className="text-sm text-muted-foreground">
          {`Up to ${MAX_LANES} diffs -> lanes ${laneRangeLabel()} · drop on a lane to target it`}
        </div>
      </div>
    </div>
  )
}
