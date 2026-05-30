import { describe, expect, it } from "vitest"

import { getNotepadState } from "./notepad-state"

describe("notepad state", () => {
  it("tracks character count and visible content separately", () => {
    expect(getNotepadState({ copied: false, value: "abc" })).toMatchObject({
      characterCount: 3,
      hasContent: true,
    })

    expect(getNotepadState({ copied: false, value: "   " })).toMatchObject({
      characterCount: 3,
      hasContent: false,
    })
  })

  it("keeps copy feedback labels and timing in one place", () => {
    expect(getNotepadState({ copied: false, value: "" })).toMatchObject({
      copyFeedbackMs: 1400,
      copyLabel: "Copy notes",
    })
    expect(getNotepadState({ copied: true, value: "" })).toMatchObject({
      copyLabel: "Notes copied",
    })
  })
})
