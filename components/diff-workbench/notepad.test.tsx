import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Notepad } from "./notepad"

describe("Notepad", () => {
  it("labels icon-only note actions", () => {
    const html = renderToStaticMarkup(
      <Notepad
        open
        value="check parser behavior"
        onChange={() => {}}
        onClose={() => {}}
        onOpen={() => {}}
      />
    )

    expect(html).toContain('aria-label="Copy notes"')
    expect(html).toContain('aria-label="Hide notes"')
  })
})
