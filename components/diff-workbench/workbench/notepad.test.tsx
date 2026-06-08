import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Notepad } from "./notepad";

describe("Notepad", () => {
  it("labels icon-only note actions", () => {
    const html = renderToStaticMarkup(
      <Notepad
        open
        value="check parser behavior"
        onChange={() => {}}
        onClose={() => {}}
        onOpen={() => {}}
      />,
    );

    expect(html).toContain('aria-label="Copy notes"');
    expect(html).toContain('aria-label="Hide notes"');
  });

  it("shows character count and hidden-state filled note icon separately", () => {
    const openHtml = renderToStaticMarkup(
      <Notepad open value="   " onChange={() => {}} onClose={() => {}} onOpen={() => {}} />,
    );

    expect(openHtml).toContain(">3</span>");

    const closedEmptyHtml = renderToStaticMarkup(
      <Notepad open={false} value="   " onChange={() => {}} onClose={() => {}} onOpen={() => {}} />,
    );
    const closedContentHtml = renderToStaticMarkup(
      <Notepad
        open={false}
        value="todo"
        onChange={() => {}}
        onClose={() => {}}
        onOpen={() => {}}
      />,
    );

    expect(closedEmptyHtml).not.toContain("fill-note-foreground/45");
    expect(closedContentHtml).toContain("fill-note-foreground/45");
  });
});
