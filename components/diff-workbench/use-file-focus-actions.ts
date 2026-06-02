import { type Dispatch, type SetStateAction, useCallback } from "react";

import type { FileRow } from "./types";

export function useFileFocusActions({
  activeFile,
  fileRows,
  focusFile,
  setFocusFile,
}: {
  activeFile: string | null;
  fileRows: FileRow[];
  focusFile: string | null;
  setFocusFile: Dispatch<SetStateAction<string | null>>;
}) {
  const focusFileByOffset = useCallback(
    (delta: number) => {
      const next = getFileFocusByOffset({
        activeFile,
        delta,
        focusFile,
        rows: fileRows,
      });
      if (next) setFocusFile(next);
    },
    [activeFile, fileRows, focusFile, setFocusFile],
  );

  const clearFocusedFile = useCallback(() => {
    setFocusFile(null);
  }, [setFocusFile]);

  const toggleFocusFile = useCallback(
    (name: string) => {
      setFocusFile((current) => (current === name ? null : name));
    },
    [setFocusFile],
  );

  return {
    clearFocusedFile,
    focusFileByOffset,
    toggleFocusFile,
  };
}

function getFileFocusByOffset({
  activeFile,
  delta,
  focusFile,
  rows,
}: {
  activeFile: string | null;
  delta: number;
  focusFile: string | null;
  rows: FileRow[];
}) {
  if (rows.length === 0) return null;

  const current = focusFile ?? activeFile;
  const currentIndex = current ? rows.findIndex((row) => row.name === current) : -1;
  if (currentIndex < 0) return rows[0].name;

  const nextIndex = (currentIndex + delta + rows.length) % rows.length;
  return rows[nextIndex].name;
}
