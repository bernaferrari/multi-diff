import { describe, expect, it, vi } from "vitest"

import type { ToolbarActions } from "./toolbar"
import { getDisplayPopoverState } from "./toolbar-state"

describe("toolbar", () => {
  it("maps toolbar state into display popover state", () => {
    const actions: ToolbarActions = {
      onImportFiles: vi.fn(),
      onReset: vi.fn(),
      setDiffStyle: vi.fn(),
      setLaneMarkerStyle: vi.fn(),
      setLayout: vi.fn(),
      setLineNumbers: vi.fn(),
      setSidebarOpen: vi.fn(),
      setWrap: vi.fn(),
    }

    expect(
      getDisplayPopoverState({
        actions,
        settings: {
          diffStyle: "unified",
          laneMarkerStyle: "bars",
          layout: "columns",
          lineNumbers: true,
          sidebarOpen: true,
          wrap: true,
        },
      })
    ).toEqual({
      actions: {
        lineNumbers: actions.setLineNumbers,
        setLaneMarkerStyle: actions.setLaneMarkerStyle,
        wrap: actions.setWrap,
      },
      settings: {
        lineNumbers: true,
        laneMarkerStyle: "bars",
        layout: "columns",
        wrap: true,
      },
    })
  })
})
