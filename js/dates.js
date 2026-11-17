const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function parseDate(value) {
  if (!value) return null;
  const [y, m = 1, d = 1] = String(value).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatMonth(date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function monthsBetween(start, end) {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
}

export function formatDuration(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  if (years && months) return `${plural(years, 'year')}, ${plural(months, 'month')}`;
  if (years) return plural(years, 'year');
  if (months) return plural(months, 'month');
  return 'Started this month';
}

export function describeSpan(span, today = new Date()) {
  const start = parseDate(span.start);
  const end = parseDate(span.end);
  const effectiveEnd = end || today;
  const months = start ? monthsBetween(start, effectiveEnd) : 0;
  return {
    start,
    end,
    effectiveEnd,
    months,
    current: !end,
    label: start ? `${formatMonth(start)} – ${end ? formatMonth(end) : 'Present'}` : 'Earlier',
    duration: start ? formatDuration(months) : '',
  };
}

export function titleCase(text) {
  return String(text).toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}
