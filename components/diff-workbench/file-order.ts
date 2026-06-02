export function compareFilePath(a: string, b: string) {
  const insensitive = a.localeCompare(b, undefined, { sensitivity: "base" });
  if (insensitive !== 0) return insensitive;
  return a.localeCompare(b);
}
