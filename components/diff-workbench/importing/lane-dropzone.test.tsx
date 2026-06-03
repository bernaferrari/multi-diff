import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DIFF_FILE_ACCEPT_LABEL } from "./diff-file-input";
import { LaneDropzone } from "./lane-dropzone";
import { laneStyle } from "../lanes/lanes";

describe("LaneDropzone", () => {
  it("uses the shared diff file accept copy", () => {
    const html = renderToStaticMarkup(<LaneDropzone style={laneStyle("a")} onImport={() => {}} />);

    expect(html).toContain("Drop diff here");
    expect(html).toContain(DIFF_FILE_ACCEPT_LABEL);
  });
});
