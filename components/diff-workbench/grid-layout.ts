function getEqualColumnTemplate(count: number) {
  return `repeat(${Math.max(1, count)}, minmax(0, 1fr))`
}

export function getEqualColumnGridStyle(count: number) {
  return {
    gridTemplateColumns: getEqualColumnTemplate(count),
  }
}
