import type {
  CodeViewItem,
  CodeViewScrollBehavior,
  FileDiffMetadata,
  SelectionSide,
} from "@pierre/diffs/react";

export type DiffCodeItem = Extract<CodeViewItem, { type: "diff" }>;
export type LaneId = string;
export type Layout = "columns" | "rows";
export type DiffStyle = "split" | "unified";
export type CodeTheme = "light" | "dark";
export type LaneMarkerStyle = "letters" | "bars";
export type FileNavigationBehavior = CodeViewScrollBehavior;

export const ADAPTIVE_FILE_NAVIGATION_BEHAVIOR = "smooth-auto" satisfies FileNavigationBehavior;

export type FileNavigationTarget = {
  behavior?: FileNavigationBehavior;
  laneIds?: LaneId[];
  lineNumber?: number | null;
  name: string;
  occurrenceIndex?: number;
  side?: SelectionSide;
  token: number;
};

export type SearchNavigationTarget = {
  fileName: string;
  lineNumber: number | null;
  occurrenceIndex: number;
  paneId: LaneId;
  query: string;
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

export type FileOccurrence = {
  index: number;
  total: number;
};

export type LanePane = {
  id: LaneId;
  label: string;
};

export type FileRow = {
  name: string;
  panes: Partial<Record<LaneId, FileDiffMetadata>>;
  presentIn: LaneId[];
  occurrences?: number;
  occurrencesByLane?: Partial<Record<LaneId, number>>;
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
  occurrenceById: Map<string, FileOccurrence>;
  additions: number;
  deletions: number;
};
