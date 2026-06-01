import type { FileDiffMetadata } from "@pierre/diffs/react"

export function diffTotalsFor(file: FileDiffMetadata) {
  return file.hunks.reduce(
    (totals, hunk) => ({
      additions: totals.additions + hunk.additionLines,
      deletions: totals.deletions + hunk.deletionLines,
    }),
    { additions: 0, deletions: 0 }
  )
}

export function diffTotalsForFiles(files: FileDiffMetadata[]) {
  return files.reduce(
    (totals, file) => {
      const fileTotals = diffTotalsFor(file)
      return {
        additions: totals.additions + fileTotals.additions,
        deletions: totals.deletions + fileTotals.deletions,
      }
    },
    { additions: 0, deletions: 0 }
  )
}

function changedLinesForTotals(totals: ReturnType<typeof diffTotalsFor>) {
  return totals.additions + totals.deletions
}

export function changedLinesFor(file: FileDiffMetadata) {
  return changedLinesForTotals(diffTotalsFor(file))
}
