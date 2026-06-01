import { describe, expect, it } from "vitest"

import { getFileTreeRowChrome } from "./file-tree-row-state"
import type { FileRow } from "./types"

describe("file tree row state", () => {
  it("builds a compact file title from row metadata", () => {
    const row: FileRow = {
      additions: 12,
      deletions: 3,
      name: "app/search.ts",
      panes: {},
      presentIn: ["a", "c"],
    }

    expect(
      getFileTreeRowChrome({
        activeFile: null,
        focusFile: null,
        hidden: false,
        row,
      })
    ).toMatchObject({
      ariaLabel: "app/search.ts, changed in A, C, 12 additions, 3 deletions",
      title: "app/search.ts\nin A, C · +12 −3",
    })
  })

  it("prioritizes hidden, focused, and active row tones", () => {
    expect(
      getFileTreeRowChrome({
        activeFile: "a.ts",
        focusFile: "a.ts",
        hidden: true,
        row: testRow("a.ts"),
      }).className
    ).toContain("opacity-60")
    expect(
      getFileTreeRowChrome({
        activeFile: null,
        focusFile: "a.ts",
        hidden: false,
        row: testRow("a.ts"),
      }).className
    ).toContain("bg-foreground/10")
    expect(
      getFileTreeRowChrome({
        activeFile: "a.ts",
        focusFile: null,
        hidden: false,
        row: testRow("a.ts"),
      }).className
    ).toContain("text-foreground")
    expect(
      getFileTreeRowChrome({
        activeFile: null,
        activeLaneIds: ["a", "b"],
        focusFile: null,
        hidden: false,
        row: testRow("a.ts"),
      }).activeBorderStyle?.boxShadow
    ).toBeUndefined()
    expect(
      getFileTreeRowChrome({
        activeFile: null,
        activeLaneIds: ["a", "b"],
        focusFile: null,
        hidden: false,
        row: testRow("a.ts"),
      }).activeBorderStyle?.background
    ).toContain("var(--lane-a)")
  })

  it("builds active border gradients from fallback or active lanes", () => {
    const fallbackStyle = getFileTreeRowChrome({
      activeFile: "a.ts",
      activeLaneIds: [],
      focusFile: null,
      hidden: false,
      row: {
        ...testRow("a.ts"),
        presentIn: ["c"],
      },
    }).activeBorderStyle

    expect(fallbackStyle?.background).toContain("var(--lane-c)")
    expect(fallbackStyle?.padding).toBe(1)
    expect(fallbackStyle?.maskComposite).toBe("exclude")

    const activeStyle = getFileTreeRowChrome({
      activeFile: null,
      activeLaneIds: ["a", "a", "b", "c", "d", "e"],
      focusFile: null,
      hidden: false,
      row: {
        ...testRow("a.ts"),
        presentIn: ["c"],
      },
    }).activeBorderStyle

    expect(activeStyle?.background).toContain("var(--lane-a)")
    expect(activeStyle?.background).toContain("var(--lane-e)")
    expect(activeStyle?.background).not.toContain("var(--lane-c), var(--lane-c)")
  })
})

function testRow(name: string): FileRow {
  return {
    additions: 1,
    deletions: 0,
    name,
    panes: {},
    presentIn: ["a"],
  }
}
