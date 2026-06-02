import { describe, expect, it } from "vitest";

import { formatFileCount, formatHiddenFileCount } from "./file-count-format";

describe("file count formatting", () => {
  it("pluralizes file counts consistently", () => {
    expect(formatFileCount(0)).toBe("0 files");
    expect(formatFileCount(1)).toBe("1 file");
    expect(formatFileCount(2)).toBe("2 files");
    expect(formatHiddenFileCount(1)).toBe("1 hidden file");
    expect(formatHiddenFileCount(2)).toBe("2 hidden files");
  });
});
