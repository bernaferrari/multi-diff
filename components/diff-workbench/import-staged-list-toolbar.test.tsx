import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ImportStagedListToolbar } from "./import-staged-list-toolbar"

describe("import staged list toolbar", () => {
  it("renders the staged count and disables sorting until there are multiple files", () => {
    const html = renderToStaticMarkup(
      <ImportStagedListToolbar count={1} onAdd={() => {}} onSort={() => {}} />
    )

    expect(html).toContain("1 of 5 files")
    expect(html).toContain("Sort")
    expect(html).toContain("disabled")
    expect(html).toContain("Add")
  })

  it("disables adding once all lanes are staged", () => {
    const html = renderToStaticMarkup(
      <ImportStagedListToolbar count={5} onAdd={() => {}} onSort={() => {}} />
    )

    expect(html).toContain("5 of 5 files")
    expect(html).toContain("disabled")
  })
})
