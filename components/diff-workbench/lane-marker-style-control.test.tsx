import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LaneMarkerStyleControl } from "./lane-marker-style-control";

describe("lane marker style control", () => {
  it("renders letters and bars as the sidebar marker choices", () => {
    const html = renderToStaticMarkup(
      <LaneMarkerStyleControl layout="columns" value="letters" onValueChange={() => {}} />,
    );

    expect(html).toContain("Sidebar markers");
    expect(html).toContain("Letters");
    expect(html).toContain("Bars");
    expect(html).toContain(">A<");
    expect(html).toContain(">B<");
    expect(html).toContain(">C<");
    expect(html).toContain('aria-pressed="true"');
  });

  it("uses horizontal compact bars in rows mode", () => {
    const html = renderToStaticMarkup(
      <LaneMarkerStyleControl layout="rows" value="bars" onValueChange={() => {}} />,
    );

    expect(html).toContain("flex-col");
    expect(html).toContain("h-1");
    expect(html).toContain("w-3.5");
  });
});
