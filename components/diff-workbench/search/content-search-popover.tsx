"use client";

import { useEffect, useRef } from "react";
import { FileSearch, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { ContentSearchResult } from "./content-search-state";
import { HighlightedText } from "./content-search-highlight";
import { FileTypeIcon } from "../shared/file-icons";
import { LaneBadge } from "../lanes/lane-badge";
import { laneLabel, laneStyle } from "../lanes/lanes";
import { ToolbarIconButton } from "../toolbar/toolbar-controls";
import type { LaneId, SearchNavigationTarget } from "../shared/types";

export type ContentSearchView = {
  activeTarget: SearchNavigationTarget | null;
  lanes: ContentSearchLaneFilter[];
  open: boolean;
  query: string;
  results: ContentSearchResult[];
};

export type ContentSearchLaneFilter = {
  active: boolean;
  id: LaneId;
  label: string;
};

export type ContentSearchActions = {
  onOpenChange: (open: boolean) => void;
  onQueryChange: (query: string) => void;
  onSelectResult: (result: ContentSearchResult) => void;
  onToggleLane: (id: LaneId) => void;
};

export function ContentSearchPopover({
  actions,
  view,
}: {
  actions: ContentSearchActions;
  view: ContentSearchView;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!view.open) return;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [view.open]);

  return (
    <Popover open={view.open} onOpenChange={actions.onOpenChange}>
      <PopoverTrigger
        render={
          <ToolbarIconButton
            variant="ghost"
            aria-label="Search diff content"
            title="Search diff content"
            className="rounded-md text-muted-foreground hover:text-foreground"
          >
            <Search className="size-4" />
          </ToolbarIconButton>
        }
      />
      <PopoverContent align="start" sideOffset={8} className="w-96 gap-3 p-3">
        <PopoverHeader className="gap-1 border-b border-border/70 pb-2">
          <PopoverTitle className="flex items-center gap-2 text-sm">
            <FileSearch className="size-4 text-muted-foreground" />
            Search content
          </PopoverTitle>
          <PopoverDescription className="text-xs">
            Find text across loaded diff hunks.
          </PopoverDescription>
        </PopoverHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <input
            ref={inputRef}
            value={view.query}
            onChange={(event) => actions.onQueryChange(event.target.value)}
            aria-label="Search diff content"
            placeholder="Search additions, deletions, context..."
            spellCheck={false}
            className="h-8 w-full rounded-md border border-border bg-background pr-2 pl-8 text-xs transition-colors outline-none focus:border-ring"
          />
        </div>

        <ContentSearchLaneFilters actions={actions} lanes={view.lanes} />

        <ContentSearchResults actions={actions} view={view} />
      </PopoverContent>
    </Popover>
  );
}

function ContentSearchLaneFilters({
  actions,
  lanes,
}: {
  actions: ContentSearchActions;
  lanes: ContentSearchLaneFilter[];
}) {
  if (lanes.length < 2) return null;

  return (
    <div className="flex items-center gap-1">
      {lanes.map((lane) => (
        <Button
          key={lane.id}
          type="button"
          variant={lane.active ? "secondary" : "ghost"}
          size="xs"
          aria-pressed={lane.active}
          onClick={() => actions.onToggleLane(lane.id)}
          className="h-6 min-w-7 px-2"
        >
          <SearchLaneLabel active={lane.active} id={lane.id} />
          <span className="sr-only">{lane.label}</span>
        </Button>
      ))}
    </div>
  );
}

function SearchLaneLabel({ active, id }: { active: boolean; id: LaneId }) {
  const style = laneStyle(id);

  return (
    <span
      aria-hidden
      className={[
        "text-[11px] leading-none font-semibold",
        active ? style.text : "text-muted-foreground/45",
      ].join(" ")}
    >
      {laneLabel(id)}
    </span>
  );
}

function ContentSearchResults({
  actions,
  view,
}: {
  actions: ContentSearchActions;
  view: ContentSearchView;
}) {
  if (!view.query.trim()) {
    return (
      <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground">
        Matching lines will appear here.
      </div>
    );
  }

  if (view.results.length === 0) {
    return (
      <div className="rounded-md border border-border/70 bg-muted/25 px-3 py-5 text-center text-xs text-muted-foreground">
        No content matches.
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-auto rounded-md border border-border/70 bg-background/50">
      <div className="border-b border-border/60 px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {view.results.length} match{view.results.length === 1 ? "" : "es"}
      </div>
      <ScrollArea className="h-72">
        <div className="grid">
          {view.results.map((result) => (
            <ContentSearchResultRow
              key={result.id}
              active={isContentSearchResultActive(result, view.activeTarget, view.query)}
              actions={actions}
              result={result}
              query={view.query}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function ContentSearchResultRow({
  active,
  actions,
  query,
  result,
}: {
  active: boolean;
  actions: ContentSearchActions;
  query: string;
  result: ContentSearchResult;
}) {
  const lane = laneStyle(result.paneId);

  return (
    <Button
      type="button"
      variant="ghost"
      size="default"
      aria-current={active ? "true" : undefined}
      onClick={() => actions.onSelectResult(result)}
      className={[
        "h-auto justify-start rounded-none border-l-2 px-2.5 py-2 text-left hover:bg-muted/65",
        active ? `${lane.border} bg-muted/55` : "border-l-transparent",
      ].join(" ")}
    >
      <span className="grid min-w-0 flex-1 gap-1">
        <span className="flex min-w-0 items-center gap-1.5">
          <LaneBadge id={result.paneId} size="sm" tone="soft" />
          <FileTypeIcon path={result.fileName} />
          <span className="truncate font-mono text-xs">{result.fileName}</span>
          {result.lineNumber ? (
            <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
              {result.lineNumber}
            </span>
          ) : null}
        </span>
        <span className="truncate font-mono text-xs text-muted-foreground">
          <HighlightedText query={query}>{result.preview}</HighlightedText>
        </span>
      </span>
    </Button>
  );
}

export function isContentSearchResultActive(
  result: ContentSearchResult,
  target: SearchNavigationTarget | null,
  query: string,
) {
  return (
    target?.paneId === result.paneId &&
    target.fileName === result.fileName &&
    target.lineNumber === result.lineNumber &&
    target.occurrenceIndex === result.occurrenceIndex &&
    target.side === result.side &&
    target.query.trim().toLocaleLowerCase() === query.trim().toLocaleLowerCase()
  );
}
