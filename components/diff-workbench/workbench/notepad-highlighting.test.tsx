import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { renderHighlightedNotes } from "./notepad-highlighting";

describe("renderHighlightedNotes", () => {
  it("highlights model and diff lane references", () => {
    const html = renderToStaticMarkup(
      <>{renderHighlightedNotes("model A is safer than diff B, while Diff C adds telemetry")}</>,
    );

    expect(html).toContain("<mark");
    expect(html).toContain("model A");
    expect(html).toContain("diff B");
    expect(html).toContain("Diff C");
    expect(html).toContain("oklch(0.58 0.17 256)");
    expect(html).toContain("oklch(0.6 0.2 305)");
    expect(html).toContain("oklch(0.65 0.16 55)");
  });

  it("highlights inline and fenced code references", () => {
    const html = renderToStaticMarkup(
      <>
        {renderHighlightedNotes(
          "Review `search()` first\n```dart\nfinal model = Model A;\n```\nthen diff B",
        )}
      </>,
    );

    expect(html).toContain("`search()`");
    expect(html).toContain("```");
    expect(html).toContain("dart");
    expect(html).toContain("bg-note-foreground/12");
    expect(html).toContain("bg-note-foreground/10");
    expect(html).toContain("text-note-foreground/60");
    expect(html).toContain("diff B");
  });

  it("highlights markdown quote lines", () => {
    const html = renderToStaticMarkup(
      <>{renderHighlightedNotes("> quoted model A\nnormal diff B")}</>,
    );

    expect(html).toContain("&gt; quoted model A");
    expect(html).toContain("bg-note-foreground/10");
    expect(html).toContain("text-note-foreground/80");
    expect(html).toContain("diff B");
  });
});
