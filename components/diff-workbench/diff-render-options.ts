import type { CodeViewProps, FileDiffProps } from "@pierre/diffs/react"

import { compactSeparatorCSS } from "./diff-separator-css"
import type { DiffRenderSettings } from "./types"

type DiffCodeSettings = Pick<
  DiffRenderSettings,
  "codeTheme" | "diffStyle" | "lineNumbers" | "wrap"
>

const baseDiffOptions = {
  disableFileHeader: false,
  diffIndicators: "bars",
  lineDiffType: "word-alt",
  collapsedContextThreshold: 80,
  expansionLineCount: 30,
  theme: { light: "pierre-light", dark: "pierre-dark" },
  enableLineSelection: true,
} satisfies Partial<NonNullable<FileDiffProps<undefined>["options"]>>

export function fileDiffOptions({
  codeTheme,
  diffStyle,
  lineNumbers,
  wrap,
}: DiffCodeSettings): FileDiffProps<undefined>["options"] {
  return {
    ...baseDiffOptions,
    diffStyle,
    overflow: wrap ? "wrap" : "scroll",
    disableLineNumbers: !lineNumbers,
    hunkSeparators: "simple",
    themeType: codeTheme,
    unsafeCSS: compactSeparatorCSS,
  }
}

export function codeViewOptions({
  codeTheme,
  diffStyle,
  lineNumbers,
  wrap,
}: DiffCodeSettings): CodeViewProps<undefined>["options"] {
  return {
    ...baseDiffOptions,
    diffStyle,
    overflow: wrap ? "wrap" : "scroll",
    disableLineNumbers: !lineNumbers,
    hunkSeparators: "simple",
    themeType: codeTheme,
    stickyHeaders: true,
    unsafeCSS: compactSeparatorCSS,
    itemMetrics: {
      hunkSeparatorHeight: 4,
    },
    layout: {
      gap: 0,
      paddingBottom: 0,
      paddingTop: 0,
    },
  }
}
