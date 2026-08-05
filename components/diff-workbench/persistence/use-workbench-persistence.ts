import { useEffect, useRef } from "react";

import { parsePane } from "../rendering/diff-data";
import {
  readStoredWorkbenchState,
  type StoredWorkbenchState,
  type WorkbenchPersistenceState,
  writeStoredWorkbenchState,
} from "./persistence";
import type { WorkbenchSetters } from "../workbench/workbench-state-model";

type WorkbenchPersistenceSetters = Pick<
  WorkbenchSetters,
  | "setDiffStyle"
  | "setLayout"
  | "setLineNumbers"
  | "setLaneMarkerStyle"
  | "setNotes"
  | "setPanes"
  | "setSidebarOpen"
  | "setWrap"
>;

export function useWorkbenchPersistence(
  state: WorkbenchPersistenceState,
  setters: WorkbenchPersistenceSetters,
) {
  const hasRestored = useRef(false);

  useEffect(() => {
    if (!hasRestored.current) return;
    writeStoredWorkbenchState(state);
  }, [state]);

  /* Restore persisted session once on mount. This must run after hydration:
   * localStorage is client-only and reading it during render risks SSR drift. */
  useEffect(() => {
    const saved = readStoredWorkbenchState();
    applyStoredWorkbenchState(saved, setters);
    hasRestored.current = true;
  }, [setters]);
}

export function applyStoredWorkbenchState(
  saved: StoredWorkbenchState | null,
  setters: WorkbenchPersistenceSetters,
) {
  if (!saved) return;

  // Keep the in-memory samples when every non-empty stored pane is unusable.
  // The follow-up write effect will overwrite multi-diff:v1 with the fixed panes
  // (same key — no migration version bump).
  if (saved.panes && !areStoredPanesUnusable(saved.panes)) {
    setters.setPanes(saved.panes);
  }

  if (saved.notes != null) setters.setNotes(saved.notes);
  if (saved.layout) setters.setLayout(saved.layout);
  if (saved.diffStyle) setters.setDiffStyle(saved.diffStyle);
  if (saved.wrap != null) setters.setWrap(saved.wrap);
  if (saved.lineNumbers != null) setters.setLineNumbers(saved.lineNumbers);
  if (saved.laneMarkerStyle) setters.setLaneMarkerStyle(saved.laneMarkerStyle);
  if (saved.sidebarOpen != null) setters.setSidebarOpen(saved.sidebarOpen);
}

function areStoredPanesUnusable(panes: NonNullable<StoredWorkbenchState["panes"]>) {
  const withText = panes.filter((pane) => pane.text.trim().length > 0);
  if (withText.length === 0) return false;
  // Parse errors or zero files = unusable (e.g. pre-fix demo hunk headers).
  return withText.every((pane) => {
    const parsed = parsePane(pane);
    return parsed.error != null || parsed.files.length === 0;
  });
}
