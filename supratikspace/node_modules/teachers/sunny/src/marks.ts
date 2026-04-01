import type { ScoreEntry, ScoreTotals } from './types'

function normalizeFractions(raw: string): string {
  return raw
    .replace(/\u00bd/g, ' 1/2')
    .replace(/\u00bc/g, ' 1/4')
    .replace(/\u00be/g, ' 3/4')
    .replace(/(\d)\s*,\s*(\d+\s*\/\s*\d+)/g, '$1 $2')
    .replace(/,/g, '.')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseFraction(raw: string): number | null {
  const match = raw.match(/^(\d+)\s*\/\s*(\d+)$/)

  if (!match) {
    return null
  }

  const numerator = Number(match[1])
  const denominator = Number(match[2])

  if (denominator === 0) {
    return null
  }

  return numerator / denominator
}

export function parseMarkValue(raw: string): number | null {
  const normalized = normalizeFractions(raw)

  if (!normalized) {
    return null
  }

  if (/^\d+(\.\d+)?$/.test(normalized)) {
    return Number(normalized)
  }

  const directFraction = parseFraction(normalized)

  if (directFraction !== null) {
    return directFraction
  }

  const parts = normalized.split(' ')

  if (parts.length === 2 && /^\d+(\.\d+)?$/.test(parts[0])) {
    const fraction = parseFraction(parts[1])

    if (fraction !== null) {
      return Number(parts[0]) + fraction
    }
  }

  return null
}

export function buildScoreEntryPatch(entry: ScoreEntry): ScoreEntry {
  return {
    ...entry,
    awardedValue: parseMarkValue(entry.awardedRaw),
    possibleValue: parseMarkValue(entry.possibleRaw),
    updatedAt: Date.now(),
  }
}

export function calculateScoreTotals(entries: ScoreEntry[]): ScoreTotals {
  let awardedTotal = 0
  let possibleTotal = 0
  let possibleKnown = false
  let resolvedEntries = 0
  let unresolvedEntries = 0

  for (const entry of entries) {
    const awardedValue = parseMarkValue(entry.awardedRaw)
    const possibleValue = parseMarkValue(entry.possibleRaw)

    if (awardedValue !== null) {
      awardedTotal += awardedValue
      resolvedEntries += 1
    } else {
      unresolvedEntries += 1
    }

    if (possibleValue !== null) {
      possibleKnown = true
      possibleTotal += possibleValue
    }
  }

  const totalPossible = possibleKnown ? possibleTotal : null

  return {
    awardedTotal,
    possibleTotal: totalPossible,
    percent:
      totalPossible && totalPossible > 0
        ? Number(((awardedTotal / totalPossible) * 100).toFixed(1))
        : null,
    resolvedEntries,
    unresolvedEntries,
  }
}

export function formatScoreValue(value: number | null): string {
  if (value === null) {
    return 'Unparsed'
  }

  if (Number.isInteger(value)) {
    return String(value)
  }

  return value.toFixed(2).replace(/\.?0+$/, '')
}
