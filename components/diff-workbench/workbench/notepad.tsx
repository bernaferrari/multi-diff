"use client";

import { Check, Clipboard, Minus, StickyNote } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { HighlightedNotesTextarea } from "./highlighted-notes-textarea";
import { copyTextToClipboard } from "../shared/clipboard";

const NOTE_COPY_FEEDBACK_MS = 1400;

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

function NotepadIcon({ hasContent }: { hasContent: boolean }) {
  if (!hasContent) return <StickyNote className="size-4" />;

  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className="size-4 text-note-foreground/80"
    >
      <path
        d="M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"
        className="fill-note-foreground/45"
      />
      <path d="M15 3v5a1 1 0 0 0 1 1h5" className="fill-note" />
      <path d="M15 3v5a1 1 0 0 0 1 1h5" />
    </svg>
  );
}

export function Notepad({ open, value, onChange, onOpen, onClose }: NotepadProps) {
  const [copied, setCopied] = useState(false);
  const [compactWidth, setCompactWidth] = useState<number | null>(null);
  const compactMeasureRef = useRef<HTMLDivElement>(null);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const display = getNotepadState({ copied, value });

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
        <NotepadIcon hasContent={display.hasContent} />
        Notes
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
          <NotepadIcon hasContent={display.hasContent} />
          Notes
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
            <NotepadIcon hasContent={display.hasContent} />
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
              <span className="relative size-4 shrink-0" aria-hidden="true">
                <span
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.165,0.85,0.45,1)] motion-reduce:transition-none",
                    copied ? "scale-50 opacity-0" : "scale-100 opacity-100",
                  )}
                >
                  <Clipboard className="size-4" />
                </span>
                <span
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.165,0.85,0.45,1)] motion-reduce:transition-none",
                    copied ? "scale-100 opacity-100" : "scale-50 opacity-0",
                  )}
                >
                  <Check className="size-4" />
                </span>
              </span>
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
          <HighlightedNotesTextarea open={open} value={value} onChange={onChange} />
        </div>
      </div>
    </>
  );
}
