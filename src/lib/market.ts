/** A price bar: open, high, low, close. */
export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
}

/** Small, fast, seeded PRNG (mulberry32) so a “made-up market” replays identically. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-12);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Generates a made-up daily price series: a random walk with no built-in edge (zero drift) and
 * calm/stormy volatility spells, so it looks like a real chart without predicting anything.
 */
export function makeMarket(seed: number, bars: number, start = 50): Candle[] {
  const rand = rng(seed);
  const out: Candle[] = [];
  let price = start;
  let vol = 0.018;
  for (let i = 0; i < bars; i++) {
    if (rand() < 0.06) vol = rand() < 0.5 ? 0.012 : 0.032;
    const o = price;
    const ret = gaussian(rand) * vol;
    const c = Math.max(1, o * Math.exp(ret));
    const wick = () => Math.abs(gaussian(rand)) * vol * 0.5;
    const h = Math.max(o, c) * (1 + wick());
    const l = Math.min(o, c) * (1 - wick());
    out.push({ o: round2(o), h: round2(h), l: round2(Math.max(0.5, l)), c: round2(c) });
    // Small overnight gap before the next open.
    price = c * (1 + gaussian(rand) * vol * 0.15);
  }
  return out;
}

/** Largest peak-to-trough fall of a value series, as a positive percentage. */
export function maxDrawdownPct(values: number[]): number {
  let peak = -Infinity;
  let worst = 0;
  for (const v of values) {
    peak = Math.max(peak, v);
    if (peak > 0) worst = Math.max(worst, (peak - v) / peak);
  }
  return worst * 100;
}

/** Gain needed to get back to where you were after a loss of `lossPct`. */
export function recoveryGainPct(lossPct: number): number {
  if (lossPct >= 100) return Infinity;
  return (1 / (1 - lossPct / 100) - 1) * 100;
}
