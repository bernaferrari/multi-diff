import { describe, expect, it } from "vitest";

import {
  getWorkbenchPersistenceState,
  readStoredWorkbenchState,
  STORAGE_KEY,
  writeStoredWorkbenchState,
} from "./persistence";
import { createInitialWorkbenchState } from "./workbench-state-model";

function storageWith(initial?: string) {
  const data = new Map<string, string>();
  if (initial != null) data.set(STORAGE_KEY, initial);

  return {
    data,
    storage: {
      getItem(key: string) {
        return data.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        data.set(key, value);
      },
    },
  };
}

describe("persistence", () => {
  it("projects only durable fields into persisted state", () => {
    const state = createInitialWorkbenchState();
    state.activeFile = "app/active.ts";
    state.dragging = true;
    state.fileQuery = "route";
    state.focusFile = "app/focus.ts";
    state.hidden.add("b");
    state.hiddenFiles.add("app/hidden.ts");
    state.notesOpen = true;

    expect(getWorkbenchPersistenceState(state)).toEqual({
      diffStyle: "unified",
      laneMarkerStyle: "letters",
      layout: "columns",
      lineNumbers: true,
      notes: "",
      panes: state.panes,
      sidebarOpen: true,
      wrap: true,
    });
  });

  it("returns null for missing, invalid, or non-object saved state", () => {
    expect(readStoredWorkbenchState(storageWith().storage)).toBeNull();
    expect(readStoredWorkbenchState(storageWith("{bad json").storage)).toBeNull();
    expect(readStoredWorkbenchState(storageWith("null").storage)).toBeNull();
  });

  it("restores valid panes with canonical lane ids and labels", () => {
    const { storage } = storageWith(
      JSON.stringify({
        panes: [
          { id: "z", label: "Wrong", text: "one", filename: "one.patch" },
          { text: "two" },
          { text: 123, filename: false },
          null,
          { text: "four" },
          { text: "five" },
          { text: "six" },
        ],
      }),
    );

    expect(readStoredWorkbenchState(storage)?.panes).toEqual([
      { id: "a", label: "Diff A", text: "one", filename: "one.patch" },
      { id: "b", label: "Diff B", text: "two", filename: undefined },
      { id: "c", label: "Diff C", text: "", filename: undefined },
      { id: "d", label: "Diff D", text: "", filename: undefined },
      { id: "e", label: "Diff E", text: "four", filename: undefined },
    ]);
  });

  it("keeps only recognized enum and boolean settings", () => {
    const { storage } = storageWith(
      JSON.stringify({
        notes: "remember this",
        laneMarkerStyle: "bars",
        layout: "rows",
        diffStyle: "split",
        wrap: true,
        lineNumbers: false,
        sidebarOpen: false,
      }),
    );

    expect(readStoredWorkbenchState(storage)).toMatchObject({
      notes: "remember this",
      laneMarkerStyle: "bars",
      layout: "rows",
      diffStyle: "split",
      wrap: true,
      lineNumbers: false,
      sidebarOpen: false,
    });

    const invalid = storageWith(
      JSON.stringify({
        layout: "grid",
        laneMarkerStyle: "dots",
        diffStyle: "word",
        wrap: "yes",
        lineNumbers: 1,
        sidebarOpen: "false",
      }),
    );

    expect(readStoredWorkbenchState(invalid.storage)).toEqual({
      panes: undefined,
      notes: undefined,
      laneMarkerStyle: undefined,
      layout: undefined,
      diffStyle: undefined,
      wrap: undefined,
      lineNumbers: undefined,
      sidebarOpen: undefined,
    });
  });

  it("writes serialized state and ignores storage failures", () => {
    const { data, storage } = storageWith();

    writeStoredWorkbenchState({ notes: "saved", layout: "columns" }, storage);

    expect(JSON.parse(data.get(STORAGE_KEY) ?? "")).toEqual({
      notes: "saved",
      layout: "columns",
    });

    expect(() =>
      writeStoredWorkbenchState(
        { notes: "ignored" },
        {
          getItem: () => null,
          setItem: () => {
            throw new Error("quota");
          },
        },
      ),
    ).not.toThrow();
  });
});
