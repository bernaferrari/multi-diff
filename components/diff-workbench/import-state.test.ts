import { describe, expect, it } from "vitest"

import {
  applyImportedFiles,
  getImportPreviewRows,
} from "./import-state"
import type { Pane } from "./types"

function pane(id: string, text = `diff-${id}`): Pane {
  return {
    id,
    label: `Diff ${id.toUpperCase()}`,
    text,
    filename: `${id}.patch`,
  }
}

describe("import state", () => {
  it("uses an empty lane for a single untargeted import", () => {
    const panes = [pane("a"), pane("b", ""), pane("c")]

    expect(
      applyImportedFiles({
        panes,
        reads: [{ name: "single.patch", text: "single diff" }],
      }).map((item) => item.filename)
    ).toEqual(["a.patch", "single.patch", "c.patch"])

    expect(
      applyImportedFiles({
        panes,
        reads: [
          { name: "first.patch", text: "first diff" },
          { name: "second.patch", text: "second diff" },
        ],
      }).map((item) => item.filename)
    ).toEqual(["first.patch", "second.patch"])

    expect(
      applyImportedFiles({
        panes,
        reads: [{ name: "target.patch", text: "target diff" }],
        target: "c",
      }).map((item) => item.filename)
    ).toEqual(["a.patch", "b.patch", "target.patch"])
  })

  it("applies imports to targeted lanes while preserving existing lane order", () => {
    const next = applyImportedFiles({
      panes: [pane("a"), pane("b"), pane("c")],
      reads: [{ name: "replace.patch", text: "new diff" }],
      target: "b",
    })

    expect(next).toHaveLength(3)
    expect(next.map((item) => item.id)).toEqual(["a", "b", "c"])
    expect(next[1]).toMatchObject({
      id: "b",
      filename: "replace.patch",
      text: "new diff",
    })
  })

  it("expands lanes up to the configured maximum when importing many files", () => {
    const next = applyImportedFiles({
      panes: [pane("a")],
      reads: [
        { name: "a.patch", text: "a" },
        { name: "b.patch", text: "b" },
        { name: "c.patch", text: "c" },
        { name: "d.patch", text: "d" },
        { name: "e.patch", text: "e" },
        { name: "f.patch", text: "f" },
      ],
    })

    expect(next).toHaveLength(5)
    expect(next.map((item) => item.filename)).toEqual([
      "a.patch",
      "b.patch",
      "c.patch",
      "d.patch",
      "e.patch",
    ])
  })

  it("chooses the start lane from the current panes when applying an import", () => {
    const next = applyImportedFiles({
      panes: [pane("a"), pane("b", ""), pane("c")],
      reads: [{ name: "late.patch", text: "late diff" }],
    })

    expect(next.map((item) => item.filename)).toEqual([
      "a.patch",
      "late.patch",
      "c.patch",
    ])
  })

  it("previews the lanes that staged files will import into", () => {
    const rows = getImportPreviewRows({
      panes: [pane("a"), pane("b", ""), pane("c")],
      files: [
        { file: new File(["a"], "first.patch") },
        { file: new File(["b"], "second.patch") },
      ],
    })

    expect(rows).toEqual([
      { fileName: "first.patch", lane: "a", laneLabel: "Diff A" },
      { fileName: "second.patch", lane: "b", laneLabel: "Diff B" },
    ])

    expect(
      getImportPreviewRows({
        panes: [pane("a"), pane("b", ""), pane("c")],
        files: [{ file: new File(["b"], "single.patch") }],
      })
    ).toEqual([{ fileName: "single.patch", lane: "b", laneLabel: "Diff B" }])
  })

  it("can pin a staged file to a specific lane", () => {
    expect(
      getImportPreviewRows({
        panes: [pane("a"), pane("b"), pane("c")],
        files: [{ file: new File(["a"], "a.patch"), targetLane: "c" }],
      })
    ).toEqual([{ fileName: "a.patch", lane: "c", laneLabel: "Diff C" }])
  })

  it("expands panes far enough for explicit staged lane targets", () => {
    const next = applyImportedFiles({
      panes: [pane("a")],
      reads: [{ name: "c.patch", text: "diff c" }],
      targets: ["c"],
    })

    expect(next.map((item) => item.id)).toEqual(["a", "b", "c"])
    expect(next.map((item) => item.filename)).toEqual([
      "a.patch",
      undefined,
      "c.patch",
    ])
  })
})
