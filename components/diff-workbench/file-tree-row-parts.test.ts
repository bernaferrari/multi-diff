import { describe, expect, it } from "vitest"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { HighlightMatch } from "./file-tree-row-parts"

describe("file tree row parts", () => {
  it("highlights matching text inside file names", () => {
    const html = renderToStaticMarkup(
      createElement(HighlightMatch, { text: "search.ts", query: "ar" })
    )

    expect(html).toContain("se")
    expect(html).toContain("<mark")
    expect(html).toContain(">ar</mark>")
    expect(html).toContain("ch.ts")
  })

  it("matches case-insensitively while preserving original text", () => {
    expect(
      renderToStaticMarkup(
        createElement(HighlightMatch, { text: "Route.ts", query: "ro" })
      )
    ).toContain(">Ro</mark>ute.ts")
  })

  it("returns the original text for blank queries", () => {
    expect(
      renderToStaticMarkup(
        createElement(HighlightMatch, { text: "route.ts", query: "  " })
      )
    ).toBe("route.ts")
  })

})
