import type { ReactNode } from "react";

export type HighlightedTextPart = { text: string; type: "match" } | { text: string; type: "text" };

export function getHighlightedTextParts(text: string, query: string) {
  const needle = query.trim();
  if (!needle) return [{ text, type: "text" }] satisfies HighlightedTextPart[];

  const parts: HighlightedTextPart[] = [];
  const lowerText = text.toLocaleLowerCase();
  const lowerNeedle = needle.toLocaleLowerCase();
  let cursor = 0;

  while (cursor < text.length) {
    const index = lowerText.indexOf(lowerNeedle, cursor);
    if (index === -1) break;

    if (index > cursor) {
      parts.push({ text: text.slice(cursor, index), type: "text" });
    }

    const end = index + needle.length;
    parts.push({ text: text.slice(index, end), type: "match" });
    cursor = end;
  }

  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), type: "text" });
  }

  return parts.length ? parts : [{ text, type: "text" }];
}

export function HighlightedText({ children, query }: { children: string; query: string }) {
  return getHighlightedTextParts(children, query).map<ReactNode>((part, index) => {
    if (part.type === "text") return part.text;

    return (
      <mark
        key={`${part.text}-${index}`}
        className="rounded-[3px] bg-amber-300/35 px-0.5 text-foreground ring-1 ring-amber-300/25 dark:bg-amber-300/20 dark:ring-amber-200/20"
      >
        {part.text}
      </mark>
    );
  });
}
