import { cn } from "@/lib/utils"

import {
  formatDiffStatLabel,
  formatDiffStatSummary,
} from "./diff-stat-format"
import { getHiddenFileNameState } from "./file-visibility-state"
import { laneLabel } from "./lanes"
import type { CSSProperties } from "react"
import type { FileRow, LaneId } from "./types"

const FILE_TREE_ROW_BASE_CLASS =
  "group relative mb-0.5 flex h-7 w-full items-center gap-1.5 rounded-md border pr-1.5 text-left text-[12px] transition-colors"

const DIRECTORY_TREE_ROW_BASE_CLASS =
  "group flex h-7 w-full items-center gap-1.5 rounded-md pr-1 text-left text-[12px] font-medium transition-colors"

type DirectoryHiddenState = {
  fullyHidden: boolean
  hiddenCount: number
  partiallyHidden: boolean
}

type FileTreeRowTone = "active" | "default" | "focused" | "hidden"

export function getDirectoryHiddenState(
  fileNames: string[],
  hiddenFiles: Set<string>
): DirectoryHiddenState {
  const hidden = getHiddenFileNameState(fileNames, hiddenFiles)

  return {
    fullyHidden: hidden.allHidden,
    hiddenCount: hidden.hiddenCount,
    partiallyHidden: hidden.partiallyHidden,
  }
}

function getFileTreeRowTitle(row: FileRow) {
  return `${row.name}\nin ${getFileTreeRowLaneList(row)} · ${formatDiffStatSummary(row)}`
}

function getFileTreeRowLabel(row: FileRow) {
  return `${row.name}, changed in ${getFileTreeRowLaneList(row)}, ${formatDiffStatLabel(row)}`
}

function getFileTreeRowLaneList(row: FileRow) {
  return row.presentIn.map(laneLabel).join(", ")
}

function getDirectoryTreeRowTitle({
  collapsed,
  path,
}: {
  collapsed: boolean
  path: string
}) {
  return `${collapsed ? "Expand" : "Collapse"} ${path}`
}

function getDirectoryTreeRowLabel({
  collapsed,
  path,
}: {
  collapsed: boolean
  path: string
}) {
  return `${collapsed ? "Expand" : "Collapse"} folder ${path}`
}

export function getTreeRowIndent(depth: number) {
  return { paddingLeft: 6 + depth * 12 }
}

function getFileTreeRowState({
  activeFile,
  activeLaneIds,
  focusFile,
  hidden,
  name,
}: {
  activeFile: string | null
  activeLaneIds: LaneId[]
  focusFile: string | null
  hidden: boolean
  name: string
}) {
  const isActive = activeFile === name || activeLaneIds.length > 0
  const tone: FileTreeRowTone = hidden
    ? "hidden"
    : focusFile === name
      ? "focused"
      : isActive
        ? "active"
        : "default"

  return {
    isActive,
    isFocused: focusFile === name,
    tone,
  }
}

function getFileTreeRowToneClass(tone: FileTreeRowTone) {
  switch (tone) {
    case "hidden":
      return "border-transparent text-muted-foreground/45 opacity-60 hover:bg-muted/35 hover:opacity-80"
    case "focused":
      return "border-foreground/20 bg-foreground/10 text-foreground"
    case "active":
      return "border-transparent bg-transparent text-foreground"
    case "default":
      return "border-transparent text-foreground hover:bg-muted/60"
  }
}

function getDirectoryTreeRowToneClass(fullyHidden: boolean) {
  return fullyHidden
    ? "text-muted-foreground/45 opacity-60 hover:bg-muted/35 hover:opacity-80"
    : "text-muted-foreground hover:bg-muted/55 hover:text-foreground"
}

function getDirectoryHiddenIconClass({
  fullyHidden,
  partiallyHidden,
}: {
  fullyHidden: boolean
  partiallyHidden: boolean
}) {
  if (!fullyHidden && !partiallyHidden) return null
  return partiallyHidden && !fullyHidden
    ? "size-3 shrink-0 opacity-55"
    : "size-3 shrink-0"
}

export function getDirectoryTreeRowChrome({
  collapsed,
  fullyHidden,
  hasSummary,
  partiallyHidden,
  path,
}: {
  collapsed: boolean
  fullyHidden: boolean
  hasSummary: boolean
  partiallyHidden: boolean
  path: string
}) {
  return {
    ariaLabel: getDirectoryTreeRowLabel({ collapsed, path }),
    className: cn(
      DIRECTORY_TREE_ROW_BASE_CLASS,
      getDirectoryTreeRowToneClass(fullyHidden)
    ),
    hiddenIconClass: getDirectoryHiddenIconClass({
      fullyHidden,
      partiallyHidden,
    }),
    showSummary: collapsed && hasSummary,
    title: getDirectoryTreeRowTitle({ collapsed, path }),
  }
}

export function getFileTreeRowChrome({
  activeFile,
  activeLaneIds = [],
  focusFile,
  hidden,
  row,
}: {
  activeFile: string | null
  activeLaneIds?: LaneId[]
  focusFile: string | null
  hidden: boolean
  row: FileRow
}) {
  const state = getFileTreeRowState({
    activeFile,
    activeLaneIds,
    focusFile,
    hidden,
    name: row.name,
  })
  const style = state.tone === "active" && !hidden
    ? getActiveFileTreeRowStyle(activeLaneIds, row.presentIn)
    : undefined

  return {
    activeBorderStyle: style,
    ariaLabel: getFileTreeRowLabel(row),
    className: cn(FILE_TREE_ROW_BASE_CLASS, getFileTreeRowToneClass(state.tone)),
    isActive: state.isActive,
    isFocused: state.isFocused,
    style,
    title: getFileTreeRowTitle(row),
  }
}

function getActiveFileTreeRowStyle(
  activeLaneIds: LaneId[],
  fallbackLaneIds: LaneId[]
): CSSProperties {
  const laneIds = activeLaneIds.length > 0 ? activeLaneIds : fallbackLaneIds
  const uniqueLaneIds = [...new Set(laneIds)].slice(0, 5)

  return {
    background: getActiveLaneBorderGradient(uniqueLaneIds),
    padding: 1,
    WebkitMask:
      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  }
}

function getActiveLaneBorderGradient(laneIds: LaneId[]) {
  if (laneIds.length <= 1) {
    const laneId = laneIds[0] ?? "a"
    return `linear-gradient(90deg, color-mix(in oklch, var(--lane-${laneId}) 70%, transparent), color-mix(in oklch, var(--lane-${laneId}) 34%, transparent))`
  }

  const stops = laneIds.map(
    (id) => `color-mix(in oklch, var(--lane-${id}) 68%, transparent)`
  )
  return `linear-gradient(90deg, ${stops.join(", ")})`
}
