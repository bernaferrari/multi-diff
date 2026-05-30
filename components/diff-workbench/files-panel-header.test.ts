import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { FilesPanelHeader } from "./files-panel-header"

describe("files panel header", () => {
  function renderHeader(
    props: Partial<Parameters<typeof FilesPanelHeader>[0]> = {}
  ) {
    return renderToStaticMarkup(
      createElement(FilesPanelHeader, {
        activeFile: null,
        focusFile: null,
        focusMode: false,
        hidden: new Set<string>(),
        panes: [{ id: "a", label: "Diff A" }],
        query: "",
        sharedCount: 0,
        visibleCount: 1,
        onOverview: () => {},
        onQuery: () => {},
        onToggleLane: () => {},
        onToggleFocusMode: () => {},
        ...props,
      })
    )
  }

  it("labels the file filter input beyond placeholder text", () => {
    const html = renderHeader()

    expect(html).toContain('aria-label="Filter files"')
    expect(html).toContain('placeholder="Filter files..."')
  })

  it("renders overview counts with a shared-count title when available", () => {
    expect(renderHeader({ sharedCount: 0, visibleCount: 5 })).toContain(
      ">5</span>"
    )
    expect(renderHeader({ sharedCount: 0, visibleCount: 5 })).not.toContain(
      "changed in every lane"
    )
    expect(renderHeader({ sharedCount: 1, visibleCount: 5 })).toContain(
      'title="1 file changed in every lane"'
    )
    expect(renderHeader({ sharedCount: 3, visibleCount: 5 })).toContain(
      'title="3 files changed in every lane"'
    )
  })

  it("renders the focused all-files action instead of overview count", () => {
    const html = renderHeader({
      focusFile: "app/a.ts",
      sharedCount: 3,
      visibleCount: 8,
    })

    expect(html).toContain(">All files</button>")
    expect(html).not.toContain('title="3 files changed in every lane"')
  })
})
