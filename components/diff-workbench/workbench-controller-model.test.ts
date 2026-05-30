import { describe, expect, it, vi } from "vitest"

import type { FileRow, ParsedPane } from "./types"
import {
  getFilesPanelView,
  getNotesView,
  getRenderSettings,
  getToolbarSettings,
  getViewportView,
} from "./workbench-controller-model"

describe("workbench controller model", () => {
  it("maps workbench state into render and toolbar settings", () => {
    const state = {
      diffStyle: "split",
      laneMarkerStyle: "letters",
      layout: "rows",
      lineNumbers: false,
      sidebarOpen: false,
      wrap: false,
    } as const

    expect(getRenderSettings({ ...state, resolvedTheme: "dark" })).toEqual({
      codeTheme: "dark",
      diffStyle: "split",
      lineNumbers: false,
      wrap: false,
    })
    expect(getRenderSettings({ ...state, resolvedTheme: "light" }).codeTheme).toBe(
      "light"
    )
    expect(getRenderSettings({ ...state, resolvedTheme: undefined }).codeTheme).toBe(
      "light"
    )
    expect(getRenderSettings({ ...state, resolvedTheme: "system" }).codeTheme).toBe(
      "light"
    )
    expect(getToolbarSettings(state)).toEqual(state)
  })

  it("builds file panel and viewport view contracts", () => {
    const rows: FileRow[] = [
      {
        additions: 1,
        deletions: 0,
        name: "app/new.ts",
        panes: {},
        presentIn: ["a", "c"],
      },
    ]
    const hiddenFileRows: FileRow[] = []
    const parsed: ParsedPane[] = []
    const hidden = new Set(["b"])
    const hiddenFiles = new Set(["app/old.ts"])
    const renderSettings = getRenderSettings({
      diffStyle: "unified",
      lineNumbers: true,
      resolvedTheme: "light",
      wrap: true,
    })

    expect(
      getFilesPanelView({
        activeFileByLane: { a: "app/old.ts", b: "app/other.ts" },
        allFileRows: rows,
        focused: "app/new.ts",
        focusMode: true,
        hiddenFileRows,
        indexActiveFile: "app/new.ts",
        parsed,
        sharedCount: 2,
        state: {
          fileQuery: "new",
          hidden,
          hiddenFiles,
          laneMarkerStyle: "bars",
          layout: "rows",
        },
      })
    ).toEqual({
      activeFileByLane: { a: "app/new.ts", c: "app/new.ts" },
      activeFile: "app/new.ts",
      focusMode: true,
      focusFile: "app/new.ts",
      hidden,
      hiddenFiles,
      hiddenFileRows,
      laneMarkerStyle: "bars",
      layout: "rows",
      panes: parsed,
      query: "new",
      rows,
      sharedCount: 2,
    })

    expect(
      getFilesPanelView({
        activeFileByLane: { a: "app/old.ts", c: "app/new.ts" },
        allFileRows: rows,
        focused: null,
        focusMode: false,
        hiddenFileRows,
        indexActiveFile: "app/new.ts",
        parsed,
        sharedCount: 2,
        state: {
          fileQuery: "new",
          hidden,
          hiddenFiles,
          laneMarkerStyle: "bars",
          layout: "rows",
        },
      }).activeFileByLane
    ).toEqual({ c: "app/new.ts" })

    expect(
      getViewportView({
        displayedPaneViews: [],
        hasErrors: false,
        navigationTarget: null,
        renderSettings,
        state: { layout: "columns" },
        visiblePanes: parsed,
      })
    ).toEqual({
      displayedPaneViews: [],
      hasErrors: false,
      layout: "columns",
      navigationTarget: null,
      renderSettings,
      visiblePanes: parsed,
    })
  })

  it("uses the first visible file as the initial tree selection", () => {
    const rows: FileRow[] = [
      {
        additions: 2,
        deletions: 0,
        name: "app/second.ts",
        panes: {},
        presentIn: ["c"],
      },
      {
        additions: 4,
        deletions: 1,
        name: "app/first.ts",
        panes: {},
        presentIn: ["a", "b"],
      },
    ]

    const view = getFilesPanelView({
      activeFileByLane: {},
      allFileRows: rows,
      focused: null,
      focusMode: false,
      hiddenFileRows: [],
      indexActiveFile: null,
      parsed: [],
      sharedCount: 1,
      state: {
        fileQuery: "",
        hidden: new Set(),
        hiddenFiles: new Set(),
        laneMarkerStyle: "letters",
        layout: "columns",
      },
    })

    expect(view.activeFile).toBe("app/first.ts")
    expect(view.activeFileByLane).toEqual({
      a: "app/first.ts",
      b: "app/first.ts",
    })

    expect(
      getFilesPanelView({
        activeFileByLane: { a: "stale.ts" },
        allFileRows: rows,
        focused: null,
        focusMode: false,
        hiddenFileRows: [],
        indexActiveFile: null,
        parsed: [],
        sharedCount: 1,
        state: {
          fileQuery: "",
          hidden: new Set(),
          hiddenFiles: new Set(),
          laneMarkerStyle: "letters",
          layout: "columns",
        },
      }).activeFileByLane
    ).toEqual({
      a: "app/first.ts",
      b: "app/first.ts",
    })
  })

  it("keeps note actions attached to the workbench setters", () => {
    const setNotes = vi.fn()
    const setNotesOpen = vi.fn()
    const notes = getNotesView(
      { notes: "watch query parser", notesOpen: true },
      { setNotes, setNotesOpen }
    )

    notes.onChange("done")
    notes.onClose()
    notes.onOpen()

    expect(notes.open).toBe(true)
    expect(notes.value).toBe("watch query parser")
    expect(setNotes).toHaveBeenCalledWith("done")
    expect(setNotesOpen).toHaveBeenCalledWith(false)
    expect(setNotesOpen).toHaveBeenCalledWith(true)
  })
})
