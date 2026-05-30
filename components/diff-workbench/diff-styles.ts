import type { CSSProperties } from "react"

import { DIFF_LINE_HEIGHT_PX } from "./diff-render-metrics"

type CSSVariableStyles = CSSProperties & Record<`--${string}`, string | number>

export function laneColumnStyle(height: number): CSSProperties {
  return {
    height: `min(100%, ${height}px)`,
  }
}

export const diffStyleVariables: CSSVariableStyles = {
  "--diffs-font-family": "var(--font-mono)",
  "--diffs-font-size": "12.5px",
  "--diffs-line-height": `${DIFF_LINE_HEIGHT_PX}px`,
}
