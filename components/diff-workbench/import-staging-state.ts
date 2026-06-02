import { MAX_LANES } from "./lanes";
import type { LaneId } from "./types";

export type ImportFileSource = ArrayLike<File> | Iterable<File> | null;

export type StagedImportFile = {
  file: File;
  targetLane?: LaneId;
};

export function appendImportFiles(
  current: StagedImportFile[],
  incoming: ImportFileSource,
  max = MAX_LANES,
  targetLane?: LaneId,
) {
  const incomingFiles = Array.from(incoming ?? []);
  if (!incomingFiles.length) return current;

  return [...current, ...incomingFiles.map((file) => ({ file, targetLane }))].slice(0, max);
}

export function sortImportFilesByName(files: StagedImportFile[]) {
  return [...files].sort((a, b) =>
    a.file.name.localeCompare(b.file.name, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

export function reorderImportFiles(files: StagedImportFile[], fromIndex: number, toIndex: number) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= files.length ||
    toIndex >= files.length
  ) {
    return files;
  }

  const next = [...files];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function removeImportFile(files: StagedImportFile[], index: number) {
  if (index < 0 || index >= files.length) return files;
  return files.filter((_, itemIndex) => itemIndex !== index);
}

export function setImportFileTargetLane(files: StagedImportFile[], index: number, lane: LaneId) {
  if (index < 0 || index >= files.length) return files;
  return files.map((item, itemIndex) =>
    itemIndex === index ? { ...item, targetLane: lane } : item,
  );
}

export function getImportFiles(files: StagedImportFile[]) {
  return files.map((item) => item.file);
}

export function isStagedImportFiles(
  files: ImportFileSource | StagedImportFile[],
): files is StagedImportFile[] {
  return Array.isArray(files) && files.every((item) => "file" in item);
}
