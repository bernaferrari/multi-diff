import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DiffFileHeader } from "./diff-file-header";

describe("DiffFileHeader", () => {
  it("labels the clickable file path and renders shared lane chrome", () => {
    const html = renderToStaticMarkup(
      <DiffFileHeader
        additions={12}
        deletions={3}
        fileName="components/result-list.tsx"
        paneId="a"
        sticky
      />,
    );

    expect(html).toContain('aria-label="Copy components/result-list.tsx"');
    expect(html).toContain('title="Copy components/result-list.tsx"');
    expect(html).toContain("<button");
    expect(html).toContain("data-diff-file-header");
    expect(html).toContain("top-0");
    expect(html).toContain("h-10");
    expect(html).toContain("border-t-0");
    expect(html).toContain("bg-card/95");
    expect(html).toContain(">A<");
    expect(html).toContain("size-5");
    expect(html).toContain("text-[11px]");
    expect(html).toContain("+12");
    expect(html).toContain("−3");
  });

  it("shows repeated patch position when provided", () => {
    const html = renderToStaticMarkup(
      <DiffFileHeader
        additions={2}
        deletions={1}
        fileName="components/result-list.tsx"
        occurrence={{ index: 2, total: 3 }}
      />,
    );

    expect(html).toContain("2/3");
    expect(html).toContain('title="Patch 2 of 3 for components/result-list.tsx"');
  });

  it("allows row views to pin through viewport padding", () => {
    const html = renderToStaticMarkup(
      <DiffFileHeader
        additions={2}
        deletions={1}
        fileName="components/result-list.tsx"
        sticky
        stickyOffsetClassName="-top-3"
      />,
    );

    expect(html).toContain("-top-3");
  });
});
