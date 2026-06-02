import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FilesLaneFilter } from "./files-lane-filter";
import type { LanePane } from "./types";

describe("FilesLaneFilter", () => {
  const panes: LanePane[] = [
    { id: "a", label: "Diff A" },
    { id: "b", label: "Diff B" },
    { id: "c", label: "Diff C" },
  ];

  it("uses a stable grid and labels hidden lanes clearly", () => {
    const html = renderToStaticMarkup(
      <FilesLaneFilter hidden={new Set(["b"])} panes={panes} onToggleLane={() => {}} />,
    );

    expect(html).toContain("grid-template-columns:repeat(3, minmax(0, 1fr))");
    expect(html).toContain('title="Hide Diff A"');
    expect(html).toContain('title="Show Diff B"');
    expect(html).toContain('aria-label="Hide Diff A"');
    expect(html).toContain('aria-label="Show Diff B"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("border-dashed");
  });

  it("keeps at least one grid track for the lane filter", () => {
    const emptyHtml = renderToStaticMarkup(
      <FilesLaneFilter hidden={new Set()} panes={[]} onToggleLane={() => {}} />,
    );
    const filledHtml = renderToStaticMarkup(
      <FilesLaneFilter hidden={new Set()} panes={panes} onToggleLane={() => {}} />,
    );

    expect(emptyHtml).toContain("grid-template-columns:repeat(1, minmax(0, 1fr))");
    expect(filledHtml).toContain("grid-template-columns:repeat(3, minmax(0, 1fr))");
  });
});
