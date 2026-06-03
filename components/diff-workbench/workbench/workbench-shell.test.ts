import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { mobileSheetContentClass, WorkbenchShell } from "./workbench-shell";

describe("workbench shell classes", () => {
  function renderShell(sidebarOpen: boolean, mobileSidebarOpen = false) {
    return renderToStaticMarkup(
      createElement(WorkbenchShell, {
        mobileSidebarOpen,
        onMobileSidebarOpenChange: () => {},
        sidebar: createElement("aside", null, "Sidebar"),
        sidebarOpen,
        viewport: createElement("main", null, "Viewport"),
      }),
    );
  }

  it("opens and closes the sidebar grid track", () => {
    expect(renderShell(true)).toContain("md:grid-cols-[16rem_minmax(0,1fr)]");
    expect(renderShell(false)).toContain("md:grid-cols-[0rem_minmax(0,1fr)]");
  });

  it("keeps the closed sidebar non-interactive", () => {
    expect(renderShell(true)).toContain("opacity-100");
    expect(renderShell(false)).toContain("pointer-events-none");
  });

  it("keeps the desktop sidebar out of the mobile layout", () => {
    expect(renderShell(true)).toContain("hidden min-w-0 overflow-hidden md:block");
  });

  it("does not derive the mobile sheet from the desktop sidebar state", () => {
    expect(renderShell(true)).not.toContain('data-state="open"');
  });

  it("bounds the viewport so panel content scrolls inside the app shell", () => {
    expect(renderShell(true)).toContain("flex min-h-0 min-w-0 overflow-hidden");
  });

  it("keeps the mobile sheet fitted to the file panel width", () => {
    expect(mobileSheetContentClass()).toContain("data-[side=left]:!w-64");
    expect(mobileSheetContentClass()).toContain("max-w-[calc(100vw-1rem)]");
  });
});
