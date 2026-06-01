import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ImportStagedRow } from "./import-staged-row"

describe("import staged row", () => {
  it("renders move controls, lane selector, and remove action for a staged file", () => {
    const html = renderToStaticMarkup(
      <ImportStagedRow
        file={{ file: new File(["diff"], "changes.patch") }}
        index={0}
        isLast={false}
        lane="b"
        onLaneChange={() => {}}
        onMove={() => {}}
        onRemove={() => {}}
      />
    )

    expect(html).toContain("changes.patch")
    expect(html).toContain("Move changes.patch up")
    expect(html).toContain("Move changes.patch down")
    expect(html).toContain("Lane for changes.patch")
    expect(html).toContain("Remove changes.patch")
    expect(html).toContain(">B<")
  })
})
