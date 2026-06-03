import { afterEach, describe, expect, it, vi } from "vitest";

import { copyTextToClipboard, copyTextWithToast } from "./clipboard";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn<() => void>(),
  },
}));

describe("clipboard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(toast.success).mockClear();
  });

  it("copies text when clipboard access is available", async () => {
    const writeText = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await expect(copyTextToClipboard("path/to/file.ts")).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith("path/to/file.ts");
  });

  it("reports unavailable clipboard access", async () => {
    vi.stubGlobal("navigator", {});

    await expect(copyTextToClipboard("notes")).resolves.toBe("unavailable");
  });

  it("falls back to selection copy when clipboard access is missing", async () => {
    const appendChild = vi.fn<(node: unknown) => void>();
    const remove = vi.fn<() => void>();
    const select = vi.fn<() => void>();
    const setAttribute = vi.fn<(name: string, value: string) => void>();
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
      createElement: vi.fn<() => typeof textarea>(() => textarea),
      execCommand: vi.fn<() => boolean>(() => true),
    });

    await expect(copyTextToClipboard("app/a.ts")).resolves.toBe("copied");
    expect(textarea.value).toBe("app/a.ts");
    expect(appendChild).toHaveBeenCalledWith(textarea);
    expect(select).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();
  });

  it("reports blocked clipboard writes", async () => {
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: vi.fn<() => Promise<void>>().mockRejectedValue(new Error("blocked")),
      },
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
