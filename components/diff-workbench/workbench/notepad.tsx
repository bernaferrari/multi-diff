"use client";

import { Check, Clipboard, Minus, StickyNote } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

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

export function Notepad({ open, value, onChange, onOpen, onClose }: NotepadProps) {
  const [copied, setCopied] = useState(false);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const display = getNotepadState({ copied, value });

  useEffect(
    () => () => {
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    },
    [],
  );

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

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="default"
        onClick={onOpen}
        title="Open notes (n)"
        className="fixed right-6 bottom-6 z-40 flex h-10 items-center gap-2 rounded-full !bg-note px-4 text-sm font-medium !text-note-foreground shadow-lg ring-1 ring-black/10 transition-transform hover:-translate-y-0.5 hover:!bg-note hover:!text-note-foreground"
      >
        <StickyNote className="size-4" />
        Notes
        {display.hasContent ? <span className="size-2 rounded-full bg-note-foreground/70" /> : null}
      </Button>
    );
  }

  return (
    <div className="fixed right-6 bottom-6 z-40 flex w-[min(360px,calc(100vw-3rem))] -rotate-1 flex-col rounded-xl bg-note text-note-foreground shadow-2xl ring-1 ring-black/10">
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
          className="!text-note-foreground/80 hover:!bg-note-foreground/12 hover:!text-note-foreground focus-visible:!ring-note-foreground/25"
        >
          <Minus className="size-4" />
        </Button>
      </div>
      <textarea
        value={value}
        aria-label="Notes"
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        placeholder="Loose notes, questions, tradeoffs..."
        className="bg-paper min-h-[260px] w-full resize-y rounded-b-xl bg-transparent px-4 py-2 font-mono text-[13px] leading-7 text-note-foreground outline-none placeholder:text-note-foreground/45"
      />
    </div>
  );
}
