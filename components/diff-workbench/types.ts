import type { CodeViewItem, FileDiffMetadata } from "@pierre/diffs/react";

export type DiffCodeItem = Extract<CodeViewItem, { type: "diff" }>;
export type LaneId = string;
export type Layout = "columns" | "rows";
export type DiffStyle = "split" | "unified";
export type CodeTheme = "light" | "dark";
export type LaneMarkerStyle = "letters" | "bars";

export type FileNavigationTarget = {
  behavior?: "instant" | "smooth";
  name: string;
  token: number;
};

export type SearchNavigationTarget = {
  fileName: string;
  lineNumber: number | null;
  paneId: LaneId;
  side: "added" | "context" | "deleted";
  token: number;
};

export type ActiveFileByLane = Partial<Record<LaneId, string>>;

export type DiffRenderSettings = {
  codeTheme: CodeTheme;
  diffStyle: DiffStyle;
  lineNumbers: boolean;
  wrap: boolean;
};

export type LanePane = {
  id: LaneId;
  label: string;
};

export type FileRow = {
  name: string;
  panes: Partial<Record<LaneId, FileDiffMetadata>>;
  presentIn: LaneId[];
  additions: number;
  deletions: number;
};

export type DirectoryContext = {
  label: string;
  names: string[];
};

export type Pane = {
  id: LaneId;
  label: string;
  text: string;
  filename?: string;
};

export type ParsedPane = Pane & {
  items: DiffCodeItem[];
  files: FileDiffMetadata[];
  error?: string;
  additions: number;
  deletions: number;
};

export type PaneView = {
  id: LaneId;
  files: FileDiffMetadata[];
  items: DiffCodeItem[];
  idByName: Map<string, string>;
  additions: number;
  deletions: number;
};
