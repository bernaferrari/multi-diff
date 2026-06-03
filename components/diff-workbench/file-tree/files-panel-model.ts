import type {
  ActiveFileByLane,
  FileRow,
  LaneId,
  LaneMarkerStyle,
  LanePane,
  Layout,
} from "../shared/types";

export type FilesPanelView = {
  activeFileByLane: ActiveFileByLane;
  activeFile: string | null;
  focusableRows: FileRow[];
  focusMode: boolean;
  focusFile: string | null;
  hidden: Set<LaneId>;
  hiddenFiles: Set<string>;
  hiddenFileRows: FileRow[];
  laneMarkerStyle: LaneMarkerStyle;
  layout: Layout;
  panes: LanePane[];
  query: string;
  rows: FileRow[];
  sharedCount: number;
};

export type FilesPanelActions = {
  onFilterFile: (name: string) => void;
  onHideFiles: (names: string[]) => void;
  onNavigate: (name: string) => void;
  onOverview: () => void;
  onQuery: (q: string) => void;
  onShowAllFiles: () => void;
  onShowFiles: (names: string[]) => void;
  onToggleLane: (id: LaneId) => void;
  onToggleFocusMode: (name?: string | null) => void;
};
