import { maxDrawdownPct, type Candle } from './market';

export interface ReplayTrade {
  buyBar: number;
  buyPrice: number;
  sellBar: number;
  sellPrice: number;
  shares: number;
  /** Profit or loss after fees, in KES. */
  pnl: number;
  reason: 'sell' | 'stop' | 'end';
}

export interface ReplayState {
  /** Index of the latest visible bar. */
  bar: number;
  cash: number;
  shares: number;
  entryBar: number;
  entryPrice: number;
  entryFee: number;
  stop: number | null;
  feesPaid: number;
  trades: ReplayTrade[];
  /** Account value at the close of each bar since the session started. */
  equity: number[];
  done: boolean;
}

export interface ReplayConfig {
  candles: Candle[];
  /** Bars shown as history before the session starts. */
  warmup: number;
  startCash: number;
  /** Fee per trade, as a % of the trade value. */
  feePct: number;
}

export function startReplay(cfg: ReplayConfig): ReplayState {
  return {
    bar: cfg.warmup - 1,
    cash: cfg.startCash,
    shares: 0,
    entryBar: -1,
    entryPrice: 0,
    entryFee: 0,
    stop: null,
    feesPaid: 0,
    trades: [],
    equity: [cfg.startCash],
    done: false,
  };
}

export const accountValue = (s: ReplayState, price: number) => s.cash + s.shares * price;

/** Buys at the latest close with `fraction` of cash, whole shares only. Long only, one position at a time. */
export function buy(cfg: ReplayConfig, s: ReplayState, fraction: number, stopPct: number | null): ReplayState {
  if (s.done || s.shares > 0) return s;
  const price = cfg.candles[s.bar].c;
  const budget = s.cash * Math.min(1, Math.max(0, fraction));
  const shares = Math.floor(budget / (price * (1 + cfg.feePct / 100)));
  if (shares < 1) return s;
  const fee = shares * price * (cfg.feePct / 100);
  return {
    ...s,
    cash: s.cash - shares * price - fee,
    shares,
    entryBar: s.bar,
    entryPrice: price,
    entryFee: fee,
    stop: stopPct && stopPct > 0 ? price * (1 - stopPct / 100) : null,
    feesPaid: s.feesPaid + fee,
  };
}

function close(cfg: ReplayConfig, s: ReplayState, price: number, reason: ReplayTrade['reason']): ReplayState {
  if (s.shares === 0) return s;
  const fee = s.shares * price * (cfg.feePct / 100);
  const proceeds = s.shares * price - fee;
  const pnl = proceeds - (s.shares * s.entryPrice + s.entryFee);
  const trade: ReplayTrade = { buyBar: s.entryBar, buyPrice: s.entryPrice, sellBar: s.bar, sellPrice: price, shares: s.shares, pnl, reason };
  return { ...s, cash: s.cash + proceeds, shares: 0, entryBar: -1, entryPrice: 0, entryFee: 0, stop: null, feesPaid: s.feesPaid + fee, trades: [...s.trades, trade] };
}

/** Sells the whole position at the latest close. */
export function sell(cfg: ReplayConfig, s: ReplayState): ReplayState {
  if (s.done) return s;
  return close(cfg, s, cfg.candles[s.bar].c, 'sell');
}

/**
 * Reveals the next bar. A stop-loss sells at the stop price if the bar trades through it, or at the open if the
 * price gaps below it — which is why a stop limits, but does not guarantee, a loss.
 */
export function step(cfg: ReplayConfig, s: ReplayState): ReplayState {
  if (s.done) return s;
  const bar = s.bar + 1;
  const k = cfg.candles[bar];
  let next: ReplayState = { ...s, bar };
  if (next.stop !== null && next.shares > 0 && k.l <= next.stop) {
    next = close(cfg, next, Math.min(k.o, next.stop), 'stop');
  }
  const last = bar >= cfg.candles.length - 1;
  if (last) next = close(cfg, next, k.c, 'end');
  return { ...next, equity: [...next.equity, accountValue(next, k.c)], done: last };
}

export interface ReplayReview {
  finalValue: number;
  returnPct: number;
  holdReturnPct: number;
  trades: number;
  wins: number;
  losses: number;
  feesPaid: number;
  maxDrawdownPct: number;
  stopsHit: number;
}

/** End-of-session summary, compared with simply holding from the first to the last session bar. */
export function review(cfg: ReplayConfig, s: ReplayState): ReplayReview {
  const price = cfg.candles[s.bar].c;
  const finalValue = accountValue(s, price);
  const startPrice = cfg.candles[cfg.warmup - 1].c;
  return {
    finalValue,
    returnPct: (finalValue / cfg.startCash - 1) * 100,
    holdReturnPct: (price / startPrice - 1) * 100,
    trades: s.trades.length,
    wins: s.trades.filter((t) => t.pnl > 0).length,
    losses: s.trades.filter((t) => t.pnl <= 0).length,
    feesPaid: s.feesPaid,
    maxDrawdownPct: maxDrawdownPct(s.equity),
    stopsHit: s.trades.filter((t) => t.reason === 'stop').length,
  };
}
