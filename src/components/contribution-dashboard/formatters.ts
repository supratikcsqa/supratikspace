export function formatScore(value: number) {
  return value.toFixed(value % 1 === 0 ? 0 : 1);
}

export function formatMetric(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
}

export function formatShortDate(value: string | null) {
  if (!value) {
    return 'No activity yet';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function formatLongDateTime(value: string | null) {
  if (!value) {
    return 'Not synced yet';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatWeekLabel(weekStart: string, weekEnd: string) {
  return `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`;
}
