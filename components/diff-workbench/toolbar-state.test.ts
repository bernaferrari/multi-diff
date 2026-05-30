import { describe, expect, it } from "vitest"

import {
  getSidebarToggleState,
  getThemeToggleState,
} from "./toolbar-state"

describe("toolbar state", () => {
  it("derives the files-panel toggle state from open state", () => {
    expect(getSidebarToggleState(true)).toMatchObject({
      ariaLabel: "Hide files panel",
      pressed: true,
    })
    expect(getSidebarToggleState(true).className).toContain("text-foreground")

    expect(getSidebarToggleState(false)).toMatchObject({
      ariaLabel: "Show files panel",
      pressed: false,
    })
    expect(getSidebarToggleState(false).className).toContain(
      "text-muted-foreground"
    )
  })

  it("derives theme-toggle behavior from mounted theme state", () => {
    expect(
      getThemeToggleState({ mounted: true, resolvedTheme: "dark" })
    ).toEqual({
      nextTheme: "light",
      showLightThemeIcon: true,
    })
    expect(
      getThemeToggleState({ mounted: false, resolvedTheme: "dark" })
    ).toEqual({
      nextTheme: "light",
      showLightThemeIcon: false,
    })
    expect(
      getThemeToggleState({ mounted: true, resolvedTheme: "light" })
    ).toEqual({
      nextTheme: "dark",
      showLightThemeIcon: false,
    })
    expect(
      getThemeToggleState({ mounted: true, resolvedTheme: undefined })
    ).toMatchObject({ nextTheme: "dark" })
    expect(
      getThemeToggleState({ mounted: true, resolvedTheme: "system" })
    ).toMatchObject({ nextTheme: "dark" })
  })
})
