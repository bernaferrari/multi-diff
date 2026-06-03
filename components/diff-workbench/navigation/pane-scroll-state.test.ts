import { describe, expect, it, vi } from "vitest";

import { testFileDiff, testPaneView } from "../shared/test-builders";
import {
  cancelProgrammaticScroll,
  claimScrollDriver,
  isProgrammaticScrollSuppressed,
  isScrollDriver,
  scrollMatchingPaneTargets,
  scrollPaneToFile,
  suppressProgrammaticScroll,
} from "./pane-scroll-state";

type PaneScrollTarget = Parameters<typeof scrollPaneToFile>[0][number];
type PaneScrollInstance = NonNullable<PaneScrollTarget["instance"]>;

describe("pane scroll helpers", () => {
  it("scrolls matching target panes to the requested file offset", () => {
    const scrollA = paneScrollTo();
    const scrollB = paneScrollTo();
    const scrollC = paneScrollTo();
    const onTargetScroll = vi.fn<(id: string) => void>();
    const targets: PaneScrollTarget[] = [
      target("a", ["route.ts"], scrollA),
      target("b", ["route.ts"], scrollB),
      target("c", ["other.ts"], scrollC),
    ];

    scrollMatchingPaneTargets({
      activeFile: { name: "route.ts", intraOffset: 72 },
      onTargetScroll,
      sourceId: "a",
      targets,
    });

    expect(scrollA).not.toHaveBeenCalled();
    expect(scrollB).toHaveBeenCalledWith({
      type: "item",
      id: "b-0-route.ts",
      align: "start",
      offset: 72,
      behavior: "instant",
    });
    expect(scrollC).not.toHaveBeenCalled();
    expect(onTargetScroll).toHaveBeenCalledWith("b");
    expect(onTargetScroll).not.toHaveBeenCalledWith("a");
  });

  it("scrolls the first pane containing a requested file and matching panes", () => {
    const scrollA = paneScrollTo();
    const scrollB = paneScrollTo();
    const targets: PaneScrollTarget[] = [
      target("a", ["route.ts"], scrollA),
      target("b", ["route.ts"], scrollB),
    ];

    expect(scrollPaneToFile(targets, "route.ts")).toBe(true);

    expect(scrollA).toHaveBeenCalledWith({
      type: "item",
      id: "a-0-route.ts",
      align: "start",
      offset: 0,
      behavior: "instant",
    });
    expect(scrollB).toHaveBeenCalledWith({
      type: "item",
      id: "b-0-route.ts",
      align: "start",
      offset: 0,
      behavior: "instant",
    });
  });

  it("can scroll only the requested lane for lane-specific navigation", () => {
    const scrollA = paneScrollTo();
    const scrollB = paneScrollTo();
    const scrollC = paneScrollTo();
    const targets: PaneScrollTarget[] = [
      target("a", ["route.ts"], scrollA),
      target("b", ["route.ts"], scrollB),
      target("c", ["route.ts"], scrollC),
    ];

    expect(scrollPaneToFile(targets, "route.ts", "smooth", ["b"])).toBe(true);

    expect(scrollA).not.toHaveBeenCalled();
    expect(scrollB).toHaveBeenCalledWith({
      type: "item",
      id: "b-0-route.ts",
      align: "start",
      offset: 0,
      behavior: "smooth",
    });
    expect(scrollC).not.toHaveBeenCalled();
  });

  it("can use adaptive smooth scrolling for a requested file and matching panes", () => {
    const scrollA = paneScrollTo();
    const scrollB = paneScrollTo();
    const targets: PaneScrollTarget[] = [
      target("a", ["route.ts"], scrollA),
      target("b", ["route.ts"], scrollB),
    ];

    expect(scrollPaneToFile(targets, "route.ts", "smooth-auto")).toBe(true);

    expect(scrollA).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: "smooth-auto",
      }),
    );
    expect(scrollB).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: "smooth-auto",
      }),
    );
  });

  it("scrolls to a requested line when navigation includes a line target", () => {
    const scrollA = paneScrollTo();
    const targets: PaneScrollTarget[] = [target("a", ["route.ts"], scrollA)];

    expect(scrollPaneToFile(targets, "route.ts", "smooth-auto", ["a"], 12, "additions")).toBe(true);

    expect(scrollA).toHaveBeenCalledWith({
      type: "line",
      id: "a-0-route.ts",
      lineNumber: 12,
      side: "additions",
      align: "center",
      behavior: "smooth-auto",
    });
  });

  it("does nothing when no visible pane contains the requested file", () => {
    const scrollTo = paneScrollTo();

    expect(scrollPaneToFile([target("a", ["route.ts"], scrollTo)], "x.ts")).toBe(false);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("suppresses programmatic target scroll events briefly", () => {
    const suppressed = new Map();

    suppressProgrammaticScroll(suppressed, "b", 1000);

    expect(isProgrammaticScrollSuppressed(suppressed, "b", 2000)).toBe(true);
    expect(isProgrammaticScrollSuppressed(suppressed, "b", 2500)).toBe(false);
    expect(suppressed.has("b")).toBe(false);
  });

  it("tracks the active user scroll driver for a short window", () => {
    const driver = { current: null as Parameters<typeof isScrollDriver>[0] };

    expect(isScrollDriver(driver.current, "a", 1000)).toBe(true);

    claimScrollDriver(driver, "a", 1000);

    expect(isScrollDriver(driver.current, "a", 1200)).toBe(true);
    expect(isScrollDriver(driver.current, "b", 1200)).toBe(false);
    expect(isScrollDriver(driver.current, "b", 2500)).toBe(true);
  });

  it("cancels programmatic momentum at the current position", () => {
    const scrollTo = paneScrollTo();
    const instance: Parameters<typeof cancelProgrammaticScroll>[0] = {
      getScrollTop: () => 42,
      scrollTo,
    };

    cancelProgrammaticScroll(instance);

    expect(scrollTo).toHaveBeenCalledWith({
      type: "position",
      position: 42,
      behavior: "instant",
    });
  });
});

function target(
  id: string,
  fileNames: string[],
  scrollTo: PaneScrollInstance["scrollTo"],
): PaneScrollTarget {
  return {
    id,
    instance: { scrollTo },
    paneView: testPaneView(
      id,
      fileNames.map((fileName) => testFileDiff(fileName, 1, 1)),
    ),
  };
}

function paneScrollTo() {
  return vi.fn<PaneScrollInstance["scrollTo"]>();
}
