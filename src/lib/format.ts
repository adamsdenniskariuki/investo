const intFmt = new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 });

/** Whole-shilling KES amount, e.g. "KES 1,234,567". */
export function kes(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const rounded = Math.round(n);
  const sign = rounded < 0 ? '-' : '';
  return `${sign}KES ${intFmt.format(Math.abs(rounded))}`;
}

/** Short axis label, e.g. "1.2M", "450K", "800". */
export function compact(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const a = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (a >= 1e9) return `${sign}${trim(a / 1e9)}B`;
  if (a >= 1e6) return `${sign}${trim(a / 1e6)}M`;
  if (a >= 1e3) return `${sign}${trim(a / 1e3)}K`;
  return `${sign}${trim(a)}`;
}

function trim(n: number): string {
  return n >= 100 ? n.toFixed(0) : String(Number(n.toFixed(1)));
}

export function pct(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(digits)}%`;
}

/** Parses user input such as "1,000,000" or " 12.5 ". Returns null when not a number. */
export function parseNumber(input: string): number | null {
  const cleaned = input.replace(/[,\s_]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
