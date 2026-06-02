import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DiffFileHeader } from "./diff-file-header";

describe("DiffFileHeader", () => {
  it("labels the clickable file path and renders compact lane chrome", () => {
    const html = renderToStaticMarkup(
      <DiffFileHeader
        additions={12}
        deletions={3}
        fileName="components/result-list.tsx"
        paneId="a"
        compact
        sticky
      />,
    );

    expect(html).toContain('aria-label="Copy components/result-list.tsx"');
    expect(html).toContain('title="Copy components/result-list.tsx"');
    expect(html).toContain("<button");
    expect(html).toContain("data-diff-file-header");
    expect(html).toContain("-top-3");
    expect(html).toContain(">A<");
    expect(html).toContain("size-3");
    expect(html).toContain("text-[11px]");
    expect(html).toContain("+12");
    expect(html).toContain("−3");
  });
});
