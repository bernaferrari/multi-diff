import { describe, expect, it } from "vitest"

import { getFileFocusByOffset } from "./file-focus-state"
import { testFileRow } from "./test-builders"

describe("file focus state", () => {
  it("moves file focus relative to the focused or active file", () => {
    const rows = [testFileRow("a.ts"), testFileRow("b.ts"), testFileRow("c.ts")]

    expect(
      getFileFocusByOffset({
        activeFile: "a.ts",
        delta: 1,
        focusFile: null,
        rows,
      })
    ).toBe("b.ts")
    expect(
      getFileFocusByOffset({
        activeFile: null,
        delta: -1,
        focusFile: "a.ts",
        rows,
      })
    ).toBe("c.ts")
  })

  it("starts file focus at the first row when the current file is stale", () => {
    expect(
      getFileFocusByOffset({
        activeFile: "missing.ts",
        delta: -1,
        focusFile: null,
        rows: [testFileRow("a.ts"), testFileRow("b.ts")],
      })
    ).toBe("a.ts")
  })

  it("returns null when moving focus without visible file rows", () => {
    expect(
      getFileFocusByOffset({
        activeFile: null,
        delta: 1,
        focusFile: null,
        rows: [],
      })
    ).toBeNull()
  })
})
