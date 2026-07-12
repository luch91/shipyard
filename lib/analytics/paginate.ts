export interface PaginatedResult<T> {
  rows: T[]
  truncated: boolean
}

// PostgREST/Supabase projects may cap each response below the requested range.
// Fetch explicit pages until exhaustion or a caller-defined safety ceiling.
export async function collectPaginatedRows<T>(
  fetchPage: (from: number, to: number) => Promise<T[]>,
  options: { pageSize: number; maxRows: number },
): Promise<PaginatedResult<T>> {
  const { pageSize, maxRows } = options
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error('pageSize must be positive')
  if (!Number.isInteger(maxRows) || maxRows < 1) throw new Error('maxRows must be positive')

  const rows: T[] = []
  while (rows.length < maxRows) {
    const requested = Math.min(pageSize, maxRows - rows.length)
    const page = await fetchPage(rows.length, rows.length + requested - 1)
    if (page.length === 0) return { rows, truncated: false }
    rows.push(...page.slice(0, requested))
  }
  return { rows, truncated: true }
}
