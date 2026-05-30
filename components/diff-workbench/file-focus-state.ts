import type { FileRow } from "./types"

export function getFileFocusByOffset({
  activeFile,
  delta,
  focusFile,
  rows,
}: {
  activeFile: string | null
  delta: number
  focusFile: string | null
  rows: FileRow[]
}) {
  if (rows.length === 0) return null

  const current = focusFile ?? activeFile
  const currentIndex = current
    ? rows.findIndex((row) => row.name === current)
    : -1
  if (currentIndex < 0) return rows[0].name

  const nextIndex = (currentIndex + delta + rows.length) % rows.length
  return rows[nextIndex].name
}
