import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ContextMenuGroup } from "@/components/ui/context-menu"

import {
  DirectoryMenuSummary,
  FileMenuSummary,
  FilesMenuLabel,
} from "./files-context-menu-parts"

describe("files context menu parts", () => {
  it("renders compact group labels", () => {
    expect(
      renderToStaticMarkup(
        <ContextMenuGroup>
          <FilesMenuLabel>Restore</FilesMenuLabel>
        </ContextMenuGroup>
      )
    ).toContain("tracking-wide uppercase")
  })

  it("renders file and directory summaries with truncation-safe text", () => {
    expect(
      renderToStaticMarkup(<FileMenuSummary path="app/search.ts" />)
    ).toContain("app/search.ts")

    const directoryHtml = renderToStaticMarkup(
      <DirectoryMenuSummary count={3} label="app/api/search" />
    )

    expect(directoryHtml).toContain("app/api/search")
    expect(directoryHtml).toContain(">3<")
  })
})
