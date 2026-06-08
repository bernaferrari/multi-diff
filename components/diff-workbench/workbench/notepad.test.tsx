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

  it("shows character count and hidden-state content marker separately", () => {
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

    expect(closedEmptyHtml).not.toContain("bg-note-foreground/70");
    expect(closedContentHtml).toContain("bg-note-foreground/70");
  });

  it("highlights model and diff lane references in notes", () => {
    const html = renderToStaticMarkup(
      <Notepad
        open
        value="model A is safer than diff B, while Diff C adds telemetry"
        onChange={() => {}}
        onClose={() => {}}
        onOpen={() => {}}
      />,
    );

    expect(html).toContain("<mark");
    expect(html).toContain("model A");
    expect(html).toContain("diff B");
    expect(html).toContain("Diff C");
    expect(html).toContain("oklch(0.58 0.17 256)");
    expect(html).toContain("oklch(0.6 0.2 305)");
    expect(html).toContain("oklch(0.65 0.16 55)");
  });

  it("highlights inline and fenced code references in notes", () => {
    const html = renderToStaticMarkup(
      <Notepad
        open
        value={"Review `search()` first\n```dart\nfinal model = Model A;\n```\nthen diff B"}
        onChange={() => {}}
        onClose={() => {}}
        onOpen={() => {}}
      />,
    );

    expect(html).toContain("`search()`");
    expect(html).toContain("```");
    expect(html).toContain("dart");
    expect(html).toContain("bg-note-foreground/12");
    expect(html).toContain("bg-note-foreground/10");
    expect(html).toContain("text-note-foreground/60");
    expect(html).toContain("diff B");
  });

  it("highlights markdown quote lines in notes", () => {
    const html = renderToStaticMarkup(
      <Notepad
        open
        value={"> quoted model A\nnormal diff B"}
        onChange={() => {}}
        onClose={() => {}}
        onOpen={() => {}}
      />,
    );

    expect(html).toContain("&gt; quoted model A");
    expect(html).toContain("bg-note-foreground/10");
    expect(html).toContain("text-note-foreground/80");
    expect(html).toContain("diff B");
  });
});
