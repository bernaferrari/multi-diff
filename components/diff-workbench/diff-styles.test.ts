import { describe, expect, it } from "vitest"

import { diffStyleVariables, laneColumnStyle } from "./diff-styles"

describe("diff styles", () => {
  it("caps column lane height to the viewport while allowing shorter content", () => {
    expect(laneColumnStyle(320)).toEqual({
      height: "min(100%, 320px)",
    })
  })

  it("keeps diff renderer CSS variables centralized", () => {
    expect(diffStyleVariables).toMatchObject({
      "--diffs-font-family": "var(--font-mono)",
      "--diffs-font-size": "12.5px",
      "--diffs-line-height": "20px",
    })
  })
})
