import { describe, expect, it } from "vitest";

import { buildPreparedFileTree } from "./file-tree-builder";
import { testFileRow } from "./test-builders";

describe("file tree builder", () => {
  it("builds, summarizes, and compacts directory chains", () => {
    const root = buildPreparedFileTree([
      testFileRow("app/api/search/route.ts", {
        additions: 4,
        deletions: 1,
        presentIn: ["a", "b"],
      }),
      testFileRow("app/api/search/types.ts", {
        additions: 2,
        deletions: 0,
        presentIn: ["b"],
      }),
    ]);

    const app = root.children.get("app");

    expect(app).toMatchObject({
      kind: "directory",
      name: "app/api/search",
      path: "app/api/search",
    });
    expect(app?.summary).toMatchObject({
      additions: 6,
      deletions: 1,
      presentIn: ["a", "b"],
    });
    expect(app?.fileNames).toEqual(["app/api/search/route.ts", "app/api/search/types.ts"]);
    expect([...(app?.children.keys() ?? [])]).toEqual(["route.ts", "types.ts"]);
  });
});
