import { describe, expect, it, vi } from "vitest";

import { clampScrollPosition, routeWheelToScroller } from "./scrolling";

type WheelLike = Parameters<typeof routeWheelToScroller>[0];
type ScrollTarget = Parameters<typeof routeWheelToScroller>[1];

function wheel(input: Partial<WheelLike> = {}) {
  return {
    deltaX: 0,
    deltaY: 0,
    shiftKey: false,
    preventDefault: vi.fn<() => void>(),
    ...input,
  };
}

function scroller(input: Partial<ScrollTarget> = {}) {
  return {
    clientHeight: 100,
    clientWidth: 100,
    scrollHeight: 300,
    scrollLeft: 0,
    scrollTop: 0,
    scrollWidth: 300,
    ...input,
  };
}

describe("routeWheelToScroller", () => {
  it("clamps scroll positions to the available range", () => {
    expect(clampScrollPosition(-10, 100)).toBe(0);
    expect(clampScrollPosition(40, 100)).toBe(40);
    expect(clampScrollPosition(140, 100)).toBe(100);
  });

  it("routes vertical wheel movement to scrollTop", () => {
    const event = wheel({ deltaY: 48 });
    const target = scroller();

    routeWheelToScroller(event, target);

    expect(target.scrollTop).toBe(48);
    expect(target.scrollLeft).toBe(0);
    expect(event.preventDefault).toHaveBeenCalledOnce();
  });

  it("routes horizontal wheel movement to scrollLeft", () => {
    const event = wheel({ deltaX: 36, deltaY: 8 });
    const target = scroller();

    routeWheelToScroller(event, target);

    expect(target.scrollLeft).toBe(36);
    expect(target.scrollTop).toBe(0);
    expect(event.preventDefault).toHaveBeenCalledOnce();
  });

  it("turns shifted vertical wheel movement into horizontal scrolling", () => {
    const event = wheel({ deltaY: 64, shiftKey: true });
    const target = scroller();

    routeWheelToScroller(event, target);

    expect(target.scrollLeft).toBe(64);
    expect(target.scrollTop).toBe(0);
    expect(event.preventDefault).toHaveBeenCalledOnce();
  });

  it("clamps to available scroll range", () => {
    const event = wheel({ deltaY: 500 });
    const target = scroller({ scrollTop: 80 });

    routeWheelToScroller(event, target);

    expect(target.scrollTop).toBe(200);
  });

  it("does not prevent default when the target cannot move", () => {
    const event = wheel({ deltaY: -20 });
    const target = scroller({ scrollTop: 0 });

    routeWheelToScroller(event, target);

    expect(target.scrollTop).toBe(0);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("uses scrollTo when the target exposes it", () => {
    const event = wheel({ deltaY: 40 });
    const scrollTo = vi.fn<(options: ScrollToOptions) => void>();
    const target = scroller({ scrollTo });

    routeWheelToScroller(event, target);

    expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 40 });
    expect(event.preventDefault).toHaveBeenCalledOnce();
  });
});
