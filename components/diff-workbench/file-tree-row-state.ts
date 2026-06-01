import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

import {
  getFileTreeRowLabel,
  getFileTreeRowTitle,
} from "./file-tree-row-labels"
import type { FileRow, LaneId } from "./types"

const FILE_TREE_ROW_BASE_CLASS =
  "group relative mb-0.5 flex h-7 w-full items-center gap-1.5 rounded-md border pr-1.5 text-left text-[12px] transition-colors"

type FileTreeRowTone = "active" | "default" | "focused" | "hidden"

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
  const style =
    state.tone === "active" && !hidden
      ? getActiveFileTreeRowStyle(activeLaneIds, row.presentIn)
      : undefined

  return {
    activeBorderStyle: style,
    ariaLabel: getFileTreeRowLabel(row),
    className: cn(
      FILE_TREE_ROW_BASE_CLASS,
      getFileTreeRowToneClass(state.tone)
    ),
    isActive: state.isActive,
    isFocused: state.isFocused,
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
