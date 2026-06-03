import { useCallback, useMemo, useState } from "react";

import type {
  FileNavigationTarget,
  LaneId,
  ParsedPane,
  SearchNavigationTarget,
} from "../shared/types";
import { ADAPTIVE_FILE_NAVIGATION_BEHAVIOR } from "../shared/types";
import type { ContentSearchActions, ContentSearchView } from "./content-search-popover";
import type { ContentSearchResult } from "./content-search-state";
import { buildContentSearchIndex, searchContentIndex } from "./content-search-state";

type UseContentSearchOptions = {
  parsed: ParsedPane[];
  onNavigateResult: (
    paneId: LaneId,
    fileName: string,
    options?: Pick<FileNavigationTarget, "behavior" | "lineNumber" | "side">,
  ) => void;
};

export function useContentSearch({ parsed, onNavigateResult }: UseContentSearchOptions) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [laneIds, setLaneIds] = useState<LaneId[] | null>(null);
  const [target, setTarget] = useState<SearchNavigationTarget | null>(null);

  const lanes = useMemo(
    () =>
      parsed
        .filter((pane) => pane.text.trim() && !pane.error)
        .map((pane) => ({
          active: !laneIds || laneIds.includes(pane.id),
          id: pane.id,
          label: pane.label,
        })),
    [laneIds, parsed],
  );

  const searchIndex = useMemo(() => {
    const searchablePanes = laneIds ? parsed.filter((pane) => laneIds.includes(pane.id)) : parsed;

    return buildContentSearchIndex(searchablePanes);
  }, [laneIds, parsed]);

  const results = useMemo(
    () =>
      searchContentIndex({
        index: searchIndex,
        query,
      }),
    [query, searchIndex],
  );

  const openSearch = useCallback(() => {
    setOpen(true);
  }, []);

  const selectResult = useCallback(
    (result: ContentSearchResult) => {
      setTarget((current) => ({
        fileName: result.fileName,
        lineNumber: result.lineNumber,
        paneId: result.paneId,
        query,
        side: result.side,
        token: (current?.token ?? 0) + 1,
      }));
      setOpen(false);
      onNavigateResult(result.paneId, result.fileName, {
        behavior: ADAPTIVE_FILE_NAVIGATION_BEHAVIOR,
        lineNumber: result.lineNumber,
        side: getNavigationSide(result.side),
      });
    },
    [onNavigateResult, query],
  );

  const toggleLane = useCallback(
    (id: LaneId) => {
      const allLaneIds = lanes.map((lane) => lane.id);
      const active = new Set(laneIds ?? allLaneIds);

      if (active.has(id)) active.delete(id);
      else active.add(id);

      setLaneIds(
        active.size === 0 || active.size === allLaneIds.length
          ? null
          : allLaneIds.filter((laneId) => active.has(laneId)),
      );
    },
    [laneIds, lanes],
  );

  return {
    actions: {
      onOpenChange: setOpen,
      onQueryChange: setQuery,
      onSelectResult: selectResult,
      onToggleLane: toggleLane,
    } satisfies ContentSearchActions,
    openSearch,
    target,
    view: {
      activeTarget: target,
      lanes,
      open,
      query,
      results,
    } satisfies ContentSearchView,
  };
}

function getNavigationSide(side: ContentSearchResult["side"]): FileNavigationTarget["side"] {
  return side === "deleted" ? "deletions" : "additions";
}
