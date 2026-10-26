import { useEffect, useId, useMemo, useState } from 'react';
import { CandleChart, DASHES, Figure, LineChart } from '../diagrams/primitives';
import type { CandleMark } from '../diagrams/specs';
import { kes, pct } from '../lib/format';
import { makeMarket } from '../lib/market';
import { accountValue, buy, review, sell, startReplay, step, type ReplayConfig } from '../lib/replay';
import { useStore } from '../state/store';

const MARKETS = [101, 202, 303, 404, 505];
const WARMUP = 30;
const SESSION = 60;
const VISIBLE = 40;
const START_CASH = 100_000;

function signed(n: number, f: (x: number) => string) {
  return `${n > 0 ? '+' : ''}${f(n)}`;
}

/** Practice trading on a made-up random market with paper money. No signals: the market has nothing to predict. */
export function PaperReplay() {
  const idBase = useId();
  const { markToolUsed } = useStore();
  const [market, setMarket] = useState(0);
  const [feePct, setFeePct] = useState(0.5);
  const [stopPct, setStopPct] = useState(0);
  const cfg: ReplayConfig = useMemo(
    () => ({ candles: makeMarket(MARKETS[market], WARMUP + SESSION), warmup: WARMUP, startCash: START_CASH, feePct }),
    [market, feePct],
  );
  const [s, setS] = useState(() => startReplay(cfg));
  const [status, setStatus] = useState('Session ready. Look at the history, then choose what to do.');

  useEffect(() => {
    setS(startReplay(cfg));
    setStatus('New session started.');
  }, [cfg]);

  useEffect(() => {
    if (s.done) markToolUsed('replay');
  }, [s.done, markToolUsed]);

  const price = cfg.candles[s.bar].c;
  const value = accountValue(s, price);
  const day = s.bar - WARMUP + 1;
  const startIdx = Math.max(0, s.bar - VISIBLE + 1);
  const visible = cfg.candles.slice(startIdx, s.bar + 1);

  const marks: CandleMark[] = [];
  for (const t of s.trades) {
    marks.push({ at: t.buyBar, label: 'Buy', kind: 'buy' });
    marks.push({ at: t.sellBar, label: t.reason === 'stop' ? 'Stop' : 'Sell', kind: 'sell' });
  }
  if (s.shares > 0) marks.push({ at: s.entryBar, label: 'Buy', kind: 'buy' });

  const holdStart = cfg.candles[WARMUP - 1].c;
  const equityPts = s.equity.map((v, i) => [i, v] as [number, number]);
  const holdPts = s.equity.map((_, i) => [i, (START_CASH * cfg.candles[WARMUP - 1 + i].c) / holdStart] as [number, number]);

  const act = (next: typeof s, msg: string) => {
    setS(next);
    setStatus(msg);
  };
  const onNext = () => {
    const n = step(cfg, s);
    const stopped = n.trades.length > s.trades.length && n.trades[n.trades.length - 1].reason === 'stop';
    const k = cfg.candles[n.bar];
    act(n, `${n.done ? 'Last day. Session over. ' : ''}Day ${n.bar - WARMUP + 1}: closed at KES ${k.c.toFixed(2)}.${stopped ? ' Your stop-loss sold the position.' : ''}`);
  };
  const onBuy = (fraction: number) => {
    const n = buy(cfg, s, fraction, stopPct || null);
    if (n === s) return setStatus('Not enough cash to buy one share.');
    act(n, `Bought ${n.shares.toLocaleString('en-KE')} shares at KES ${price.toFixed(2)}${n.stop ? ` with a stop at KES ${n.stop.toFixed(2)}` : ''}.`);
  };
  const onSell = () => {
    const n = sell(cfg, s);
    const t = n.trades[n.trades.length - 1];
    act(n, `Sold at KES ${price.toFixed(2)}. Result after fees: ${signed(t.pnl, kes)}.`);
  };
  const onFinish = () => {
    let n = s;
    while (!n.done) n = step(cfg, n);
    act(n, 'Skipped to the end. Session over.');
  };

  const r = s.done ? review(cfg, s) : null;
  const holding = s.shares > 0;

  return (
    <div className="card calculator replay">
      <form onSubmit={(e) => e.preventDefault()} aria-label="Replay settings">
        <div className="fields">
          <div className="field">
            <label htmlFor={`${idBase}-m`}>Made-up market</label>
            <select id={`${idBase}-m`} value={market} onChange={(e) => setMarket(Number(e.target.value))}>
              {MARKETS.map((_, i) => (
                <option key={i} value={i}>
                  Market #{i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`${idBase}-f`}>Fee per trade</label>
            <select id={`${idBase}-f`} value={feePct} onChange={(e) => setFeePct(Number(e.target.value))}>
              {[0, 0.5, 1, 2].map((f) => (
                <option key={f} value={f}>
                  {f}% of trade value
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`${idBase}-s`}>Stop-loss for the next buy</label>
            <select id={`${idBase}-s`} value={stopPct} onChange={(e) => setStopPct(Number(e.target.value))}>
              <option value={0}>No stop</option>
              {[3, 5, 10, 15].map((p) => (
                <option key={p} value={p}>
                  {p}% below the buy price
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      <h3 className="visually-hidden">Account</h3>
      <ul className="results">
        <li>
          <span className="label">Day</span>
          <span className="value">{day > 0 ? `${day} of ${SESSION}` : 'Start'}</span>
        </li>
        <li>
          <span className="label">Price</span>
          <span className="value">KES {price.toFixed(2)}</span>
        </li>
        <li>
          <span className="label">Cash</span>
          <span className="value">{kes(s.cash)}</span>
        </li>
        <li>
          <span className="label">Shares held</span>
          <span className="value">{s.shares.toLocaleString('en-KE')}</span>
        </li>
        <li>
          <span className="label">Account value</span>
          <span className="value">
            {kes(value)} ({signed((value / START_CASH - 1) * 100, (x) => pct(x, 1))})
          </span>
        </li>
      </ul>

      <Figure
        title="Price of the made-up market"
        desc={`Candlestick chart of the last ${visible.length} days. Latest close KES ${price.toFixed(2)}.${holding ? ` You hold ${s.shares} shares bought at KES ${s.entryPrice.toFixed(2)}.` : ''}${s.stop ? ` Stop-loss at KES ${s.stop.toFixed(2)}.` : ''}`}
        caption="Hollow candles closed higher than they opened; filled candles closed lower. ▲ marks a buy, ▼ a sell."
        height={210}
        legend={[
          { label: 'Up day (hollow)', tone: 'chart1', kind: 'box' },
          { label: 'Down day (filled)', tone: 'chart2', kind: 'box' },
        ]}
      >
        <CandleChart
          candles={visible}
          firstIndex={startIdx}
          yLabel="KES per share"
          marks={marks}
          level={s.stop ? { value: s.stop, label: 'Stop' } : undefined}
        />
      </Figure>

      <div className="btn-row" role="group" aria-label="Trading actions">
        <button type="button" className="btn" onClick={onNext} disabled={s.done}>
          Next day
        </button>
        {[0.25, 0.5, 1].map((f) => (
          <button key={f} type="button" className="btn secondary" onClick={() => onBuy(f)} disabled={s.done || holding}>
            Buy {f * 100}%
          </button>
        ))}
        <button type="button" className="btn secondary" onClick={onSell} disabled={s.done || !holding}>
          Sell all
        </button>
        <button type="button" className="btn secondary" onClick={onFinish} disabled={s.done}>
          Skip to end
        </button>
        <button type="button" className="btn secondary" onClick={() => act(startReplay(cfg), 'Session restarted.')}>
          Restart
        </button>
      </div>
      <p className="small" role="status" aria-live="polite">
        {status}
      </p>

      {equityPts.length > 1 && (
        <Figure
          title="Your account compared with simply holding"
          desc={`Line chart over ${equityPts.length - 1} days. Your account is now ${kes(value)}. Buying on day 1 and holding would be worth ${kes(holdPts[holdPts.length - 1][1])}.`}
          caption="Your paper account against buying on day 1 and holding, before fees."
          height={LineChart.height}
          legend={[
            { label: 'Your account', tone: 'chart1', kind: 'line', dash: DASHES[0] },
            { label: 'Buy and hold', tone: 'chart2', kind: 'line', dash: DASHES[1] },
          ]}
        >
          <LineChart
            series={[
              { label: 'Your account', tone: 'chart1', points: equityPts },
              { label: 'Buy and hold', tone: 'chart2', points: holdPts },
            ]}
            yFormat="kes"
            zeroBase={false}
            xLabel="Days"
            yLabel="KES"
          />
        </Figure>
      )}

      {r && (
        <section aria-labelledby={`${idBase}-rev`} className="replay-review">
          <h3 id={`${idBase}-rev`}>Session review</h3>
          <ul className="results">
            <li>
              <span className="label">Your result</span>
              <span className="value">{signed(r.returnPct, (x) => pct(x, 1))}</span>
            </li>
            <li>
              <span className="label">Buy and hold (no fees)</span>
              <span className="value">{signed(r.holdReturnPct, (x) => pct(x, 1))}</span>
            </li>
            <li>
              <span className="label">Trades (won / lost)</span>
              <span className="value">
                {r.trades} ({r.wins} / {r.losses})
              </span>
            </li>
            <li>
              <span className="label">Fees paid</span>
              <span className="value">{kes(r.feesPaid)}</span>
            </li>
            <li>
              <span className="label">Largest fall from a peak</span>
              <span className="value">{pct(r.maxDrawdownPct, 1)}</span>
            </li>
            <li>
              <span className="label">Stops hit</span>
              <span className="value">{r.stopsHit}</span>
            </li>
          </ul>
          <p className="small">
            This market was random, so any gain or loss here came from luck, fees and how much you risked — not from skill at
            reading the chart. Try another market or a higher fee and compare.
          </p>
        </section>
      )}
      <p className="small muted">
        Paper money on a made-up market. Nothing here is a signal or advice to buy or sell any real investment.
      </p>
    </div>
  );
}
