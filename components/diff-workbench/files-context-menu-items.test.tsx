import { renderToStaticMarkup } from "react-dom/server"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"

import { ContextMenu } from "@/components/ui/context-menu"

import {
  RestoreMenuItem,
  ShowMenuItem,
  VisibilityMenuItem,
} from "./files-context-menu-items"

describe("files context menu items", () => {
  it("renders visibility actions with the matching label", () => {
    expect(
      renderMenuItem(
        <VisibilityMenuItem
          hidden={false}
          hideLabel="Hide file"
          showLabel="Show file"
          onHide={() => {}}
          onShow={() => {}}
        />
      )
    ).toContain("Hide file")

    expect(
      renderMenuItem(
        <VisibilityMenuItem
          hidden
          hideLabel="Hide file"
          showLabel="Show file"
          onHide={() => {}}
          onShow={() => {}}
        />
      )
    ).toContain("Show file")
  })

  it("renders show and restore menu rows", () => {
    const show = renderMenuItem(
      <ShowMenuItem onClick={() => {}}>Show hidden children</ShowMenuItem>
    )
    const restore = renderMenuItem(
      <RestoreMenuItem onClick={() => {}}>
        Show all hidden files
      </RestoreMenuItem>
    )

    expect(show).toContain("Show hidden children")
    expect(show).not.toEqual(restore)
    expect(restore).toContain("Show all hidden files")
  })
})

function renderMenuItem(node: ReactNode) {
  return renderToStaticMarkup(<ContextMenu>{node}</ContextMenu>)
}
