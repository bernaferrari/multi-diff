import { describe, expect, it } from "vitest"

import {
  getDirectoryHiddenState,
  getDirectoryTreeRowChrome,
  getFileTreeRowChrome,
  getTreeRowIndent,
} from "./file-tree-row-state"
import type { FileRow } from "./types"

describe("file tree row state", () => {
  it("distinguishes visible, partially hidden, and fully hidden directories", () => {
    expect(getDirectoryHiddenState(["a.ts", "b.ts"], new Set())).toMatchObject({
      fullyHidden: false,
      hiddenCount: 0,
      partiallyHidden: false,
    })

    expect(
      getDirectoryHiddenState(["a.ts", "b.ts"], new Set(["a.ts"]))
    ).toMatchObject({
      fullyHidden: false,
      hiddenCount: 1,
      partiallyHidden: true,
    })

    expect(
      getDirectoryHiddenState(["a.ts", "b.ts"], new Set(["a.ts", "b.ts"]))
    ).toMatchObject({
      fullyHidden: true,
      hiddenCount: 2,
      partiallyHidden: false,
    })
  })

  it("does not treat an empty directory as fully hidden", () => {
    expect(getDirectoryHiddenState([], new Set())).toMatchObject({
      fullyHidden: false,
      hiddenCount: 0,
      partiallyHidden: false,
    })
  })

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

  it("formats directory titles by expansion state", () => {
    expect(
      getDirectoryTreeRowChrome({
        collapsed: true,
        fullyHidden: false,
        hasSummary: false,
        partiallyHidden: false,
        path: "app/api",
      })
    ).toMatchObject({
      ariaLabel: "Expand folder app/api",
        className: expect.stringContaining("font-medium"),
        title: "Expand app/api",
    })

    expect(
      getDirectoryTreeRowChrome({
        collapsed: false,
        fullyHidden: false,
        hasSummary: false,
        partiallyHidden: false,
        path: "app/api",
      })
    ).toMatchObject({
      ariaLabel: "Collapse folder app/api",
      title: "Collapse app/api",
    })
  })

  it("keeps tree indentation consistent", () => {
    expect(getTreeRowIndent(0)).toEqual({ paddingLeft: 6 })
    expect(getTreeRowIndent(2)).toEqual({ paddingLeft: 30 })
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

  it("maps directory hidden states to visual classes", () => {
    expect(
      getDirectoryTreeRowChrome({
        collapsed: false,
        fullyHidden: true,
        hasSummary: false,
        partiallyHidden: false,
        path: "components",
      }).className
    ).toContain("opacity-60")
    expect(
      getDirectoryTreeRowChrome({
        collapsed: false,
        fullyHidden: false,
        hasSummary: false,
        partiallyHidden: true,
        path: "components",
      }).hiddenIconClass
    ).toContain("opacity-55")
    expect(
      getDirectoryTreeRowChrome({
        collapsed: false,
        fullyHidden: true,
        hasSummary: false,
        partiallyHidden: false,
        path: "components",
      }).hiddenIconClass
    ).toBe("size-3 shrink-0")
  })

  it("builds directory row chrome from expansion and hidden state", () => {
    expect(
      getDirectoryTreeRowChrome({
        collapsed: true,
        fullyHidden: false,
        hasSummary: true,
        partiallyHidden: true,
        path: "components",
      })
    ).toMatchObject({
      ariaLabel: "Expand folder components",
      hiddenIconClass: "size-3 shrink-0 opacity-55",
      showSummary: true,
      title: "Expand components",
    })

    expect(
      getDirectoryTreeRowChrome({
        collapsed: false,
        fullyHidden: true,
        hasSummary: true,
        partiallyHidden: false,
        path: "components",
      })
    ).toMatchObject({
      ariaLabel: "Collapse folder components",
      hiddenIconClass: "size-3 shrink-0",
      showSummary: false,
      title: "Collapse components",
    })
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
