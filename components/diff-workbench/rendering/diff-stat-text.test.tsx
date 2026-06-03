import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DiffStatText } from "./diff-stat-text";

describe("DiffStatText", () => {
  it("renders compact additions and deletions with shared stat classes", () => {
    const html = renderToStaticMarkup(
      <DiffStatText additions={12} deletions={3} className="text-xs" />,
    );

    expect(html).toContain("font-mono");
    expect(html).toContain("tabular-nums");
    expect(html).toContain("text-xs");
    expect(html).toContain("text-add");
    expect(html).toContain("+12");
    expect(html).toContain("text-del");
    expect(html).toContain("−3");
  });
});
