import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { ContextMenu } from "@/components/ui/context-menu";

import { DirectoryContextMenuGroup, FileContextMenuGroup } from "./files-context-menu-groups";

describe("files context menu groups", () => {
  it("renders the file action that matches current visibility", () => {
    expect(
      renderContextMenuGroup(
        <FileContextMenuGroup
          hidden={false}
          name="app/search.ts"
          onHideFiles={() => {}}
          onShowFiles={() => {}}
        />,
      ),
    ).toContain("Hide file");

    expect(
      renderContextMenuGroup(
        <FileContextMenuGroup
          hidden
          name="app/search.ts"
          onHideFiles={() => {}}
          onShowFiles={() => {}}
        />,
      ),
    ).toContain("Show file");
  });

  it("renders directory restore action when only some children are hidden", () => {
    const html = renderContextMenuGroup(
      <DirectoryContextMenuGroup
        contextDirectory={{ label: "lib", names: ["lib/a.ts", "lib/b.ts"] }}
        hiddenFiles={new Set(["lib/a.ts"])}
        onHideFiles={() => {}}
        onShowFiles={() => {}}
      />,
    );

    expect(html).toContain("Hide folder");
    expect(html).toContain("Show hidden children");
  });
});

function renderContextMenuGroup(children: ReactNode) {
  return renderToStaticMarkup(<ContextMenu>{children}</ContextMenu>);
}
