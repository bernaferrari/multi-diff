import { describe, expect, it } from "vitest"

import {
  getFocusModeToggleAction,
  getNavigationFallbackFile,
  getFocusModeNavigationTarget,
  getNavigationActiveFileByLane,
  getNavigationScrollLockUntil,
  getNextActiveFileByLane,
  getRowsLayoutNavigationTarget,
  initialWorkbenchNavigationState,
  isNavigationScrollLocked,
  NAVIGATION_SCROLL_SPY_LOCK_MS,
  reduceWorkbenchNavigationState,
} from "./workbench-navigation-state"

describe("workbench navigation state", () => {
  it("builds active files by lane from matching visible lanes", () => {
    expect(
      getNavigationActiveFileByLane({
        currentActiveFileByLane: { b: "old.ts" },
        displayedPaneViews: [
          paneLookup("a", ["shared.ts"]),
          paneLookup("b", ["other.ts"]),
          paneLookup("c", ["shared.ts"]),
        ],
        name: "shared.ts",
      })
    ).toEqual({
      a: "shared.ts",
      b: "old.ts",
      c: "shared.ts",
    })
  })

  it("seeds the visible default file before the first explicit navigation", () => {
    expect(
      getNavigationActiveFileByLane({
        currentActiveFileByLane: {},
        displayedPaneViews: [
          paneLookup("a", ["first.ts"]),
          paneLookup("b", ["first.ts", "second.ts"]),
          paneLookup("c", ["first.ts"]),
        ],
        fallbackName: "first.ts",
        name: "second.ts",
      })
    ).toEqual({
      a: "first.ts",
      b: "second.ts",
      c: "first.ts",
    })
  })

  it("does not overwrite established lane selections with fallback state", () => {
    expect(
      getNavigationActiveFileByLane({
        currentActiveFileByLane: { a: "chosen.ts" },
        displayedPaneViews: [
          paneLookup("a", ["fallback.ts", "chosen.ts"]),
          paneLookup("b", ["fallback.ts", "next.ts"]),
        ],
        fallbackName: "fallback.ts",
        name: "next.ts",
      })
    ).toEqual({
      a: "chosen.ts",
      b: "next.ts",
    })
  })

  it("updates only the source lane after local scrolling", () => {
    expect(
      getNextActiveFileByLane({
        current: { a: "old.ts" },
        name: "new.ts",
        sourceId: "b",
      })
    ).toEqual({
      a: "old.ts",
      b: "new.ts",
    })
  })

  it("reduces explicit navigation into one internal state transition", () => {
    const next = reduceWorkbenchNavigationState(
      initialWorkbenchNavigationState,
      {
        displayedPaneViews: [
          paneLookup("a", ["first.ts"]),
          paneLookup("b", ["first.ts", "second.ts"]),
        ],
        fallbackName: "first.ts",
        name: "second.ts",
        token: 1000,
        type: "activate",
      }
    )

    expect(next).toMatchObject({
      activeFileByLane: {
        a: "first.ts",
        b: "second.ts",
      },
      focusMode: false,
      navigationLockUntil: 1000 + NAVIGATION_SCROLL_SPY_LOCK_MS,
      navigationTarget: {
        name: "second.ts",
        token: 1000,
      },
      rowsNavigationFile: "second.ts",
    })
  })

  it("reduces scroll spy updates without resetting unrelated lanes", () => {
    const next = reduceWorkbenchNavigationState(
      {
        ...initialWorkbenchNavigationState,
        activeFileByLane: { a: "first.ts", c: "third.ts" },
        rowsNavigationFile: "first.ts",
      },
      {
        name: "second.ts",
        sourceId: "b",
        type: "scroll",
        updateRowsFile: true,
      }
    )

    expect(next.activeFileByLane).toEqual({
      a: "first.ts",
      b: "second.ts",
      c: "third.ts",
    })
    expect(next.rowsNavigationFile).toBe("second.ts")
  })

  it("locks scroll-spy updates for a short window after navigation", () => {
    const lockUntil = getNavigationScrollLockUntil(1000)

    expect(lockUntil).toBe(1000 + NAVIGATION_SCROLL_SPY_LOCK_MS)
    expect(isNavigationScrollLocked({ lockUntil, now: 1001 })).toBe(true)
    expect(isNavigationScrollLocked({ lockUntil, now: lockUntil })).toBe(false)
    expect(isNavigationScrollLocked({ lockUntil, now: lockUntil + 1 })).toBe(
      false
    )
  })

  it("selects the current visible file when focus mode turns on", () => {
    const fileRows = [fileRow("a.ts"), fileRow("b.ts")]

    expect(
      getFocusModeNavigationTarget({
        activeFile: "a.ts",
        activeFileByLane: {},
        fileRows,
        indexActiveFile: null,
        preferredFile: "b.ts",
      })
    ).toBe("b.ts")

    expect(
      getFocusModeNavigationTarget({
        activeFile: "b.ts",
        activeFileByLane: {},
        fileRows,
        indexActiveFile: "a.ts",
      })
    ).toBe("b.ts")

    expect(
      getFocusModeNavigationTarget({
        activeFile: null,
        activeFileByLane: { c: "b.ts" },
        fileRows,
        indexActiveFile: "a.ts",
      })
    ).toBe("b.ts")

    expect(
      getFocusModeNavigationTarget({
        activeFile: null,
        activeFileByLane: {},
        fileRows,
        indexActiveFile: "b.ts",
      })
    ).toBe("b.ts")
  })

  it("uses the active, indexed, or first tree file as navigation fallback", () => {
    const fileRows = [
      fileRow("components/result-list.tsx"),
      fileRow("app/api/search/route.ts"),
    ]

    expect(
      getNavigationFallbackFile({
        activeFile: "missing.ts",
        fileRows,
        indexActiveFile: "components/result-list.tsx",
      })
    ).toBe("components/result-list.tsx")

    expect(
      getNavigationFallbackFile({
        activeFile: null,
        fileRows,
        indexActiveFile: null,
      })
    ).toBe("app/api/search/route.ts")
  })

  it("uses the first visible tree file as the initial focus target", () => {
    expect(
      getFocusModeNavigationTarget({
        activeFile: "hidden.ts",
        activeFileByLane: { a: "hidden.ts" },
        fileRows: [
          fileRow("components/result-list.tsx"),
          fileRow("app/api/search/route.ts"),
        ],
        indexActiveFile: null,
      })
    ).toBe("app/api/search/route.ts")
  })

  it("repairs focus mode when it is enabled without a visible focused file", () => {
    const fileRows = [fileRow("route.ts"), fileRow("result-list.tsx")]

    expect(
      getFocusModeToggleAction({
        activeFile: "route.ts",
        activeFileByLane: {},
        fileRows,
        focusedFile: null,
        focusMode: true,
        indexActiveFile: "result-list.tsx",
      })
    ).toEqual({ name: "route.ts", type: "select" })
  })

  it("clears focus mode only when a visible file is already focused", () => {
    const fileRows = [fileRow("route.ts")]

    expect(
      getFocusModeToggleAction({
        activeFile: "route.ts",
        activeFileByLane: {},
        fileRows,
        focusedFile: "route.ts",
        focusMode: true,
        indexActiveFile: null,
      })
    ).toEqual({ type: "clear" })
  })

  it("preserves the best visible file when switching into rows layout", () => {
    const fileRows = [{ name: "a.ts" }, { name: "b.ts" }, { name: "c.ts" }]

    expect(
      getRowsLayoutNavigationTarget({
        activeFile: "a.ts",
        fileRows,
        indexActiveFile: "b.ts",
        rowsNavigationFile: "c.ts",
      })
    ).toBe("c.ts")

    expect(
      getRowsLayoutNavigationTarget({
        activeFile: "a.ts",
        fileRows,
        indexActiveFile: "b.ts",
        rowsNavigationFile: "missing.ts",
      })
    ).toBe("a.ts")

    expect(
      getRowsLayoutNavigationTarget({
        activeFile: "missing.ts",
        fileRows,
        indexActiveFile: "b.ts",
        rowsNavigationFile: null,
      })
    ).toBe("b.ts")

    expect(
      getRowsLayoutNavigationTarget({
        activeFile: null,
        fileRows,
        indexActiveFile: "missing.ts",
        rowsNavigationFile: null,
      })
    ).toBeNull()
  })
})

function paneLookup(id: "a" | "b" | "c", files: string[]) {
  return {
    pane: { id },
    paneView: {
      idByName: new Map(files.map((name) => [name, name])),
    },
  }
}

function fileRow(name: string) {
  return {
    additions: 1,
    deletions: 0,
    name,
    panes: {},
    presentIn: ["a" as const],
  }
}
