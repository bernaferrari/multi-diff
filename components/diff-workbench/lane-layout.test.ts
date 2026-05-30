import { describe, expect, it } from "vitest"

import {
  DIFF_FILE_HEADER_HEIGHT,
  DIFF_LINE_HEIGHT_PX,
} from "./diff-render-metrics"
import { getLaneContentKind, getLaneLayoutState } from "./lane-layout"
import { testFileDiff, testPaneView } from "./test-builders"

describe("lane layout", () => {
  it("keeps empty column lanes compact", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: true,
        layout: "columns",
        view: testPaneView("a", []),
      }).columnHeight
    ).toBe(192)
  })

  it("prioritizes lane content states before layout rendering", () => {
    expect(
      getLaneContentKind({
        hasError: true,
        isEmpty: true,
        layout: "columns",
      })
    ).toBe("error")
    expect(
      getLaneContentKind({
        hasError: false,
        isEmpty: true,
        layout: "rows",
      })
    ).toBe("empty")
    expect(
      getLaneContentKind({
        hasError: false,
        isEmpty: false,
        layout: "rows",
      })
    ).toBe("rows")
    expect(
      getLaneContentKind({
        hasError: false,
        isEmpty: false,
        layout: "columns",
      })
    ).toBe("columns")
  })

  it("uses estimated diff height for populated column lanes", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "columns",
        view: testPaneView("a", [testFileDiff("app/a.ts", 2, 1)]),
      }).columnHeight
    ).toBe(44 + DIFF_FILE_HEADER_HEIGHT + 9 * DIFF_LINE_HEIGHT_PX)
  })

  it("builds lane shell classes from state", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: true,
        layout: "columns",
        view: testPaneView("a", []),
      }).sectionClass
    ).toContain("border-dashed")

    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "rows",
        view: testPaneView("a", [testFileDiff("app/a.ts", 2, 1)]),
      }).sectionClass
    ).toContain("overflow-clip")
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "rows",
        view: testPaneView("a", [testFileDiff("app/a.ts", 2, 1)]),
      }).sectionClass
    ).toContain("rounded-xl")
  })

  it("only applies explicit lane height in column mode", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "columns",
        view: testPaneView("a", [testFileDiff("app/a.ts", 2, 1)]),
      }).sectionStyle
    ).toEqual({
      height: `min(100%, ${44 + DIFF_FILE_HEADER_HEIGHT + 9 * DIFF_LINE_HEIGHT_PX}px)`,
    })
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "rows",
        view: testPaneView("a", [testFileDiff("app/a.ts", 2, 1)]),
      }).sectionStyle
    ).toBeUndefined()
  })

  it("builds lane body classes from state", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: true,
        layout: "columns",
        view: testPaneView("a", []),
      }).bodyClass
    ).toContain("shrink-0")
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "rows",
        view: testPaneView("a", [testFileDiff("app/a.ts", 2, 1)]),
      }).bodyClass
    ).toContain("block")
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "columns",
        view: testPaneView("a", [testFileDiff("app/a.ts", 2, 1)]),
      }).bodyClass
    ).toContain("flex-1")
  })
})
