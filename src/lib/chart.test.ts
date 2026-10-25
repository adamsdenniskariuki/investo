import { describe, expect, it } from 'vitest';
import { niceTicks, wrapText } from './chart';

describe('niceTicks', () => {
  it('starts at zero and covers the max with round steps', () => {
    expect(niceTicks(0, 100)).toEqual([0, 25, 50, 75, 100]);
    const t = niceTicks(0, 1_745_000);
    expect(t[0]).toBe(0);
    expect(t[t.length - 1]).toBeGreaterThanOrEqual(1_745_000);
    expect(t.length).toBeLessThanOrEqual(7);
  });

  it('includes negative ranges', () => {
    const t = niceTicks(-30, 40);
    expect(t[0]).toBeLessThanOrEqual(-30);
    expect(t).toContain(0);
    expect(t[t.length - 1]).toBeGreaterThanOrEqual(40);
  });

  it('copes with a flat zero series', () => {
    expect(niceTicks(0, 0).length).toBeGreaterThan(1);
  });
});

describe('wrapText', () => {
  it('wraps on word boundaries', () => {
    expect(wrapText('one two three four', 9)).toEqual(['one two', 'three', 'four']);
    expect(wrapText('', 10)).toEqual(['']);
  });
});
