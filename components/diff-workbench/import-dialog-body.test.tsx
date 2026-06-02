import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createPane } from "./diff-data";
import { ImportDialogBody } from "./import-dialog-body";

describe("ImportDialogBody", () => {
  it("separates sample loading, clearing, and importing actions", () => {
    const html = renderToStaticMarkup(
      <ImportDialogBody
        view={{
          dragging: false,
          inputRef: null,
          panes: [createPane("a", "diff")],
          pendingFiles: [],
        }}
        actions={{
          onAdd: () => {},
          onClearAll: () => {},
          onDragEnter: () => {},
          onDragLeave: () => {},
          onDragOver: () => {},
          onDrop: () => {},
          onFiles: () => {},
          onImport: () => {},
          onLaneChange: () => {},
          onLoadSamples: () => {},
          onMove: () => {},
          onRemove: () => {},
          onSort: () => {},
        }}
      />,
    );

    expect(html).toContain("Load samples");
    expect(html).toContain("Clear all");
    expect(html).toContain("Nothing staged");
    expect(html).toContain("Import");
  });

  it("shows staged import count when files are pending", () => {
    const html = renderToStaticMarkup(
      <ImportDialogBody
        view={{
          dragging: false,
          inputRef: null,
          panes: [createPane("a")],
          pendingFiles: [{ file: new File(["diff"], "a.patch") }],
        }}
        actions={{
          onAdd: () => {},
          onClearAll: () => {},
          onDragEnter: () => {},
          onDragLeave: () => {},
          onDragOver: () => {},
          onDrop: () => {},
          onFiles: () => {},
          onImport: () => {},
          onLaneChange: () => {},
          onLoadSamples: () => {},
          onMove: () => {},
          onRemove: () => {},
          onSort: () => {},
        }}
      />,
    );

    expect(html).toContain("1 staged");
    expect(html).toContain("Import 1");
  });
});
