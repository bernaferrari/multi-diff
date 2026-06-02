import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DirectoryTreeBranch } from "./directory-tree-row";
import { getDirectoryHiddenState, getDirectoryTreeRowChrome } from "./directory-tree-row-state";
import type { FileTreeNode } from "./file-tree-types";
import type { FileRow } from "./types";

describe("directory tree row state", () => {
  it("distinguishes visible, partially hidden, and fully hidden directories", () => {
    expect(getDirectoryHiddenState(["a.ts", "b.ts"], new Set())).toMatchObject({
      fullyHidden: false,
      hiddenCount: 0,
      partiallyHidden: false,
    });

    expect(getDirectoryHiddenState(["a.ts", "b.ts"], new Set(["a.ts"]))).toMatchObject({
      fullyHidden: false,
      hiddenCount: 1,
      partiallyHidden: true,
    });

    expect(getDirectoryHiddenState(["a.ts", "b.ts"], new Set(["a.ts", "b.ts"]))).toMatchObject({
      fullyHidden: true,
      hiddenCount: 2,
      partiallyHidden: false,
    });
  });

  it("does not treat an empty directory as fully hidden", () => {
    expect(getDirectoryHiddenState([], new Set())).toMatchObject({
      fullyHidden: false,
      hiddenCount: 0,
      partiallyHidden: false,
    });
  });

  it("formats directory titles by expansion state", () => {
    expect(
      getDirectoryTreeRowChrome({
        collapsed: true,
        fullyHidden: false,
        hasSummary: false,
        partiallyHidden: false,
        path: "app/api",
      }),
    ).toMatchObject({
      ariaLabel: "Expand folder app/api",
      className: expect.stringContaining("font-medium"),
      title: "Expand app/api",
    });

    expect(
      getDirectoryTreeRowChrome({
        collapsed: false,
        fullyHidden: false,
        hasSummary: false,
        partiallyHidden: false,
        path: "app/api",
      }),
    ).toMatchObject({
      ariaLabel: "Collapse folder app/api",
      title: "Collapse app/api",
    });
  });

  it("maps directory hidden states to visual classes", () => {
    expect(
      getDirectoryTreeRowChrome({
        collapsed: false,
        fullyHidden: true,
        hasSummary: false,
        partiallyHidden: false,
        path: "components",
      }).className,
    ).toContain("opacity-60");
    expect(
      getDirectoryTreeRowChrome({
        collapsed: false,
        fullyHidden: false,
        hasSummary: false,
        partiallyHidden: true,
        path: "components",
      }).hiddenIconClass,
    ).toContain("opacity-55");
    expect(
      getDirectoryTreeRowChrome({
        collapsed: false,
        fullyHidden: true,
        hasSummary: false,
        partiallyHidden: false,
        path: "components",
      }).hiddenIconClass,
    ).toBe("size-3 shrink-0");
  });

  it("builds directory row chrome from expansion and hidden state", () => {
    expect(
      getDirectoryTreeRowChrome({
        collapsed: true,
        fullyHidden: false,
        hasSummary: true,
        partiallyHidden: true,
        path: "components",
      }),
    ).toMatchObject({
      ariaLabel: "Expand folder components",
      hiddenIconClass: "size-3 shrink-0 opacity-55",
      showSummary: true,
      title: "Expand components",
    });

    expect(
      getDirectoryTreeRowChrome({
        collapsed: false,
        fullyHidden: true,
        hasSummary: true,
        partiallyHidden: false,
        path: "components",
      }),
    ).toMatchObject({
      ariaLabel: "Collapse folder components",
      hiddenIconClass: "size-3 shrink-0",
      showSummary: false,
      title: "Collapse components",
    });
  });

  it("derives directory hidden state from descendant file names", () => {
    const node = directoryNode("lib", [fileNode("lib/audit.ts"), fileNode("lib/search.ts")]);
    const partiallyHidden = renderToStaticMarkup(
      createElement(DirectoryTreeBranch, {
        collapsed: false,
        depth: 0,
        hiddenFiles: new Set(["lib/audit.ts"]),
        laneIds: ["a", "b"],
        laneMarkerStyle: "letters",
        layout: "columns",
        node,
        showLaneBadges: false,
        onContextDirectory: () => {},
        onToggle: () => {},
      }),
    );

    expect(partiallyHidden).toContain("opacity-55");
    expect(partiallyHidden).not.toContain("opacity-60");

    const fullyHidden = renderToStaticMarkup(
      createElement(DirectoryTreeBranch, {
        collapsed: false,
        depth: 0,
        hiddenFiles: new Set(["lib/audit.ts", "lib/search.ts"]),
        laneIds: ["a", "b"],
        laneMarkerStyle: "letters",
        layout: "columns",
        node,
        showLaneBadges: false,
        onContextDirectory: () => {},
        onToggle: () => {},
      }),
    );

    expect(fullyHidden).toContain("opacity-60");
  });
});

function directoryNode(path: string, children: FileTreeNode[]): FileTreeNode {
  return {
    children: new Map(children.map((child) => [child.path, child])),
    fileNames: children.flatMap((child) => child.fileNames ?? []),
    kind: "directory",
    name: path.split("/").pop() ?? path,
    path,
  };
}

function fileNode(name: string): FileTreeNode {
  return {
    children: new Map(),
    kind: "file",
    fileNames: [name],
    name: name.split("/").pop() ?? name,
    path: name,
    row: fileRow(name),
  };
}

function fileRow(name: string): FileRow {
  return {
    additions: 1,
    deletions: 0,
    name,
    panes: {},
    presentIn: ["a"],
  };
}
