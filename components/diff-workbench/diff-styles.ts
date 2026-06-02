import { DIFF_LINE_HEIGHT_PX } from "./diff-render-metrics";

import type { CSSProperties } from "react";

type CSSVariableStyles = CSSProperties & Record<`--${string}`, string | number>;

export const diffStyleVariables: CSSVariableStyles = {
  "--diffs-font-family": "var(--font-mono)",
  "--diffs-font-size": "12.5px",
  "--diffs-line-height": `${DIFF_LINE_HEIGHT_PX}px`,
};
