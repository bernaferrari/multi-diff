import { describe, expect, it } from "vitest";

import { DIFF_FILE_HEADER_HEIGHT, DIFF_LINE_HEIGHT_PX } from "./diff-render-metrics";
import { getLaneLayoutState } from "./lane-layout";

describe("lane layout", () => {
  it("keeps empty column lanes compact", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: true,
        layout: "columns",
        codeHeight: 0,
      }).columnHeight,
    ).toBe(192);
  });

  it("prioritizes lane content states before layout rendering", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        codeHeight: 0,
        hasError: true,
        isEmpty: true,
        layout: "columns",
      }).contentKind,
    ).toBe("error");
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        codeHeight: 0,
        hasError: false,
        isEmpty: true,
        layout: "rows",
      }).contentKind,
    ).toBe("empty");
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        codeHeight: DIFF_FILE_HEADER_HEIGHT,
        hasError: false,
        isEmpty: false,
        layout: "rows",
      }).contentKind,
    ).toBe("rows");
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        codeHeight: DIFF_FILE_HEADER_HEIGHT,
        hasError: false,
        isEmpty: false,
        layout: "columns",
      }).contentKind,
    ).toBe("columns");
  });

  it("uses estimated diff height for populated column lanes", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "columns",
        codeHeight: DIFF_FILE_HEADER_HEIGHT + 9 * DIFF_LINE_HEIGHT_PX,
      }).columnHeight,
    ).toBe(44 + DIFF_FILE_HEADER_HEIGHT + 9 * DIFF_LINE_HEIGHT_PX);
  });

  it("builds lane shell classes from state", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: true,
        layout: "columns",
        codeHeight: 0,
      }).sectionClass,
    ).toContain("border-dashed");

    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "rows",
        codeHeight: DIFF_FILE_HEADER_HEIGHT + 9 * DIFF_LINE_HEIGHT_PX,
      }).sectionClass,
    ).toContain("overflow-clip");
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "rows",
        codeHeight: DIFF_FILE_HEADER_HEIGHT + 9 * DIFF_LINE_HEIGHT_PX,
      }).sectionClass,
    ).toContain("rounded-xl");
  });

  it("only applies explicit lane height in column mode", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "columns",
        codeHeight: DIFF_FILE_HEADER_HEIGHT + 9 * DIFF_LINE_HEIGHT_PX,
      }).sectionStyle,
    ).toEqual({
      height: `min(100%, ${44 + DIFF_FILE_HEADER_HEIGHT + 9 * DIFF_LINE_HEIGHT_PX}px)`,
    });
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "rows",
        codeHeight: DIFF_FILE_HEADER_HEIGHT + 9 * DIFF_LINE_HEIGHT_PX,
      }).sectionStyle,
    ).toBeUndefined();
  });

  it("builds lane body classes from state", () => {
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: true,
        layout: "columns",
        codeHeight: 0,
      }).bodyClass,
    ).toContain("shrink-0");
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "rows",
        codeHeight: DIFF_FILE_HEADER_HEIGHT + 9 * DIFF_LINE_HEIGHT_PX,
      }).bodyClass,
    ).toContain("block");
    expect(
      getLaneLayoutState({
        borderClass: "border-blue-500",
        hasError: false,
        isEmpty: false,
        layout: "columns",
        codeHeight: DIFF_FILE_HEADER_HEIGHT + 9 * DIFF_LINE_HEIGHT_PX,
      }).bodyClass,
    ).toContain("flex-1");
  });
});
