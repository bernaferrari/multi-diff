import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
  ImportLaneSelect,
  ImportStagedMoveControls,
} from "./import-staged-controls"

describe("import staged controls", () => {
  it("renders move controls with file-specific labels", () => {
    const html = renderToStaticMarkup(
      <ImportStagedMoveControls
        fileName="changes.patch"
        index={1}
        isLast={false}
        onMove={() => {}}
      />
    )

    expect(html).toContain("Move changes.patch up")
    expect(html).toContain("Move changes.patch down")
  })

  it("renders a lane selector with every lane option", () => {
    const html = renderToStaticMarkup(
      <ImportLaneSelect
        fileName="changes.patch"
        lane="b"
        onChange={() => {}}
      />
    )

    expect(html).toContain("Lane for changes.patch")
    expect(html).toContain('value="a"')
    expect(html).toContain('value="b"')
    expect(html).toContain('value="c"')
  })
})
