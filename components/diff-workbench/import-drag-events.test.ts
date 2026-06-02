import { describe, expect, it, vi } from "vitest";

import {
  isFileDragEvent,
  prepareImportDrop,
  stopImportDragPropagation,
} from "./import-drag-events";

describe("import drag events", () => {
  it("detects browser file drag payloads", () => {
    expect(isFileDragEvent(fileDragEvent(["Files"]))).toBe(true);
    expect(isFileDragEvent(fileDragEvent(["text/plain"]))).toBe(false);
  });

  it("prepares local import drops without leaking to the global drop handler", () => {
    const event = dragEvent();

    prepareImportDrop(event);

    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(event.nativeEvent.stopImmediatePropagation).toHaveBeenCalledOnce();
    expect(event.preventDefault).toHaveBeenCalledOnce();
  });

  it("can stop propagation without preventing default browser behavior", () => {
    const event = dragEvent();

    stopImportDragPropagation(event);

    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(event.nativeEvent.stopImmediatePropagation).toHaveBeenCalledOnce();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});

function fileDragEvent(types: string[]) {
  return {
    dataTransfer: { types },
  };
}

function dragEvent(): Parameters<typeof prepareImportDrop>[0] {
  return {
    dataTransfer: { types: ["Files"] },
    nativeEvent: { stopImmediatePropagation: vi.fn() },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  };
}
