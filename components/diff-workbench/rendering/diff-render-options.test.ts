import { describe, expect, it } from "vitest";

import { codeViewOptions, fileDiffOptions } from "./diff-render-options";

describe("diff render options", () => {
  const common = {
    codeTheme: "dark",
    diffStyle: "unified",
    lineNumbers: true,
    wrap: false,
  } satisfies Parameters<typeof fileDiffOptions>[0];

  it("keeps row file diff options visually quiet", () => {
    expect(fileDiffOptions(common)).toMatchObject({
      diffStyle: "unified",
      overflow: "scroll",
      disableLineNumbers: false,
      collapsedContextThreshold: 80,
      hunkSeparators: "simple",
      themeType: "dark",
      enableLineSelection: true,
    });
    expect(fileDiffOptions(common)?.unsafeCSS).toContain("line-info-basic");
    expect(fileDiffOptions(common)?.onPostRender).toBeUndefined();
  });

  it("keeps column code view options sticky, compact, and zero padded", () => {
    expect(codeViewOptions({ ...common, lineNumbers: false, wrap: true })).toMatchObject({
      diffStyle: "unified",
      overflow: "wrap",
      disableLineNumbers: true,
      hunkSeparators: "simple",
      stickyHeaders: true,
      itemMetrics: {
        hunkSeparatorHeight: 4,
      },
      layout: {
        gap: 0,
        paddingBottom: 0,
        paddingTop: 0,
      },
    });
    expect(
      codeViewOptions({ ...common, lineNumbers: false, wrap: true })?.onPostRender,
    ).toBeUndefined();
  });

  it("adds a post-render hook only when a search result is selected", () => {
    const searchTarget = {
      fileName: "app/search.ts",
      lineNumber: 12,
      paneId: "a",
      query: "search",
      side: "added",
      token: 1,
    } as const;

    expect(fileDiffOptions(common, searchTarget)?.onPostRender).toBeUndefined();
    expect(codeViewOptions(common, searchTarget)?.onPostRender).toBeUndefined();
    expect(fileDiffOptions(common, searchTarget, "a")?.onPostRender).toEqual(expect.any(Function));
    expect(codeViewOptions(common, searchTarget, "a")?.onPostRender).toEqual(expect.any(Function));
  });
});
