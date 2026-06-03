import { describe, expect, it } from "vitest";

import { createImportDropRequest } from "./import-drop-request";

describe("import drop request", () => {
  it("copies dropped files and keeps an optional target lane", () => {
    const file = new File(["diff"], "changes.patch");

    expect(createImportDropRequest([file], "c")).toEqual({
      files: [file],
      target: "c",
    });
  });

  it("normalizes empty file sources", () => {
    expect(createImportDropRequest(null)).toEqual({
      files: [],
      target: undefined,
    });
  });
});
