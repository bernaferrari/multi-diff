import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LaneActionsMenu } from "./lane-actions-menu";

describe("lane actions menu", () => {
  it("renders the lane action trigger with the derived label", () => {
    const html = renderToStaticMarkup(
      <LaneActionsMenu
        actions={{ canClear: true, label: "Diff A actions" }}
        canMoveLeft={false}
        canMoveRight
        importInputRef={createRef<HTMLInputElement>()}
        onClear={() => {}}
        onHide={() => {}}
        onMoveLeft={() => {}}
        onMoveRight={() => {}}
      />,
    );

    expect(html).toContain("Diff A actions");
  });
});
