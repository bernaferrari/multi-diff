import { afterEach, describe, expect, it, vi } from "vitest";

import { copyTextToClipboard, copyTextWithToast } from "./clipboard";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe("clipboard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(toast.success).mockClear();
  });

  it("copies text when clipboard access is available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await expect(copyTextToClipboard("path/to/file.ts")).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith("path/to/file.ts");
  });

  it("reports unavailable clipboard access", async () => {
    vi.stubGlobal("navigator", {});

    await expect(copyTextToClipboard("notes")).resolves.toBe("unavailable");
  });

  it("falls back to selection copy when clipboard access is missing", async () => {
    const appendChild = vi.fn();
    const remove = vi.fn();
    const select = vi.fn();
    const setAttribute = vi.fn();
    const textarea = {
      remove,
      select,
      setAttribute,
      style: {},
      value: "",
    };
    vi.stubGlobal("navigator", {});
    vi.stubGlobal("document", {
      body: { appendChild },
      createElement: vi.fn(() => textarea),
      execCommand: vi.fn(() => true),
    });

    await expect(copyTextToClipboard("app/a.ts")).resolves.toBe("copied");
    expect(textarea.value).toBe("app/a.ts");
    expect(appendChild).toHaveBeenCalledWith(textarea);
    expect(select).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();
  });

  it("reports blocked clipboard writes", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("blocked")) },
    });

    await expect(copyTextToClipboard("notes")).resolves.toBe("blocked");
  });

  it("shows success feedback when a copy action is triggered", async () => {
    vi.stubGlobal("navigator", {});

    await expect(
      copyTextWithToast({
        description: "app/a.ts",
        text: "app/a.ts",
        title: "Copied file path",
      }),
    ).resolves.toBe("unavailable");

    expect(toast.success).toHaveBeenCalledWith("Copied file path", {
      description: "app/a.ts",
    });
  });
});
