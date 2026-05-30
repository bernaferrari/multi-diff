import { describe, expect, it } from "vitest"

import { DISPLAY_OPTIONS } from "./display-options"

describe("display options", () => {
  it("keeps display controls in the expected order", () => {
    expect(DISPLAY_OPTIONS.map((option) => option.key)).toEqual([
      "wrap",
      "lineNumbers",
    ])
  })

  it("keeps display controls labeled for the popover", () => {
    expect(DISPLAY_OPTIONS.map((option) => option.label)).toEqual([
      "Wrap lines",
      "Line numbers",
    ])
    expect(DISPLAY_OPTIONS.every((option) => option.description.length > 0)).toBe(
      true
    )
  })
})
