import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { FilesPanel } from "./files-panel"
import type { FilesPanelActions, FilesPanelView } from "./files-panel-model"

describe("FilesPanel", () => {
  it("fills the sidebar shell height and constrains internal scrolling", () => {
    const html = renderToStaticMarkup(
      createElement(FilesPanel, {
        actions: emptyActions,
        view: emptyView,
      })
    )

    expect(html).toContain("h-full")
    expect(html).toContain("min-h-0")
    expect(html).toContain("overflow-hidden")
  })
})

const emptyView: FilesPanelView = {
  activeFileByLane: {},
  activeFile: null,
  focusableRows: [],
  focusMode: false,
  focusFile: null,
  hidden: new Set(),
  hiddenFiles: new Set(),
  hiddenFileRows: [],
  laneMarkerStyle: "letters",
  layout: "columns",
  panes: [],
  query: "",
  rows: [],
  sharedCount: 0,
}

const emptyActions: FilesPanelActions = {
  onFilterFile: () => {},
  onHideFiles: () => {},
  onNavigate: () => {},
  onOverview: () => {},
  onQuery: () => {},
  onShowAllFiles: () => {},
  onShowFiles: () => {},
  onToggleFocusMode: () => {},
  onToggleLane: () => {},
}
