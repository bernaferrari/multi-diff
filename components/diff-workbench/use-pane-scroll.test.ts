import { describe, expect, it, vi } from "vitest"

import { testFileDiff, testPaneView } from "./test-builders"
import {
  isProgrammaticScrollSuppressed,
  type PaneScrollTarget,
  scrollMatchingPaneTargets,
  scrollPaneToFile,
  suppressProgrammaticScroll,
} from "./use-pane-scroll"

describe("pane scroll helpers", () => {
  it("scrolls matching target panes to the requested file offset", () => {
    const scrollA = vi.fn()
    const scrollB = vi.fn()
    const scrollC = vi.fn()
    const onTargetScroll = vi.fn()
    const targets: PaneScrollTarget[] = [
      target("a", ["route.ts"], scrollA),
      target("b", ["route.ts"], scrollB),
      target("c", ["other.ts"], scrollC),
    ]

    scrollMatchingPaneTargets({
      activeFile: { name: "route.ts", intraOffset: 72 },
      onTargetScroll,
      sourceId: "a",
      targets,
    })

    expect(scrollA).not.toHaveBeenCalled()
    expect(scrollB).toHaveBeenCalledWith({
      type: "item",
      id: "b-0-route.ts",
      align: "start",
      offset: 72,
      behavior: "instant",
    })
    expect(scrollC).not.toHaveBeenCalled()
    expect(onTargetScroll).toHaveBeenCalledWith("b")
    expect(onTargetScroll).not.toHaveBeenCalledWith("a")
  })

  it("scrolls the first pane containing a requested file and matching panes", () => {
    const scrollA = vi.fn()
    const scrollB = vi.fn()
    const targets: PaneScrollTarget[] = [
      target("a", ["route.ts"], scrollA),
      target("b", ["route.ts"], scrollB),
    ]

    expect(scrollPaneToFile(targets, "route.ts")).toBe(true)

    expect(scrollA).toHaveBeenCalledWith({
      type: "item",
      id: "a-0-route.ts",
      align: "start",
      offset: 0,
      behavior: "instant",
    })
    expect(scrollB).toHaveBeenCalledWith({
      type: "item",
      id: "b-0-route.ts",
      align: "start",
      offset: 0,
      behavior: "instant",
    })
  })

  it("does nothing when no visible pane contains the requested file", () => {
    const scrollTo = vi.fn()

    expect(scrollPaneToFile([target("a", ["route.ts"], scrollTo)], "x.ts")).toBe(
      false
    )
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it("suppresses programmatic target scroll events briefly", () => {
    const suppressed = new Map()

    suppressProgrammaticScroll(suppressed, "b", 1000)

    expect(isProgrammaticScrollSuppressed(suppressed, "b", 2000)).toBe(true)
    expect(isProgrammaticScrollSuppressed(suppressed, "b", 2500)).toBe(false)
    expect(suppressed.has("b")).toBe(false)
  })
})

function target(
  id: string,
  fileNames: string[],
  scrollTo: ReturnType<typeof vi.fn>
): PaneScrollTarget {
  return {
    id,
    instance: { scrollTo } as unknown as PaneScrollTarget["instance"],
    paneView: testPaneView(
      id,
      fileNames.map((fileName) => testFileDiff(fileName, 1, 1))
    ),
  }
}
