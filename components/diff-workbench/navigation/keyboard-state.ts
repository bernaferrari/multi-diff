export type WorkbenchKeyboardAction =
  | { type: "clear-focus" }
  | { type: "search-content" }
  | { delta: -1 | 1; type: "move-focus" }
  | { type: "toggle-notes" };

export function isEditableKeyboardTarget(target: unknown) {
  if (typeof HTMLElement === "undefined") return false;

  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA")
  );
}

export function getWorkbenchKeyboardAction({
  altKey,
  ctrlKey,
  defaultPrevented,
  focusFile,
  key,
  metaKey,
  targetEditable,
}: {
  altKey: boolean;
  ctrlKey: boolean;
  defaultPrevented: boolean;
  focusFile: string | null;
  key: string;
  metaKey: boolean;
  targetEditable: boolean;
}): WorkbenchKeyboardAction | null {
  const lowerKey = key.toLowerCase();

  if (!altKey && !defaultPrevented && (metaKey || ctrlKey) && lowerKey === "f") {
    return { type: "search-content" };
  }

  if (metaKey || ctrlKey || altKey || defaultPrevented || targetEditable) {
    return null;
  }

  if (lowerKey === "n") return { type: "toggle-notes" };
  if (!focusFile) return null;
  if (key === "Escape") return { type: "clear-focus" };
  if (key === "ArrowRight") return { delta: 1, type: "move-focus" };
  if (key === "ArrowLeft") return { delta: -1, type: "move-focus" };
  return null;
}
