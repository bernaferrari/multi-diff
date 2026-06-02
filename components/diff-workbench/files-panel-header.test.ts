import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FilesPanelHeader } from "./files-panel-header";

describe("files panel header", () => {
  function renderHeader(props: Partial<Parameters<typeof FilesPanelHeader>[0]> = {}) {
    return renderToStaticMarkup(
      createElement(FilesPanelHeader, {
        focusFile: null,
        focusMode: false,
        focusTarget: null,
        hidden: new Set<string>(),
        panes: [{ id: "a", label: "Diff A" }],
        query: "",
        sharedCount: 0,
        visibleCount: 1,
        onOverview: () => {},
        onQuery: () => {},
        onToggleLane: () => {},
        onToggleFocusMode: () => {},
        ...props,
      }),
    );
  }

  it("labels the file filter input beyond placeholder text", () => {
    const html = renderHeader();

    expect(html).toContain('aria-label="Filter files"');
    expect(html).toContain('placeholder="Filter files..."');
  });

  it("renders overview counts with a shared-count title when available", () => {
    expect(renderHeader({ sharedCount: 0, visibleCount: 5 })).toContain(">5</span>");
    expect(renderHeader({ sharedCount: 0, visibleCount: 5 })).not.toContain(
      "changed in every lane",
    );
    expect(renderHeader({ sharedCount: 1, visibleCount: 5 })).toContain(
      'title="1 file changed in every lane"',
    );
    expect(renderHeader({ sharedCount: 3, visibleCount: 5 })).toContain(
      'title="3 files changed in every lane"',
    );
  });

  it("renders the focused all-files action instead of overview count", () => {
    const html = renderHeader({
      focusFile: "app/a.ts",
      sharedCount: 3,
      visibleCount: 8,
    });

    expect(html).toContain(">All files</button>");
    expect(html).not.toContain('title="3 files changed in every lane"');
  });

  it("renders focus button states from the current target and mode", () => {
    expect(renderHeader({ focusTarget: null })).toContain('title="No visible file to focus"');
    expect(renderHeader({ focusTarget: null })).toContain('disabled=""');

    const enabled = renderHeader({ focusTarget: "app/a.ts" });
    expect(enabled).toContain('aria-label="Turn on file focus"');
    expect(enabled).toContain('title="Focus app/a.ts"');
    expect(enabled).not.toContain('disabled=""');

    const focused = renderHeader({
      focusMode: true,
      focusTarget: "app/a.ts",
    });
    expect(focused).toContain('aria-label="Turn off file focus"');
    expect(focused).toContain('aria-pressed="true"');
    expect(focused).toContain('title="Return to normal file navigation"');
  });
});
