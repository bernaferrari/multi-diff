import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ToolbarIconButton } from "./toolbar-controls";

describe("toolbar controls", () => {
  it("renders icon buttons as explicit buttons with caller classes", () => {
    const html = renderToStaticMarkup(
      <ToolbarIconButton aria-label="Example" className="custom-class">
        X
      </ToolbarIconButton>,
    );

    expect(html).toContain('type="button"');
    expect(html).toContain('aria-label="Example"');
    expect(html).toContain("custom-class");
  });
});
