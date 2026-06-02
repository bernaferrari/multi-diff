import { EyeOff } from "lucide-react";

import { FileTypeIcon } from "./file-icons";
import type { FileTreeNode } from "./file-tree-types";
import { FileTreeLaneMarkers } from "./file-tree-lane-markers";
import { getFileTreeRowChrome } from "./file-tree-row-state";
import { DiffStats, HighlightMatch } from "./file-tree-row-parts";
import { TreeRowButton } from "./tree-row-button";
import type { LaneId, LaneMarkerStyle, Layout } from "./types";

export function FileTreeRow({
  activeFile,
  activeLaneIds,
  depth,
  focusFile,
  hidden,
  laneIds,
  laneMarkerStyle,
  layout,
  node,
  query,
  showLaneBadges,
  onContextFile,
  onNavigate,
}: {
  activeFile: string | null;
  activeLaneIds: LaneId[];
  depth: number;
  focusFile: string | null;
  hidden: boolean;
  laneIds: LaneId[];
  laneMarkerStyle: LaneMarkerStyle;
  layout: Layout;
  node: FileTreeNode;
  query: string;
  showLaneBadges: boolean;
  onContextFile: (name: string) => void;
  onNavigate: (name: string) => void;
}) {
  const row = node.row;
  if (!row) return null;

  const chrome = getFileTreeRowChrome({
    activeFile,
    activeLaneIds,
    focusFile,
    hidden,
    row,
  });

  return (
    <TreeRowButton
      data-file-row=""
      depth={depth}
      selected={chrome.isFocused}
      data-active={chrome.isActive ? "" : undefined}
      data-current-file={activeFile === row.name ? "" : undefined}
      aria-label={chrome.ariaLabel}
      title={chrome.title}
      onClick={() => onNavigate(row.name)}
      onContextMenu={() => onContextFile(row.name)}
      className={chrome.className}
    >
      {chrome.activeBorderStyle ? (
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={chrome.activeBorderStyle}
          aria-hidden
        />
      ) : null}
      <FileTypeIcon path={row.name} />
      <span className="min-w-0 flex-1 truncate">
        <HighlightMatch text={node.name} query={query} />
      </span>
      {hidden ? <EyeOff className="size-3 shrink-0" /> : null}
      <DiffStats row={row} />
      {showLaneBadges ? (
        <FileTreeLaneMarkers
          laneIds={laneIds}
          layout={layout}
          markerStyle={laneMarkerStyle}
          row={row}
        />
      ) : null}
    </TreeRowButton>
  );
}
