import type { CSSProperties, ReactNode } from "react";

import type { LaneId } from "../shared/types";

const FENCED_CODE_PATTERN = /```([A-Za-z0-9_-]+)?[^\n]*(?:\n[\s\S]*?(?:\n```|$)|$)/g;
const INLINE_CODE_PATTERN = /`[^`\n]+`/g;
const BLOCKQUOTE_PATTERN = /^>[^\n]*(?:\n>[^\n]*)*/gm;
const LANE_REFERENCE_PATTERN = /\b(model|diff)\s+([a-e])\b/gi;
const NOTE_REFERENCE_COLORS: Partial<Record<LaneId, string>> = {
  a: "oklch(0.58 0.17 256)",
  b: "oklch(0.6 0.2 305)",
  c: "oklch(0.65 0.16 55)",
  d: "oklch(0.58 0.16 185)",
  e: "oklch(0.58 0.18 20)",
};

export function renderHighlightedNotes(value: string) {
  if (!value) return null;

  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(FENCED_CODE_PATTERN)) {
    const block = match[0];
    const index = match.index ?? 0;
    const language = match[1];

    if (index > lastIndex) {
      parts.push(...renderInlineHighlightedNotes(value.slice(lastIndex, index), `plain-${index}`));
    }

    parts.push(renderFencedCodeBlock(block, language, index));
    lastIndex = index + block.length;
  }

  if (lastIndex < value.length) {
    parts.push(...renderInlineHighlightedNotes(value.slice(lastIndex), `plain-${lastIndex}`));
  }

  return parts;
}

function renderInlineHighlightedNotes(value: string, keyPrefix: string) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(BLOCKQUOTE_PATTERN)) {
    const phrase = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(
        ...renderInlineCodeNotes(value.slice(lastIndex, index), `${keyPrefix}-plain-${index}`),
      );
    }

    parts.push(
      <mark
        key={`${keyPrefix}-quote-${index}`}
        className="rounded-[3px] bg-note-foreground/10 font-normal text-note-foreground/80"
      >
        {phrase}
      </mark>,
    );

    lastIndex = index + phrase.length;
  }

  if (lastIndex < value.length) {
    parts.push(...renderInlineCodeNotes(value.slice(lastIndex), `${keyPrefix}-plain-${lastIndex}`));
  }

  return parts;
}

function renderInlineCodeNotes(value: string, keyPrefix: string) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(INLINE_CODE_PATTERN)) {
    const phrase = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(
        ...renderLaneReferences(value.slice(lastIndex, index), `${keyPrefix}-lane-${index}`),
      );
    }

    parts.push(
      <mark
        key={`${keyPrefix}-code-${index}`}
        className="rounded-[3px] bg-note-foreground/12 font-normal text-note-foreground"
      >
        {phrase}
      </mark>,
    );

    lastIndex = index + phrase.length;
  }

  if (lastIndex < value.length) {
    parts.push(...renderLaneReferences(value.slice(lastIndex), `${keyPrefix}-lane-${lastIndex}`));
  }

  return parts;
}

function renderLaneReferences(value: string, keyPrefix: string) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(LANE_REFERENCE_PATTERN)) {
    const phrase = match[0];
    const index = match.index ?? 0;
    const laneId = match[2].toLowerCase() as LaneId;
    const laneColor = NOTE_REFERENCE_COLORS[laneId] ?? `var(--lane-${laneId})`;
    const style = {
      backgroundColor: `color-mix(in oklch, ${laneColor} 26%, transparent)`,
      color: `color-mix(in srgb, ${laneColor} 62%, var(--note-foreground))`,
    } satisfies CSSProperties;

    if (index > lastIndex) parts.push(value.slice(lastIndex, index));

    parts.push(
      <mark
        key={`${keyPrefix}-${index}-${phrase}`}
        className="rounded-[3px] font-normal"
        style={style}
      >
        {phrase}
      </mark>,
    );

    lastIndex = index + phrase.length;
  }

  if (lastIndex < value.length) parts.push(value.slice(lastIndex));

  return parts;
}

function renderFencedCodeBlock(block: string, language: string | undefined, index: number) {
  if (!language) {
    return (
      <mark
        key={`fence-${index}`}
        className="rounded-[3px] bg-note-foreground/10 font-normal text-note-foreground"
      >
        {block}
      </mark>
    );
  }

  const languageStart = block.indexOf(language, 3);
  if (languageStart < 0) {
    return (
      <mark
        key={`fence-${index}`}
        className="rounded-[3px] bg-note-foreground/10 font-normal text-note-foreground"
      >
        {block}
      </mark>
    );
  }

  return (
    <mark
      key={`fence-${index}`}
      className="rounded-[3px] bg-note-foreground/10 font-normal text-note-foreground"
    >
      {block.slice(0, languageStart)}
      <span className="text-note-foreground/60">{language}</span>
      {block.slice(languageStart + language.length)}
    </mark>
  );
}
