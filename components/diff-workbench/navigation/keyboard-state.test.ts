import { afterEach, describe, expect, it, vi } from "vitest";

import { getWorkbenchKeyboardAction, isEditableKeyboardTarget } from "./keyboard-state";

const baseEvent = {
  altKey: false,
  ctrlKey: false,
  defaultPrevented: false,
  focusFile: null,
  key: "",
  metaKey: false,
  targetEditable: false,
};

describe("workbench keyboard state", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps global note shortcut without requiring a focused file", () => {
    expect(
      getWorkbenchKeyboardAction({
        ...baseEvent,
        key: "n",
      }),
    ).toEqual({ type: "toggle-notes" });
  });

  it("maps focus navigation shortcuts only when a file is focused", () => {
    expect(
      getWorkbenchKeyboardAction({
        ...baseEvent,
        focusFile: "app/a.ts",
        key: "ArrowRight",
      }),
    ).toEqual({ delta: 1, type: "move-focus" });
    expect(
      getWorkbenchKeyboardAction({
        ...baseEvent,
        focusFile: "app/a.ts",
        key: "ArrowLeft",
      }),
    ).toEqual({ delta: -1, type: "move-focus" });
    expect(
      getWorkbenchKeyboardAction({
        ...baseEvent,
        key: "ArrowRight",
      }),
    ).toBeNull();
  });

  it("ignores modified, prevented, and editable-target events", () => {
    expect(
      getWorkbenchKeyboardAction({
        ...baseEvent,
        key: "n",
        metaKey: true,
      }),
    ).toBeNull();
    expect(
      getWorkbenchKeyboardAction({
        ...baseEvent,
        defaultPrevented: true,
        key: "n",
      }),
    ).toBeNull();
    expect(
      getWorkbenchKeyboardAction({
        ...baseEvent,
        key: "n",
        targetEditable: true,
      }),
    ).toBeNull();
  });

  it("maps command or control find to file search", () => {
    expect(
      getWorkbenchKeyboardAction({
        ...baseEvent,
        key: "f",
        metaKey: true,
      }),
    ).toEqual({ type: "search-content" });
    expect(
      getWorkbenchKeyboardAction({
        ...baseEvent,
        key: "F",
        ctrlKey: true,
        targetEditable: true,
      }),
    ).toEqual({ type: "search-content" });
  });

  it("detects editable keyboard targets", () => {
    class TestElement {
      constructor(
        readonly tagName: string,
        readonly isContentEditable = false,
      ) {}
    }

    vi.stubGlobal("HTMLElement", TestElement);

    expect(isEditableKeyboardTarget(new TestElement("INPUT"))).toBe(true);
    expect(isEditableKeyboardTarget(new TestElement("TEXTAREA"))).toBe(true);
    expect(isEditableKeyboardTarget(new TestElement("DIV", true))).toBe(true);
    expect(isEditableKeyboardTarget(new TestElement("BUTTON"))).toBe(false);
    expect(isEditableKeyboardTarget(null)).toBe(false);
  });

  it("treats targets as non-editable outside the DOM", () => {
    vi.stubGlobal("HTMLElement", undefined);

    expect(isEditableKeyboardTarget({})).toBe(false);
  });
});
