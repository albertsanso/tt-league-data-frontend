/** Parse comma-separated seasons from the club form into `ClubDto.yearRanges`. */
export function parseYearRangesInput(raw: string): string[] | undefined {
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : undefined
}

export function formatYearRangesForInput(ranges?: string[]): string {
  return ranges?.join(', ') ?? ''
}
