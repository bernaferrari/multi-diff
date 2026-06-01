import type { PaneView } from "./types"
import { changedLinesFor } from "./diff-totals"
import {
  DIFF_EMPTY_CODE_HEIGHT,
  DIFF_FILE_HEADER_HEIGHT,
  DIFF_LINE_HEIGHT_PX,
  DIFF_MIN_HUNK_CONTEXT_LINES,
  DIFF_MIN_RENDERED_LINES,
  DIFF_RENDERED_LINES_PER_HUNK,
} from "./diff-render-metrics"

export function estimateCodeHeight(view: PaneView) {
  if (view.files.length === 0) return DIFF_EMPTY_CODE_HEIGHT

  return view.files.reduce((total, file) => {
    const changedLines = changedLinesFor(file)
    const hunkContext = Math.max(
      DIFF_MIN_HUNK_CONTEXT_LINES,
      file.hunks.length * DIFF_RENDERED_LINES_PER_HUNK
    )
    const renderedLines = Math.max(
      DIFF_MIN_RENDERED_LINES,
      changedLines + hunkContext
    )
    return total + DIFF_FILE_HEADER_HEIGHT + renderedLines * DIFF_LINE_HEIGHT_PX
  }, 0)
}
