"use client";

import { useMemo, useState } from "react";

import { renderHighlightedNotes } from "./notepad-highlighting";

export function HighlightedNotesTextarea({
  open,
  value,
  onChange,
}: {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const [noteScroll, setNoteScroll] = useState({ left: 0, top: 0 });
  const highlightedNotes = useMemo(() => renderHighlightedNotes(value), [value]);

  return (
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
  );
}
