import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createPane } from "../rendering/diff-data";
import { ImportDialogBody } from "./import-dialog-body";

describe("ImportDialogBody", () => {
  it("keeps the empty import footer focused on samples and importing", () => {
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
          onDragEnter: () => {},
          onDragLeave: () => {},
          onDragOver: () => {},
          onDrop: () => {},
          onFiles: () => {},
          onImport: () => {},
          onLaneChange: () => {},
          onLoadGuide: () => {},
          onLoadSamples: () => {},
          onMove: () => {},
          onRemove: () => {},
          onSort: () => {},
        }}
      />,
    );

    expect(html).toContain("Load samples");
    expect(html).toContain("Guide");
    expect(html).toContain("Import");
    expect(html).not.toContain("Clear all");
    expect(html).not.toContain("Nothing staged");
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
          onDragEnter: () => {},
          onDragLeave: () => {},
          onDragOver: () => {},
          onDrop: () => {},
          onFiles: () => {},
          onImport: () => {},
          onLaneChange: () => {},
          onLoadGuide: () => {},
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
