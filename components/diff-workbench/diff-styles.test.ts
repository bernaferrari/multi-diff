import { describe, expect, it } from "vitest"

import { diffStyleVariables } from "./diff-styles"

describe("diff styles", () => {
  it("keeps diff renderer CSS variables centralized", () => {
    expect(diffStyleVariables).toMatchObject({
      "--diffs-font-family": "var(--font-mono)",
      "--diffs-font-size": "12.5px",
      "--diffs-line-height": "20px",
    })
  })
})
