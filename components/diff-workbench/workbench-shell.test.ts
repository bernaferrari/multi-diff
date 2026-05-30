import { describe, expect, it } from "vitest"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { WorkbenchShell } from "./workbench-shell"

describe("workbench shell classes", () => {
  function renderShell(sidebarOpen: boolean) {
    return renderToStaticMarkup(
      createElement(WorkbenchShell, {
        sidebar: createElement("aside", null, "Sidebar"),
        sidebarOpen,
        viewport: createElement("main", null, "Viewport"),
      })
    )
  }

  it("opens and closes the sidebar grid track", () => {
    expect(renderShell(true)).toContain("grid-cols-[16rem_minmax(0,1fr)]")
    expect(renderShell(false)).toContain("grid-cols-[0rem_minmax(0,1fr)]")
  })

  it("keeps the closed sidebar non-interactive", () => {
    expect(renderShell(true)).toContain("opacity-100")
    expect(renderShell(false)).toContain("pointer-events-none")
  })
})
