import { describe, expect, it } from "vitest";

import { parsePane } from "../rendering/diff-data";
import { createGuidePanes, GUIDE_NOTES } from "./guide-panes";
import { createSamplePanes } from "./sample-panes";

describe("sample panes", () => {
  it("creates parseable demo and guide patches", () => {
    for (const pane of [...createSamplePanes(), ...createGuidePanes()]) {
      expect(parsePane(pane).error).toBeUndefined();
    }
  });

  it("keeps guide notes focused on the loaded guide panes", () => {
    expect(GUIDE_NOTES).toContain("A, B, and C");
    expect(GUIDE_NOTES).toContain("src/search.ts");
    expect(GUIDE_NOTES).toContain("src/telemetry.ts");
  });
});
