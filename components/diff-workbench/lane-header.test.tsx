import { createRef } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { LaneHeader } from "./lane-header"
import { laneStyle } from "./lanes"
import { testParsedPane, testFileDiff } from "./test-builders"

describe("LaneHeader", () => {
  it("shows stats and labels actions for populated panes", () => {
    const pane = testParsedPane("a", [testFileDiff("app/a.ts", 3, 2)])
    const html = renderHeader({ isEmpty: false, pane })

    expect(html).toContain("Diff A")
    expect(html).toContain("+3")
    expect(html).toContain("−2")
    expect(html).toContain('aria-label="Diff A actions"')
  })

  it("hides zero stats and disables clearing for empty panes", () => {
    const pane = testParsedPane("b", [])
    const html = renderHeader({ isEmpty: true, pane })

    expect(html).not.toContain("+0")
    expect(html).not.toContain("−0")
    expect(html).toContain("disabled")
  })
})

function renderHeader({
  isEmpty,
  pane,
}: {
  isEmpty: boolean
  pane: ReturnType<typeof testParsedPane>
}) {
  return renderToStaticMarkup(
    <LaneHeader
      importInputRef={createRef<HTMLInputElement>()}
      isEmpty={isEmpty}
      pane={pane}
      style={laneStyle(pane.id)}
      canMoveLeft={false}
      canMoveRight
      onClear={() => {}}
      onHide={() => {}}
      onImport={() => {}}
      onMoveLeft={() => {}}
      onMoveRight={() => {}}
    />
  )
}
