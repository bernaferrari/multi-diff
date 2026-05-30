import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { FileTypeIcon, TreeIconSprite } from "./file-icons"

describe("file icons", () => {
  it("renders tree icon metadata as svg markup", () => {
    const html = renderToStaticMarkup(
      createElement(FileTypeIcon, { path: "components/result-list.tsx" })
    )

    expect(html).toContain("text-[#61dafb]")
    expect(html).toContain("<use")
    expect(html).not.toContain('href="##')
  })

  it("falls back to muted text for unknown icon tokens", () => {
    const html = renderToStaticMarkup(
      createElement(FileTypeIcon, { path: "unknown.filetype" })
    )

    expect(html).toContain("text-muted-foreground")
  })

  it("renders the shared file icon sprite sheet once", () => {
    const html = renderToStaticMarkup(createElement(TreeIconSprite))

    expect(html).toContain("data-icon-sprite")
  })
})
