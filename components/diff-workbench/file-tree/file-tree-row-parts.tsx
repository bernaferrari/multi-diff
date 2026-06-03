import { Fragment } from "react";

import { getVisibleDiffStatParts } from "../rendering/diff-stat-format";
import { LaneBadge } from "../lanes/lane-badge";
import { laneLabel } from "../lanes/lanes";
import type { FileRow } from "../shared/types";

type TextPart = {
  highlighted: boolean;
  text: string;
};

function splitHighlightedText(text: string, query: string): TextPart[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [{ highlighted: false, text }];

  const lower = text.toLowerCase();
  const parts: TextPart[] = [];
  let cursor = 0;
  let match = lower.indexOf(needle);

  while (match !== -1) {
    if (match > cursor) {
      parts.push({ highlighted: false, text: text.slice(cursor, match) });
    }
    parts.push({
      highlighted: true,
      text: text.slice(match, match + needle.length),
    });
    cursor = match + needle.length;
    match = lower.indexOf(needle, cursor);
  }

  if (cursor < text.length) {
    parts.push({ highlighted: false, text: text.slice(cursor) });
  }

  return parts;
}

export function HighlightMatch({ query, text }: { query: string; text: string }) {
  return (
    <>
      {splitHighlightedText(text, query).map((part, index) =>
        part.highlighted ? (
          <mark
            key={index}
            className="rounded-[2px] bg-amber-300/55 text-inherit dark:bg-amber-400/30"
          >
            {part.text}
          </mark>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}

export function DiffStats({ row }: { row: FileRow }) {
  const stats = getVisibleDiffStatParts(row);
  const repeatedLanes = getRepeatedLanes(row);

  return (
    <span className="flex w-24 shrink-0 items-center justify-end gap-1.5 text-right font-mono text-[10px] leading-none tabular-nums">
      {repeatedLanes.map(([laneId, count]) => (
        <span
          key={laneId}
          className="inline-flex items-center gap-0.5 rounded border border-border/60 bg-background/65 px-1 py-0.5"
          title={`${laneLabel(laneId)} has ${count} patch blocks for this file`}
        >
          <LaneBadge id={laneId} size="sm" tone="soft" />
          <span className="text-[9px] text-muted-foreground">x{count}</span>
        </span>
      ))}
      {stats.additions ? <span className="text-add">{stats.additions}</span> : null}
      {stats.deletions ? <span className="text-del">{stats.deletions}</span> : null}
    </span>
  );
}

function getRepeatedLanes(row: FileRow) {
  return Object.entries(row.occurrencesByLane ?? {}).filter(([, count]) => (count ?? 0) > 1);
}
