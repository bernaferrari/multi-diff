import { describe, expect, it } from "vitest"

import {
  getDirectoryMenuState,
  getFilesContextMenuState,
} from "./files-context-menu-state"
import { testFileRow } from "./test-builders"

const RESTORE_LIMIT = 6

describe("files context menu state", () => {
  it("derives directory hide and restore state", () => {
    expect(
      getDirectoryMenuState(
        { label: "lib", names: ["lib/a.ts", "lib/b.ts"] },
        new Set(["lib/a.ts"])
      )
    ).toEqual({
      allHidden: false,
      hiddenNames: ["lib/a.ts"],
      someHidden: true,
    })

    expect(
      getDirectoryMenuState(
        { label: "lib", names: ["lib/a.ts", "lib/b.ts"] },
        new Set(["lib/a.ts", "lib/b.ts"])
      )
    ).toMatchObject({
      allHidden: true,
      someHidden: true,
    })
  })

  it("does not treat an empty directory as all hidden", () => {
    expect(
      getDirectoryMenuState({ label: "empty", names: [] }, new Set())
    ).toEqual({
      allHidden: false,
      hiddenNames: [],
      someHidden: false,
    })
  })

  it("derives context menu visibility from primary and restore actions", () => {
    const hiddenRow = testFileRow("hidden.ts")

    expect(
      getFilesContextMenuState({
        contextDirectory: null,
        contextFile: null,
        hiddenFileRows: [],
        restorableRows: [],
      })
    ).toEqual({
      hasPrimaryAction: false,
      hasRestoreAction: false,
      restoreMenu: {
        overflowLabel: null,
        restoreRows: [],
        showRestoreAll: false,
      },
      shouldRender: false,
      showSeparator: false,
    })

    expect(
      getFilesContextMenuState({
        contextDirectory: null,
        contextFile: "app/a.ts",
        hiddenFileRows: [hiddenRow],
        restorableRows: [hiddenRow],
      })
    ).toMatchObject({
      hasPrimaryAction: true,
      hasRestoreAction: true,
      shouldRender: true,
      showSeparator: true,
    })

    expect(
      getFilesContextMenuState({
        contextDirectory: null,
        contextFile: null,
        hiddenFileRows: [hiddenRow],
        restorableRows: [hiddenRow],
      })
    ).toMatchObject({
      hasPrimaryAction: false,
      hasRestoreAction: true,
      shouldRender: true,
      showSeparator: false,
    })
  })

  it("limits restore rows and uses overflow copy when many files are hidden", () => {
    const rows = Array.from({ length: RESTORE_LIMIT + 1 }, (_, index) =>
      testFileRow(`file-${index}.ts`)
    )

    expect(
      getFilesContextMenuState({
        contextDirectory: null,
        contextFile: null,
        hiddenFileRows: rows,
        restorableRows: rows.slice(0, 2),
      }).restoreMenu
    ).toMatchObject({
      overflowLabel: `Show all ${RESTORE_LIMIT + 1} hidden files`,
      restoreRows: rows.slice(0, 2),
      showRestoreAll: false,
    })
    expect(
      getFilesContextMenuState({
        contextDirectory: null,
        contextFile: null,
        hiddenFileRows: rows,
        restorableRows: rows,
      }).restoreMenu.restoreRows
    ).toHaveLength(RESTORE_LIMIT)
  })

  it("offers restore all when there is no overflow", () => {
    const rows = [testFileRow("a.ts"), testFileRow("b.ts")]

    expect(
      getFilesContextMenuState({
        contextDirectory: null,
        contextFile: null,
        hiddenFileRows: rows,
        restorableRows: rows,
      }).restoreMenu
    ).toMatchObject({
      overflowLabel: null,
      showRestoreAll: true,
    })
  })
})
