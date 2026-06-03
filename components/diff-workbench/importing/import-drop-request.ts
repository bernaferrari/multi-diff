import type { ImportFileSource } from "./import-staging-state";
import type { LaneId } from "../shared/types";

export const IMPORT_DROP_REQUEST_EVENT = "multi-diff:import-drop-request";

export type ImportDropRequest = {
  files: File[];
  target?: LaneId;
};

export function createImportDropRequest(files: ImportFileSource, target?: LaneId) {
  return {
    files: Array.from(files ?? []),
    target,
  };
}

export function dispatchImportDropRequest(files: ImportFileSource, target?: LaneId) {
  window.dispatchEvent(
    new CustomEvent<ImportDropRequest>(IMPORT_DROP_REQUEST_EVENT, {
      detail: createImportDropRequest(files, target),
    }),
  );
}
