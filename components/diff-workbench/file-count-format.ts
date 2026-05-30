export function formatFileCount(count: number) {
  return `${count} file${count === 1 ? "" : "s"}`
}

export function formatHiddenFileCount(count: number) {
  return `${count} hidden file${count === 1 ? "" : "s"}`
}
