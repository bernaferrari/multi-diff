import { describe, expect, it } from "vitest"

import { compactSeparatorCSS } from "./diff-separator-css"

describe("diff separator css", () => {
  it("keeps rich and simple hunk separators compact and flat", () => {
    expect(compactSeparatorCSS).toContain('[data-separator="line-info"]')
    expect(compactSeparatorCSS).toContain('[data-separator="line-info-basic"]')
    expect(compactSeparatorCSS).toContain('[data-separator="metadata"]')
    expect(compactSeparatorCSS).toContain("height: 16px !important")
    expect(compactSeparatorCSS).toContain("border-radius: 0 !important")
    expect(compactSeparatorCSS).toContain("padding: 0 !important")
    expect(compactSeparatorCSS).toContain("background: transparent !important")
    expect(compactSeparatorCSS).toContain("position: relative !important")
    expect(compactSeparatorCSS).toContain("@supports (width: 1cqi)")
    expect(compactSeparatorCSS).toContain("justify-content: center !important")
    expect(compactSeparatorCSS).toContain("color-mix(in oklch, var(--diffs-fg-number) 58%, transparent)")
    expect(compactSeparatorCSS).toContain('[data-separator="simple"]')
    expect(compactSeparatorCSS).toContain("height: 2px !important")
  })
})
