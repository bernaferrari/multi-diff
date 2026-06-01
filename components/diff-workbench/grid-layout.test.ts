import { describe, expect, it } from "vitest"

import { getEqualColumnGridStyle } from "./grid-layout"

describe("grid layout", () => {
  it("keeps at least one equal-width grid track", () => {
    expect(getEqualColumnGridStyle(0)).toEqual({
      gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    })
    expect(getEqualColumnGridStyle(3)).toEqual({
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    })
  })

  it("builds a React style object for equal-width grid tracks", () => {
    expect(getEqualColumnGridStyle(2)).toEqual({
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    })
  })
})
