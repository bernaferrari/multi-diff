import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { DiffStyleControl, LayoutModeControl } from "./toolbar-mode-controls"

describe("toolbar mode controls", () => {
  it("renders layout and diff style segmented controls from shared mode chrome", () => {
    const layoutHtml = renderToStaticMarkup(
      <LayoutModeControl layout="rows" onLayout={() => {}} />
    )
    const diffStyleHtml = renderToStaticMarkup(
      <DiffStyleControl diffStyle="split" onDiffStyle={() => {}} />
    )

    expect(layoutHtml).toContain("Columns")
    expect(layoutHtml).toContain("Rows")
    expect(layoutHtml).toContain('aria-pressed="true"')
    expect(diffStyleHtml).toContain("Unified")
    expect(diffStyleHtml).toContain("Split")
    expect(diffStyleHtml).toContain('aria-pressed="true"')
  })
})
