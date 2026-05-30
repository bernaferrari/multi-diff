import { type CodeViewHandle } from "@pierre/diffs/react"
import { useCallback, useRef } from "react"

import { getActiveScrollFile } from "./scroll-spy-state"
import type { LaneId, PaneView } from "./types"
import type { DisplayedPaneView } from "./view-model"

type PaneScrollOptions = {
  displayedPaneViews: DisplayedPaneView[]
  paneViews: Map<LaneId, PaneView>
  onActiveFileChange: (name: string, sourceId: LaneId) => void
}

type CodeViewInstance = NonNullable<
  ReturnType<CodeViewHandle<undefined>["getInstance"]>
>

const PROGRAMMATIC_SCROLL_SUPPRESSION_MS = 1400
const USER_SCROLL_DRIVER_MS = 1400

export type PaneScrollTarget = {
  id: LaneId
  instance: CodeViewInstance | undefined
  paneView: PaneView
}

export function scrollMatchingPaneTargets({
  activeFile,
  behavior = "instant",
  onTargetScroll,
  sourceId,
  targets,
}: {
  activeFile: { name: string; intraOffset: number }
  behavior?: "instant" | "smooth"
  onTargetScroll?: (id: LaneId) => void
  sourceId: LaneId
  targets: PaneScrollTarget[]
}) {
  for (const target of targets) {
    if (target.id === sourceId) continue
    const targetId = target.paneView.idByName.get(activeFile.name)
    if (!target.instance || !targetId) continue
    onTargetScroll?.(target.id)
    target.instance.scrollTo({
      type: "item",
      id: targetId,
      align: "start",
      offset: activeFile.intraOffset,
      behavior,
    })
  }
}

export function scrollPaneToFile(targets: PaneScrollTarget[], name: string) {
  const primary = targets.find(
    (target) => target.instance && target.paneView.idByName.has(name)
  )
  const targetId = primary?.paneView.idByName.get(name)
  if (!primary?.instance || !targetId) return false

  primary.instance.scrollTo({
    type: "item",
    id: targetId,
    align: "start",
    offset: 0,
    behavior: "instant",
  })

  scrollMatchingPaneTargets({
    activeFile: { name, intraOffset: 0 },
    behavior: "instant",
    sourceId: primary.id,
    targets,
  })
  return true
}

export function usePaneScroll({
  displayedPaneViews,
  paneViews,
  onActiveFileChange,
}: PaneScrollOptions) {
  const viewerRefs = useRef(new Map<LaneId, CodeViewHandle<undefined> | null>())
  const driver = useRef<{ id: LaneId; until: number } | null>(null)
  const suppressedUntil = useRef(new Map<LaneId, number>())
  const spyFile = useRef<string | null>(null)

  const setViewerRef = useCallback(
    (id: LaneId, handle: CodeViewHandle<undefined> | null) => {
      viewerRefs.current.set(id, handle)
    },
    []
  )

  const handleScroll = useCallback(
    (sourceId: LaneId) => {
      if (!isScrollDriver(driver.current, sourceId)) return
      if (isProgrammaticScrollSuppressed(suppressedUntil.current, sourceId)) {
        return
      }
      claimScrollDriver(driver, sourceId)

      const srcInst = viewerRefs.current.get(sourceId)?.getInstance()
      const srcView = paneViews.get(sourceId)
      if (!srcInst || !srcView || srcView.items.length === 0) return

      const activeFile = getActiveScrollFile(srcView, srcInst)
      if (!activeFile) return

      const activeFileChanged = activeFile.name !== spyFile.current
      if (activeFileChanged) {
        spyFile.current = activeFile.name
        onActiveFileChange(activeFile.name, sourceId)
      }

      if (!activeFileChanged) return
    },
    [onActiveFileChange, paneViews]
  )

  const markScrollDriver = useCallback((id: LaneId) => {
    suppressedUntil.current.delete(id)
    cancelProgrammaticScroll(viewerRefs.current.get(id)?.getInstance())
    claimScrollDriver(driver, id)
  }, [])

  const scrollToFile = useCallback(
    (name: string) => {
      const targets = displayedPaneViews.map(({ pane, paneView }) => ({
        id: pane.id,
        instance: viewerRefs.current.get(pane.id)?.getInstance(),
        paneView,
      }))

      for (const target of targets) {
        if (target.instance && target.paneView.idByName.has(name)) {
          suppressProgrammaticScroll(suppressedUntil.current, target.id)
        }
      }

      return scrollPaneToFile(targets, name)
    },
    [displayedPaneViews]
  )

  return { handleScroll, markScrollDriver, scrollToFile, setViewerRef }
}

function cancelProgrammaticScroll(instance: CodeViewInstance | undefined) {
  if (!instance) return
  instance.scrollTo({
    type: "position",
    position: instance.getScrollTop(),
    behavior: "instant",
  })
}

function claimScrollDriver(
  driver: { current: { id: LaneId; until: number } | null },
  id: LaneId,
  now = Date.now()
) {
  driver.current = {
    id,
    until: now + USER_SCROLL_DRIVER_MS,
  }
}

function isScrollDriver(
  driver: { id: LaneId; until: number } | null,
  sourceId: LaneId,
  now = Date.now()
) {
  return !driver || driver.until <= now || driver.id === sourceId
}

export function suppressProgrammaticScroll(
  suppressedUntil: Map<LaneId, number>,
  id: LaneId,
  now = Date.now()
) {
  suppressedUntil.set(id, now + PROGRAMMATIC_SCROLL_SUPPRESSION_MS)
}

export function isProgrammaticScrollSuppressed(
  suppressedUntil: Map<LaneId, number>,
  id: LaneId,
  now = Date.now()
) {
  const until = suppressedUntil.get(id)
  if (!until) return false
  if (until > now) return true
  suppressedUntil.delete(id)
  return false
}
