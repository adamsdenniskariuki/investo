import { describe, expect, it } from 'vitest';
import { compact, kes, parseNumber, pct } from './format';

describe('format', () => {
  it('formats KES whole shillings with grouping', () => {
    expect(kes(1234567.4)).toBe('KES 1,234,567');
    expect(kes(0)).toBe('KES 0');
    expect(kes(-500.2)).toBe('-KES 500');
    expect(kes(Infinity)).toBe('—');
  });

  it('formats compact axis labels', () => {
    expect(compact(1_250_000)).toBe('1.3M');
    expect(compact(450_000)).toBe('450K');
    expect(compact(2_500)).toBe('2.5K');
    expect(compact(800)).toBe('800');
    expect(compact(-30)).toBe('-30');
  });

  it('formats percentages', () => {
    expect(pct(4.76191)).toBe('4.76%');
    expect(pct(10, 0)).toBe('10%');
  });

  it('parses user-entered numbers', () => {
    expect(parseNumber('1,000,000')).toBe(1000000);
    expect(parseNumber(' 12.5 ')).toBe(12.5);
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('abc')).toBeNull();
  });
});
