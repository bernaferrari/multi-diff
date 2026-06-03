import { describe, expect, it } from "vitest";

import { getFileVisibilityPatch, getHiddenFileNameState } from "./file-visibility-state";

describe("file visibility state", () => {
  it("builds a reusable visibility patch from a non-empty selection", () => {
    const original = new Set(["c.ts"]);
    const patch = getFileVisibilityPatch(["a.ts", "a.ts", "b.ts"]);

    expect(patch?.hide(original)).toEqual(new Set(["a.ts", "b.ts", "c.ts"]));
    expect(patch?.show(new Set(["a.ts", "b.ts", "c.ts"]))).toEqual(new Set(["c.ts"]));
    expect(patch?.clearSelection("a.ts")).toBeNull();
    expect(patch?.clearSelection("c.ts")).toBe("c.ts");
    expect([...original]).toEqual(["c.ts"]);
    expect(getFileVisibilityPatch([])).toBeNull();
  });

  it("derives hidden file-name state for grouped file actions", () => {
    expect(getHiddenFileNameState(["a.ts", "b.ts"], new Set(["b.ts"]))).toEqual({
      allHidden: false,
      hiddenCount: 1,
      hiddenNames: ["b.ts"],
      partiallyHidden: true,
    });

    expect(getHiddenFileNameState(["a.ts"], new Set(["a.ts"]))).toEqual({
      allHidden: true,
      hiddenCount: 1,
      hiddenNames: ["a.ts"],
      partiallyHidden: false,
    });

    expect(getHiddenFileNameState([], new Set())).toMatchObject({
      allHidden: false,
      hiddenCount: 0,
      partiallyHidden: false,
    });
  });
});
