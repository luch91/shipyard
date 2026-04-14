// ─── Minimal line-level diff ──────────────────────────────────────────────────

export type DiffLine =
  | { type: 'same'; text: string; lineA: number; lineB: number }
  | { type: 'added'; text: string; lineB: number }
  | { type: 'removed'; text: string; lineA: number }

export function diffLines(a: string, b: string): DiffLine[] {
  const linesA = a.split('\n')
  const linesB = b.split('\n')

  // Build LCS table
  const m = linesA.length
  const n = linesB.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        linesA[i - 1] === linesB[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  // Traceback
  const result: DiffLine[] = []
  let i = m
  let j = n
  let iA = m
  let iB = n

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      result.push({ type: 'same', text: linesA[i - 1], lineA: i, lineB: j })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: 'added', text: linesB[j - 1], lineB: j })
      j--
    } else {
      result.push({ type: 'removed', text: linesA[i - 1], lineA: i })
      i--
    }
    iA = i; iB = j
  }

  return result.reverse()
}

export function hasDiff(a: string, b: string): boolean {
  return a.trim() !== b.trim()
}
