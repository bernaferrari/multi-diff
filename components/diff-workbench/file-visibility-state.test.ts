import { describe, expect, it } from "vitest"

import {
  clearSelectionIfHidden,
  getFileNameSelection,
  getFileVisibilityPatch,
  getHiddenFileNameState,
  hideFileNames,
  showFileNames,
} from "./file-visibility-state"

describe("file visibility state", () => {
  it("adds and removes hidden file names without mutating the original set", () => {
    const original = new Set(["a.ts"])
    const hidden = hideFileNames(original, ["b.ts", "c.ts"])
    const restored = showFileNames(hidden, ["a.ts", "c.ts"])

    expect([...original]).toEqual(["a.ts"])
    expect([...hidden].sort()).toEqual(["a.ts", "b.ts", "c.ts"])
    expect([...restored]).toEqual(["b.ts"])
  })

  it("clears focused selections when a hidden file contains them", () => {
    const hidden = new Set(["hidden.ts"])

    expect(clearSelectionIfHidden("hidden.ts", hidden)).toBeNull()
    expect(clearSelectionIfHidden("visible.ts", hidden)).toBe("visible.ts")
  })

  it("normalizes file name selections and treats empty selections as absent", () => {
    expect(getFileNameSelection([])).toBeNull()
    expect([...(getFileNameSelection(["a.ts", "a.ts", "b.ts"]) ?? [])]).toEqual(
      ["a.ts", "b.ts"]
    )
  })

  it("builds a reusable visibility patch from a non-empty selection", () => {
    const patch = getFileVisibilityPatch(["a.ts", "b.ts"])

    expect(patch?.hide(new Set(["c.ts"]))).toEqual(
      new Set(["a.ts", "b.ts", "c.ts"])
    )
    expect(patch?.show(new Set(["a.ts", "b.ts", "c.ts"]))).toEqual(
      new Set(["c.ts"])
    )
    expect(patch?.clearSelection("a.ts")).toBeNull()
    expect(patch?.clearSelection("c.ts")).toBe("c.ts")
    expect(getFileVisibilityPatch([])).toBeNull()
  })

  it("derives hidden file-name state for grouped file actions", () => {
    expect(
      getHiddenFileNameState(["a.ts", "b.ts"], new Set(["b.ts"]))
    ).toEqual({
      allHidden: false,
      hiddenCount: 1,
      hiddenNames: ["b.ts"],
      partiallyHidden: true,
    })

    expect(getHiddenFileNameState(["a.ts"], new Set(["a.ts"]))).toEqual({
      allHidden: true,
      hiddenCount: 1,
      hiddenNames: ["a.ts"],
      partiallyHidden: false,
    })

    expect(getHiddenFileNameState([], new Set())).toMatchObject({
      allHidden: false,
      hiddenCount: 0,
      partiallyHidden: false,
    })
  })
})
