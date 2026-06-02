import { describe, expect, it } from "vitest";

import {
  getDirectoryTreeRowLabel,
  getDirectoryTreeRowTitle,
  getFileTreeRowLabel,
  getFileTreeRowTitle,
} from "./file-tree-row-labels";
import type { FileRow } from "./types";

describe("file tree row labels", () => {
  it("builds accessible file labels from lane and diff metadata", () => {
    const row: FileRow = {
      additions: 12,
      deletions: 3,
      name: "app/search.ts",
      panes: {},
      presentIn: ["a", "c"],
    };

    expect(getFileTreeRowLabel(row)).toBe(
      "app/search.ts, changed in A, C, 12 additions, 3 deletions",
    );
    expect(getFileTreeRowTitle(row)).toBe("app/search.ts\nin A, C · +12 −3");
  });

  it("does not produce dangling lane text for incomplete row metadata", () => {
    const row: FileRow = {
      additions: 0,
      deletions: 0,
      name: "empty.ts",
      panes: {},
      presentIn: [],
    };

    expect(getFileTreeRowLabel(row)).toBe("empty.ts, not visible in any lane, no changes");
    expect(getFileTreeRowTitle(row)).toBe("empty.ts\nnot visible in any lane · +0 −0");
  });

  it("builds directory labels from expansion state", () => {
    expect(getDirectoryTreeRowLabel({ collapsed: true, path: "app/api" })).toBe(
      "Expand folder app/api",
    );
    expect(getDirectoryTreeRowTitle({ collapsed: true, path: "app/api" })).toBe("Expand app/api");

    expect(getDirectoryTreeRowLabel({ collapsed: false, path: "app/api" })).toBe(
      "Collapse folder app/api",
    );
    expect(getDirectoryTreeRowTitle({ collapsed: false, path: "app/api" })).toBe(
      "Collapse app/api",
    );
  });
});
