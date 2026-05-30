import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
  DIFF_FILE_ACCEPT,
  DIFF_FILE_ACCEPT_LABEL,
  DiffFileInput,
} from "./diff-file-input"

describe("DiffFileInput", () => {
  it("uses the shared diff file constraints", () => {
    const html = renderToStaticMarkup(
      <DiffFileInput multiple onFiles={() => {}} />
    )

    expect(html).toContain('type="file"')
    expect(html).toContain(`accept="${DIFF_FILE_ACCEPT}"`)
    expect(html).toContain("multiple")
    expect(html).toContain("sr-only")
  })

  it("keeps the visible accept label aligned with the input accept list", () => {
    expect(DIFF_FILE_ACCEPT.split(",")).toEqual([".diff", ".patch", ".txt"])
    expect(DIFF_FILE_ACCEPT_LABEL).toBe(".diff, .patch, or text")
  })
})
