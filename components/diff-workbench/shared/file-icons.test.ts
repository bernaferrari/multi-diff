import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FileTypeIcon, TreeIconSprite } from "./file-icons";

describe("file icons", () => {
  it("renders tree icon metadata as svg markup", () => {
    const html = renderToStaticMarkup(
      createElement(FileTypeIcon, { path: "components/result-list.tsx" }),
    );

    expect(html).toContain("text-[#61dafb]");
    expect(html).toContain("<use");
    expect(html).not.toContain('href="##');
  });

  it("renders local fallback icons for popular languages missing upstream icons", () => {
    const javaHtml = renderToStaticMarkup(createElement(FileTypeIcon, { path: "src/Main.java" }));
    const csharpHtml = renderToStaticMarkup(
      createElement(FileTypeIcon, { path: "src/Program.cs" }),
    );
    const phpHtml = renderToStaticMarkup(createElement(FileTypeIcon, { path: "public/index.php" }));

    expect(javaHtml).toContain("text-[#e76f00]");
    expect(javaHtml).toContain("#file-tree-local-java");
    expect(csharpHtml).toContain("text-[#68217a]");
    expect(csharpHtml).toContain("#file-tree-local-csharp");
    expect(phpHtml).toContain("text-[#777bb4]");
    expect(phpHtml).toContain("#file-tree-local-php");
  });

  it("falls back to muted text for unknown icon tokens", () => {
    const html = renderToStaticMarkup(createElement(FileTypeIcon, { path: "unknown.filetype" }));

    expect(html).toContain("text-muted-foreground");
  });

  it("renders the shared file icon sprite sheet once", () => {
    const html = renderToStaticMarkup(createElement(TreeIconSprite));

    expect(html).toContain("data-icon-sprite");
    expect(html).toContain("file-tree-local-java");
  });
});
