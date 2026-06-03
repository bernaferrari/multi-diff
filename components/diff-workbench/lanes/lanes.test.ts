import { describe, expect, it } from "vitest";

import { laneRangeLabel, MAX_LANES } from "./lanes";

describe("lanes", () => {
  it("formats the import lane range from the configured lane count", () => {
    expect(MAX_LANES).toBe(5);
    expect(laneRangeLabel()).toBe("A-E");
  });
});
