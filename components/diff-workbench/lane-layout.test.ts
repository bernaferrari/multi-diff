import { describe, expect, it } from "vitest";

import { getLaneLayoutState } from "./lane-layout";

describe("lane layout", () => {
  it("keeps empty column lanes compact", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: true,
        layout: "columns",
      }).columnHeight,
    ).toBe(192);
  });

  it("prioritizes lane content states before layout rendering", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: true,
        isEmpty: true,
        layout: "columns",
      }).contentKind,
    ).toBe("error");
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: true,
        layout: "rows",
      }).contentKind,
    ).toBe("empty");
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "rows",
      }).contentKind,
    ).toBe("rows");
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "columns",
      }).contentKind,
    ).toBe("columns");
  });

  it("lets populated column lanes fill the viewport height", () => {
    const state = getLaneLayoutState({
      borderClass: "border-blue-500",
      hasError: false,
      isEmpty: false,
      layout: "columns",
    });

    expect(state.columnHeight).toBeUndefined();
    expect(state.sectionStyle).toBeUndefined();
    expect(state.sectionClass).toContain("h-full");
  });

  it("keeps empty column lanes visibly compact", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: true,
        layout: "columns",
      }).sectionStyle,
    ).toEqual({
      height: "min(100%, 192px)",
    });
  });

  it("does not apply explicit lane height in row mode", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "rows",
      }).sectionStyle,
    ).toBeUndefined();
  });

  it("builds lane shell classes from state", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: true,
        layout: "columns",
      }).sectionClass,
    ).toContain("border-dashed");

    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "rows",
      }).sectionClass,
    ).toContain("overflow-clip");
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "rows",
      }).sectionClass,
    ).toContain("rounded-xl");
  });

  it("builds lane body classes from state", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: true,
        layout: "columns",
      }).bodyClass,
    ).toContain("shrink-0");
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "rows",
      }).bodyClass,
    ).toContain("block");
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "columns",
      }).bodyClass,
    ).toContain("flex-1");
  });
});
