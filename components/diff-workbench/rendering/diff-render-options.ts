import type { CodeViewProps, FileDiffProps } from "@pierre/diffs/react";

import { createSearchHighlightPostRender } from "../search/content-search-dom-highlight";
import { compactSeparatorCSS } from "./diff-separator-css";
import type { DiffRenderSettings, SearchNavigationTarget } from "../shared/types";

type DiffCodeSettings = Pick<
  DiffRenderSettings,
  "codeTheme" | "diffStyle" | "lineNumbers" | "wrap"
>;

const baseDiffOptions = {
  disableFileHeader: false,
  diffIndicators: "bars",
  lineDiffType: "word-alt",
  collapsedContextThreshold: 80,
  expansionLineCount: 30,
  theme: { light: "pierre-light", dark: "pierre-dark" },
  enableLineSelection: true,
} satisfies Partial<NonNullable<FileDiffProps<undefined>["options"]>>;

export function fileDiffOptions(
  { codeTheme, diffStyle, lineNumbers, wrap }: DiffCodeSettings,
  searchTarget: SearchNavigationTarget | null = null,
  paneId?: SearchNavigationTarget["paneId"],
): FileDiffProps<undefined>["options"] {
  const onPostRender =
    searchTarget && paneId ? createSearchHighlightPostRender(searchTarget, paneId) : undefined;

  return {
    ...baseDiffOptions,
    diffStyle,
    overflow: wrap ? "wrap" : "scroll",
    disableLineNumbers: !lineNumbers,
    hunkSeparators: "simple",
    onPostRender,
    themeType: codeTheme,
    unsafeCSS: compactSeparatorCSS,
  };
}

export function codeViewOptions(
  { codeTheme, diffStyle, lineNumbers, wrap }: DiffCodeSettings,
  searchTarget: SearchNavigationTarget | null = null,
  paneId?: SearchNavigationTarget["paneId"],
): CodeViewProps<undefined>["options"] {
  const onPostRender =
    searchTarget && paneId ? createSearchHighlightPostRender(searchTarget, paneId) : undefined;

  return {
    ...baseDiffOptions,
    diffStyle,
    overflow: wrap ? "wrap" : "scroll",
    disableLineNumbers: !lineNumbers,
    hunkSeparators: "simple",
    themeType: codeTheme,
    onPostRender,
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
  };
}
