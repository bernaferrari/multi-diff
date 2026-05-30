import { describe, expect, it, vi } from "vitest"

import {
  getFilesPanelActions,
  getToolbarActions,
  getViewportActions,
} from "./workbench-controller-actions"

describe("workbench controller actions", () => {
  it("builds toolbar action contracts", () => {
    const resetWorkbench = vi.fn()
    const setters = {
      setDiffStyle: vi.fn(),
      setLaneMarkerStyle: vi.fn(),
      setLayout: vi.fn(),
      setLineNumbers: vi.fn(),
      setSidebarOpen: vi.fn(),
      setWrap: vi.fn(),
    }
    const toolbar = getToolbarActions({
      actions: { resetWorkbench },
      setters,
    })

    toolbar.onReset()
    toolbar.setLaneMarkerStyle("bars")
    toolbar.setWrap(true)

    expect(resetWorkbench).toHaveBeenCalledOnce()
    expect(setters.setLaneMarkerStyle).toHaveBeenCalledWith("bars")
    expect(setters.setWrap).toHaveBeenCalledWith(true)
  })

  it("builds files panel action contracts", () => {
    const actions = {
      clearFocusedFile: vi.fn(),
      hideFiles: vi.fn(),
      navigateFile: vi.fn(),
      showAllFiles: vi.fn(),
      showFiles: vi.fn(),
      toggleFocusFile: vi.fn(),
      toggleFocusMode: vi.fn(),
      toggleLane: vi.fn(),
    }
    const setters = { setFileQuery: vi.fn() }
    const filesPanel = getFilesPanelActions({ actions, setters })

    filesPanel.onNavigate("app/a.ts")
    filesPanel.onFilterFile("app/b.ts")
    filesPanel.onQuery("route")
    filesPanel.onOverview()
    filesPanel.onToggleFocusMode()

    expect(actions.navigateFile).toHaveBeenCalledWith("app/a.ts")
    expect(actions.toggleFocusFile).toHaveBeenCalledWith("app/b.ts")
    expect(setters.setFileQuery).toHaveBeenCalledWith("route")
    expect(actions.clearFocusedFile).toHaveBeenCalledOnce()
    expect(actions.toggleFocusMode).toHaveBeenCalledOnce()
  })

  it("builds viewport action contracts", () => {
    const actions = {
      clearLaneDiff: vi.fn(),
      importFiles: vi.fn(),
      moveLaneDiff: vi.fn(),
      toggleLane: vi.fn(),
    }
    const onPaneScroll = vi.fn()
    const onPaneScrollIntent = vi.fn()
    const onRowsActiveFileChange = vi.fn()
    const onViewerRef = vi.fn()
    const viewport = getViewportActions({
      actions,
      onPaneScroll,
      onPaneScrollIntent,
      onRowsActiveFileChange,
      onViewerRef,
    })

    viewport.onClearLaneDiff("a")
    viewport.onHideLane("b")
    viewport.onImportFiles(null, "c")
    viewport.onMoveLane("c", "b")
    viewport.onPaneScrollIntent("c")
    viewport.onRowsActiveFileChange("app/a.ts", "a")

    expect(actions.clearLaneDiff).toHaveBeenCalledWith("a")
    expect(actions.toggleLane).toHaveBeenCalledWith("b")
    expect(actions.importFiles).toHaveBeenCalledWith(null, "c")
    expect(actions.moveLaneDiff).toHaveBeenCalledWith("c", "b")
    expect(onPaneScrollIntent).toHaveBeenCalledWith("c")
    expect(onRowsActiveFileChange).toHaveBeenCalledWith("app/a.ts", "a")
  })
})
