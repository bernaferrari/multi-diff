import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { ContextMenu } from "@/components/ui/context-menu";

import { getFilesContextMenuState } from "./files-context-menu-state";
import { RestoreContextMenuGroup } from "./restore-context-menu-group";
import { testFileRow } from "./test-builders";

const RESTORE_LIMIT = 6;

describe("restore context menu group", () => {
  it("renders restore rows and overflow action separately", () => {
    const hiddenRows = Array.from({ length: RESTORE_LIMIT + 1 }, (_, index) =>
      testFileRow(`${index}.ts`),
    );
    const rows = hiddenRows.slice(0, 2);

    const html = renderContextMenuGroup(
      <RestoreContextMenuGroup
        restoreMenu={restoreMenuFor(hiddenRows, rows)}
        onShowAllFiles={() => {}}
        onShowFiles={() => {}}
      />,
    );

    expect(html).toContain("0.ts");
    expect(html).toContain("1.ts");
    expect(html).toContain(`Show all ${RESTORE_LIMIT + 1} hidden files`);
    expect(html).not.toContain(">Show all hidden files<");
  });

  it("renders the generic restore-all action when there is no overflow", () => {
    const rows = [testFileRow("a.ts"), testFileRow("b.ts")];

    const html = renderContextMenuGroup(
      <RestoreContextMenuGroup
        restoreMenu={restoreMenuFor(rows, rows)}
        onShowAllFiles={() => {}}
        onShowFiles={() => {}}
      />,
    );

    expect(html).toContain("Show all hidden files");
    expect(html).not.toContain("Show all 2 hidden files");
  });
});

function renderContextMenuGroup(children: ReactNode) {
  return renderToStaticMarkup(<ContextMenu>{children}</ContextMenu>);
}

function restoreMenuFor(
  hiddenFileRows: ReturnType<typeof testFileRow>[],
  restorableRows: ReturnType<typeof testFileRow>[],
) {
  return getFilesContextMenuState({
    contextDirectory: null,
    contextFile: null,
    hiddenFileRows,
    restorableRows,
  }).restoreMenu;
}
