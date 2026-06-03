function hideFileNames(current: Set<string>, names: Iterable<string>) {
  const next = new Set(current);
  for (const name of names) next.add(name);
  return next;
}

function showFileNames(current: Set<string>, names: Iterable<string>) {
  const next = new Set(current);
  for (const name of names) next.delete(name);
  return next;
}

export function clearHiddenFileNames() {
  return new Set<string>();
}

function getFileNameSelection(names: Iterable<string>) {
  const selection = new Set(names);
  return selection.size > 0 ? selection : null;
}

export function getFileVisibilityPatch(names: Iterable<string>) {
  const selection = getFileNameSelection(names);
  if (!selection) return null;

  return {
    clearSelection: (current: string | null) => clearSelectionIfHidden(current, selection),
    hide: (current: Set<string>) => hideFileNames(current, selection),
    show: (current: Set<string>) => showFileNames(current, selection),
  };
}

function clearSelectionIfHidden(current: string | null, hiddenNames: Set<string>) {
  return current && hiddenNames.has(current) ? null : current;
}

export function getHiddenFileNameState(fileNames: string[], hiddenFiles: Set<string>) {
  const hiddenNames = fileNames.filter((name) => hiddenFiles.has(name));
  const allHidden = fileNames.length > 0 && hiddenNames.length === fileNames.length;

  return {
    allHidden,
    hiddenCount: hiddenNames.length,
    hiddenNames,
    partiallyHidden: hiddenNames.length > 0 && !allHidden,
  };
}
