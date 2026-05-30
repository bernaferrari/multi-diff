import { describe, expect, it } from "vitest"

import { getEqualColumnGridStyle, getEqualColumnTemplate } from "./grid-layout"

describe("grid layout", () => {
  it("keeps at least one equal-width grid track", () => {
    expect(getEqualColumnTemplate(0)).toBe("repeat(1, minmax(0, 1fr))")
    expect(getEqualColumnTemplate(3)).toBe("repeat(3, minmax(0, 1fr))")
  })

  it("builds a React style object for equal-width grid tracks", () => {
    expect(getEqualColumnGridStyle(2)).toEqual({
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    })
  })
})
