import { describe, expect, it } from 'vitest';
import { makeMarket, maxDrawdownPct, recoveryGainPct, rng } from './market';
import { buy, review, sell, startReplay, step, type ReplayConfig } from './replay';

describe('market', () => {
  it('is deterministic for a seed', () => {
    expect(makeMarket(7, 50)).toEqual(makeMarket(7, 50));
    expect(makeMarket(7, 50)).not.toEqual(makeMarket(8, 50));
    const a = rng(1);
    expect(a()).toBeGreaterThanOrEqual(0);
  });

  it('produces valid candles', () => {
    for (const k of makeMarket(42, 300)) {
      expect(k.h).toBeGreaterThanOrEqual(Math.max(k.o, k.c));
      expect(k.l).toBeLessThanOrEqual(Math.min(k.o, k.c));
      expect(k.l).toBeGreaterThan(0);
    }
  });

  it('measures drawdowns and recovery', () => {
    expect(maxDrawdownPct([100, 120, 60, 90, 130])).toBeCloseTo(50);
    expect(maxDrawdownPct([1, 2, 3])).toBe(0);
    expect(recoveryGainPct(50)).toBeCloseTo(100);
    expect(recoveryGainPct(20)).toBeCloseTo(25);
    expect(recoveryGainPct(100)).toBe(Infinity);
  });
});

const flat = (prices: Array<[number, number, number, number]>): ReplayConfig => ({
  candles: prices.map(([o, h, l, c]) => ({ o, h, l, c })),
  warmup: 1,
  startCash: 10_000,
  feePct: 1,
});

describe('replay', () => {
  it('buys whole shares, charges fees both ways and records P&L', () => {
    const cfg = flat([[100, 100, 100, 100], [100, 110, 100, 110], [110, 110, 110, 110]]);
    let s = buy(cfg, startReplay(cfg), 1, null);
    expect(s.shares).toBe(99);
    expect(buy(cfg, s, 1, null)).toBe(s); // one position at a time
    s = step(cfg, s);
    s = sell(cfg, s);
    expect(s.trades).toHaveLength(1);
    const t = s.trades[0];
    expect(t.pnl).toBeCloseTo(99 * 110 * 0.99 - 99 * 100 * 1.01);
    expect(s.cash).toBeCloseTo(10_000 + t.pnl);
  });

  it('a stop sells at the stop, or at the open after a gap', () => {
    const cfg = flat([[100, 100, 100, 100], [99, 99, 94, 95], [90, 91, 85, 88]]);
    let s = buy(cfg, startReplay(cfg), 0.5, 5);
    s = step(cfg, s);
    expect(s.trades[0].reason).toBe('stop');
    expect(s.trades[0].sellPrice).toBeCloseTo(95);

    const gap = flat([[100, 100, 100, 100], [90, 91, 85, 88], [88, 88, 88, 88]]);
    let g = buy(gap, startReplay(gap), 0.5, 5);
    g = step(gap, g);
    expect(g.trades[0].sellPrice).toBe(90);
  });

  it('closes open positions at the end and reviews the session', () => {
    const cfg = flat([[100, 100, 100, 100], [100, 120, 100, 120], [120, 120, 80, 80]]);
    let s = buy(cfg, startReplay(cfg), 1, null);
    s = step(cfg, s);
    s = step(cfg, s);
    expect(s.done).toBe(true);
    expect(s.shares).toBe(0);
    expect(s.trades[0].reason).toBe('end');
    const r = review(cfg, s);
    expect(r.trades).toBe(1);
    expect(r.losses).toBe(1);
    expect(r.holdReturnPct).toBeCloseTo(-20);
    expect(r.maxDrawdownPct).toBeGreaterThan(30);
    expect(step(cfg, s)).toBe(s);
  });
});
