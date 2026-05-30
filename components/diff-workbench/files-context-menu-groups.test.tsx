import { renderToStaticMarkup } from "react-dom/server"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"

import { ContextMenu } from "@/components/ui/context-menu"

import {
  DirectoryContextMenuGroup,
  FileContextMenuGroup,
  RestoreContextMenuGroup,
} from "./files-context-menu-groups"
import { getFilesContextMenuState } from "./files-context-menu-state"
import { testFileRow } from "./test-builders"

const RESTORE_LIMIT = 6

describe("files context menu groups", () => {
  it("renders the file action that matches current visibility", () => {
    expect(
      renderContextMenuGroup(
        <FileContextMenuGroup
          hidden={false}
          name="app/search.ts"
          onHideFiles={() => {}}
          onShowFiles={() => {}}
        />
      )
    ).toContain("Hide file")

    expect(
      renderContextMenuGroup(
        <FileContextMenuGroup
          hidden
          name="app/search.ts"
          onHideFiles={() => {}}
          onShowFiles={() => {}}
        />
      )
    ).toContain("Show file")
  })

  it("renders directory restore action when only some children are hidden", () => {
    const html = renderContextMenuGroup(
      <DirectoryContextMenuGroup
        contextDirectory={{ label: "lib", names: ["lib/a.ts", "lib/b.ts"] }}
        hiddenFiles={new Set(["lib/a.ts"])}
        onHideFiles={() => {}}
        onShowFiles={() => {}}
      />
    )

    expect(html).toContain("Hide folder")
    expect(html).toContain("Show hidden children")
  })

  it("renders restore rows and overflow action separately", () => {
    const hiddenRows = Array.from(
      { length: RESTORE_LIMIT + 1 },
      (_, index) => testFileRow(`${index}.ts`)
    )
    const rows = hiddenRows.slice(0, 2)

    const html = renderContextMenuGroup(
      <RestoreContextMenuGroup
        restoreMenu={restoreMenuFor(hiddenRows, rows)}
        onShowAllFiles={() => {}}
        onShowFiles={() => {}}
      />
    )

    expect(html).toContain("0.ts")
    expect(html).toContain("1.ts")
    expect(html).toContain(`Show all ${RESTORE_LIMIT + 1} hidden files`)
    expect(html).not.toContain(">Show all hidden files<")
  })

  it("renders the generic restore-all action when there is no overflow", () => {
    const rows = [testFileRow("a.ts"), testFileRow("b.ts")]

    const html = renderContextMenuGroup(
      <RestoreContextMenuGroup
        restoreMenu={restoreMenuFor(rows, rows)}
        onShowAllFiles={() => {}}
        onShowFiles={() => {}}
      />
    )

    expect(html).toContain("Show all hidden files")
    expect(html).not.toContain("Show all 2 hidden files")
  })
})

function renderContextMenuGroup(children: ReactNode) {
  return renderToStaticMarkup(<ContextMenu>{children}</ContextMenu>)
}

function restoreMenuFor(
  hiddenFileRows: ReturnType<typeof testFileRow>[],
  restorableRows: ReturnType<typeof testFileRow>[]
) {
  return getFilesContextMenuState({
    contextDirectory: null,
    contextFile: null,
    hiddenFileRows,
    restorableRows,
  }).restoreMenu
}
