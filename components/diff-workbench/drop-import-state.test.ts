import { describe, expect, it } from "vitest"

import {
  getDragDepthState,
  hasDraggedFiles,
  laneTargetFromElement,
  laneTargetFromDragEvent,
} from "./drop-import-state"

describe("drop import state", () => {
  it("detects drag events that include files", () => {
    expect(
      hasDraggedFiles({
        dataTransfer: {
          types: ["text/plain", "Files"],
        },
      })
    ).toBe(true)

    expect(
      hasDraggedFiles({
        dataTransfer: {
          types: ["text/plain"],
        },
      })
    ).toBe(false)
  })

  it("derives overlay visibility from drag depth transitions", () => {
    expect(getDragDepthState(0, "enter")).toEqual({
      depth: 1,
      dragging: true,
    })
    expect(getDragDepthState(2, "leave")).toEqual({
      depth: 1,
      dragging: true,
    })
    expect(getDragDepthState(1, "leave")).toEqual({
      depth: 0,
      dragging: false,
    })
    expect(getDragDepthState(3, "drop")).toEqual({
      depth: 0,
      dragging: false,
    })
  })

  it("finds the nearest lane target from an element-like object", () => {
    expect(
      laneTargetFromElement({
        closest: (selector) =>
          selector === "[data-lane]" ? { dataset: { lane: "c" } } : null,
      })
    ).toBe("c")

    expect(
      laneTargetFromElement({
        closest: () => null,
      })
    ).toBeUndefined()

    expect(
      laneTargetFromElement({
        closest: () => ({ dataset: { lane: "  " } }),
      })
    ).toBeUndefined()
  })

  it("treats drag events as untargeted outside the DOM", () => {
    expect(laneTargetFromDragEvent({ target: {} })).toBeUndefined()
  })
})
