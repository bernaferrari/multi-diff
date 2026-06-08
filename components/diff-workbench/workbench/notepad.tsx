"use client";

import { Check, Clipboard, Minus, StickyNote } from "lucide-react";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { copyTextToClipboard } from "../shared/clipboard";
import type { LaneId } from "../shared/types";

const NOTE_COPY_FEEDBACK_MS = 1400;
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

type NotepadProps = {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onOpen: () => void;
  onClose: () => void;
};

function getNotepadState({ copied, value }: { copied: boolean; value: string }) {
  return {
    characterCount: value.length,
    copyLabel: copied ? "Notes copied" : "Copy notes",
    hasContent: value.trim().length > 0,
  };
}

function renderHighlightedNotes(value: string) {
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

export function Notepad({ open, value, onChange, onOpen, onClose }: NotepadProps) {
  const [copied, setCopied] = useState(false);
  const [compactWidth, setCompactWidth] = useState<number | null>(null);
  const [noteScroll, setNoteScroll] = useState({ left: 0, top: 0 });
  const compactMeasureRef = useRef<HTMLDivElement>(null);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const display = getNotepadState({ copied, value });
  const highlightedNotes = useMemo(() => renderHighlightedNotes(value), [value]);

  useEffect(
    () => () => {
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    },
    [],
  );

  useLayoutEffect(() => {
    const element = compactMeasureRef.current;
    if (!element) return;
    const measuredElement = element;

    function updateCompactWidth() {
      const nextWidth = Math.ceil(measuredElement.getBoundingClientRect().width);
      setCompactWidth((width) => (width === nextWidth ? width : nextWidth));
    }

    updateCompactWidth();

    if (typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(updateCompactWidth);
    resizeObserver.observe(measuredElement);

    return () => resizeObserver.disconnect();
  }, [display.hasContent]);

  async function copy() {
    if ((await copyTextToClipboard(value)) === "copied") {
      clearCopyResetTimer();
      setCopied(true);
      copyResetTimer.current = setTimeout(() => {
        setCopied(false);
        copyResetTimer.current = null;
      }, NOTE_COPY_FEEDBACK_MS);
    }
  }

  function clearCopyResetTimer() {
    if (!copyResetTimer.current) return;
    clearTimeout(copyResetTimer.current);
    copyResetTimer.current = null;
  }

  return (
    <>
      <div
        ref={compactMeasureRef}
        aria-hidden
        className="pointer-events-none fixed top-0 -left-[9999px] flex h-10 w-auto items-center gap-2 rounded-xl px-4 text-sm font-medium opacity-0"
      >
        <StickyNote className="size-4" />
        Notes
        {display.hasContent ? <span className="size-2 rounded-full bg-note-foreground/70" /> : null}
      </div>

      <div
        style={compactWidth && !open ? { width: compactWidth } : undefined}
        className={cn(
          "fixed right-6 bottom-6 z-40 overflow-hidden bg-note text-note-foreground ring-1 ring-black/10",
          "transition-[width,height,border-radius,transform,box-shadow] duration-300 ease-in-out motion-reduce:transition-none",
          open
            ? "h-[340px] w-[min(360px,calc(100vw-3rem))] -rotate-1 rounded-xl shadow-2xl"
            : "h-10 rotate-0 rounded-xl shadow-lg",
        )}
      >
        <Button
          variant="ghost"
          size="default"
          onClick={onOpen}
          title="Open notes (n)"
          aria-hidden={open}
          tabIndex={open ? -1 : undefined}
          className={cn(
            "flex h-10 w-auto items-center gap-2 rounded-[inherit] !bg-note px-4 text-sm font-medium !text-note-foreground",
            "transition-[opacity,transform,background-color] duration-200 ease-out motion-reduce:transition-none",
            "hover:!bg-note hover:!text-note-foreground",
            open && "pointer-events-none absolute inset-0 h-full w-full scale-95 opacity-0",
          )}
        >
          <StickyNote className="size-4" />
          Notes
          {display.hasContent ? (
            <span className="size-2 rounded-full bg-note-foreground/70" />
          ) : null}
        </Button>

        <div
          aria-hidden={!open}
          className={cn(
            "absolute inset-0 flex flex-col",
            "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-2 scale-[0.98] opacity-0",
          )}
        >
          <div className="flex items-center gap-2 rounded-t-xl border-b border-note-foreground/15 px-3 py-2">
            <StickyNote className="size-4" />
            <span className="text-sm font-semibold">Observations</span>
            <span className="ml-auto font-mono text-[11px] text-note-foreground/60 tabular-nums">
              {display.characterCount}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={copy}
              aria-label={display.copyLabel}
              title={display.copyLabel}
              tabIndex={open ? undefined : -1}
              className="!text-note-foreground/80 hover:!bg-note-foreground/12 hover:!text-note-foreground focus-visible:!ring-note-foreground/25"
            >
              {copied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Hide notes"
              title="Hide notes (n)"
              tabIndex={open ? undefined : -1}
              className="!text-note-foreground/80 hover:!bg-note-foreground/12 hover:!text-note-foreground focus-visible:!ring-note-foreground/25"
            >
              <Minus className="size-4" />
            </Button>
          </div>
          <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-b-xl">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden px-4 py-2 font-mono text-[13px] leading-7 whitespace-pre-wrap text-note-foreground"
            >
              <pre
                className="m-0 min-h-full whitespace-pre-wrap break-words"
                style={{
                  transform: `translate(${-noteScroll.left}px, ${-noteScroll.top}px)`,
                }}
              >
                {highlightedNotes}
                {value.endsWith("\n") ? " " : null}
              </pre>
            </div>
            <textarea
              value={value}
              aria-label="Notes"
              tabIndex={open ? undefined : -1}
              onChange={(event) => onChange(event.target.value)}
              onScroll={(event) =>
                setNoteScroll({
                  left: event.currentTarget.scrollLeft,
                  top: event.currentTarget.scrollTop,
                })
              }
              spellCheck={false}
              placeholder="Loose notes, questions, tradeoffs..."
              className="scroll-note bg-paper relative h-full min-h-0 w-full resize-none overflow-y-auto rounded-b-xl bg-transparent px-4 py-2 font-mono text-[13px] leading-7 text-transparent caret-note-foreground outline-none selection:bg-note-foreground/20 placeholder:text-note-foreground/45"
            />
          </div>
        </div>
      </div>
    </>
  );
}
