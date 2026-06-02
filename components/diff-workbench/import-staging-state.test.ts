import { describe, expect, it } from "vitest";

import {
  appendImportFiles,
  isStagedImportFiles,
  removeImportFile,
  reorderImportFiles,
  setImportFileTargetLane,
  sortImportFilesByName,
} from "./import-staging-state";

describe("import staging state", () => {
  it("appends staged import files up to the lane limit", () => {
    const files = appendImportFiles(
      [{ file: new File(["a"], "a.patch") }],
      [
        new File(["b"], "b.patch"),
        new File(["c"], "c.patch"),
        new File(["d"], "d.patch"),
        new File(["e"], "e.patch"),
        new File(["f"], "f.patch"),
      ],
    );

    expect(files.map((item) => item.file.name)).toEqual([
      "a.patch",
      "b.patch",
      "c.patch",
      "d.patch",
      "e.patch",
    ]);
  });

  it("keeps the same staged array when no files are added", () => {
    const current = [{ file: new File(["a"], "a.patch") }];

    expect(appendImportFiles(current, null)).toBe(current);
    expect(appendImportFiles(current, [])).toBe(current);
  });

  it("sorts staged import files by name using natural order", () => {
    const files = [
      { file: new File(["c"], "changes (10).diff") },
      { file: new File(["a"], "changes (2).diff") },
      { file: new File(["b"], "alpha.diff") },
    ];

    expect(sortImportFilesByName(files).map((item) => item.file.name)).toEqual([
      "alpha.diff",
      "changes (2).diff",
      "changes (10).diff",
    ]);
    expect(files.map((item) => item.file.name)).toEqual([
      "changes (10).diff",
      "changes (2).diff",
      "alpha.diff",
    ]);
  });

  it("reorders and removes staged import files", () => {
    const files = [
      { file: new File(["a"], "a.patch") },
      { file: new File(["b"], "b.patch") },
      { file: new File(["c"], "c.patch") },
    ];

    expect(reorderImportFiles(files, 0, 2).map((item) => item.file.name)).toEqual([
      "b.patch",
      "c.patch",
      "a.patch",
    ]);
    expect(reorderImportFiles(files, -1, 2)).toBe(files);

    expect(removeImportFile(files, 1).map((item) => item.file.name)).toEqual([
      "a.patch",
      "c.patch",
    ]);
    expect(removeImportFile(files, 9)).toBe(files);
  });

  it("can pin a staged file to a specific lane", () => {
    const files = [{ file: new File(["a"], "a.patch") }];

    expect(setImportFileTargetLane(files, 0, "c")).toEqual([
      { file: files[0].file, targetLane: "c" },
    ]);
  });

  it("detects staged import arrays", () => {
    expect(isStagedImportFiles([{ file: new File(["a"], "a.patch") }])).toBe(true);
    expect(isStagedImportFiles([new File(["a"], "a.patch")])).toBe(false);
    expect(isStagedImportFiles(null)).toBe(false);
  });
});
