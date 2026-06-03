type DiffStatTotals = {
  additions: number;
  deletions: number;
};

type DiffStatParts = {
  additions: string | null;
  deletions: string | null;
};

export function formatAdditionCount(count: number) {
  return `+${count}`;
}

export function formatDeletionCount(count: number) {
  return `−${count}`;
}

export function formatDiffStatSummary({ additions, deletions }: DiffStatTotals) {
  return `${formatAdditionCount(additions)} ${formatDeletionCount(deletions)}`;
}

export function formatDiffStatLabel({ additions, deletions }: DiffStatTotals) {
  if (additions === 0 && deletions === 0) return "no changes";
  return `${additions} additions, ${deletions} deletions`;
}

export function getVisibleDiffStatParts({ additions, deletions }: DiffStatTotals): DiffStatParts {
  return {
    additions: additions > 0 ? formatAdditionCount(additions) : null,
    deletions: deletions > 0 ? formatDeletionCount(deletions) : null,
  };
}
