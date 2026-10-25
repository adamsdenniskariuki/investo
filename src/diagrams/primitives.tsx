import { useId, type ReactNode } from 'react';
import { niceTicks, wrapText } from '../lib/chart';
import { compact } from '../lib/format';
import type { BarSegment, DiagramBody, LineSeries, TimelineEvent, Tone, ValueFormat } from './specs';

export const W = 340;
export const DASHES = ['', '7 4', '2 4', '10 3 2 3'];
const CHAR_W = 6.6; // average glyph width at 12px, a little generous for wide fonts

export const toneVar = (t: Tone) => (t === 'muted' ? 'var(--muted)' : `var(--${t})`);

function fmt(v: number, f: ValueFormat | undefined): string {
  if (f === 'pct') return `${Number(v.toFixed(1))}%`;
  if (f === 'kes') return compact(v);
  return compact(v);
}

function Lines({ x, y, lines, size = 12, cls = 'dg-text', anchor = 'start', weight }: {
  x: number; y: number; lines: string[]; size?: number; cls?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number;
}) {
  return (
    <text x={x} y={y} className={cls} fontSize={size} textAnchor={anchor} fontWeight={weight}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.25}>{l}</tspan>
      ))}
    </text>
  );
}

const wrapPx = (text: string, px: number, size = 12) => wrapText(text, Math.max(6, Math.floor(px / (CHAR_W * (size / 12)))));

// ── Line chart ───────────────────────────────────────────
export function LineChart({ series, yFormat, xFormat, xLabel, yLabel }: {
  series: LineSeries[]; yFormat: ValueFormat; xFormat?: ValueFormat; xLabel: string; yLabel: string;
}) {
  const H = 210;
  const m = { l: 44, r: 12, t: 24, b: 36 };
  const all = series.flatMap((s) => s.points);
  const xs = all.map((p) => p[0]);
  const ys = all.map((p) => p[1]);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMinData = Math.min(...ys);
  const yMaxData = Math.max(...ys);
  const yTicks = niceTicks(yMinData < 0 ? yMinData : 0, yMaxData, 4);
  const y0 = yTicks[0];
  const y1 = yTicks[yTicks.length - 1];
  const pw = W - m.l - m.r;
  const ph = H - m.t - m.b;
  const sx = (v: number) => m.l + (xMax === xMin ? 0 : ((v - xMin) / (xMax - xMin)) * pw);
  const sy = (v: number) => m.t + ph - ((v - y0) / (y1 - y0 || 1)) * ph;
  const xTicks = linearTicks(xMin, xMax, 5);
  return (
    <>
      <text x={4} y={14} className="dg-muted" fontSize={11}>{yLabel}</text>
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line x1={m.l} x2={W - m.r} y1={sy(t)} y2={sy(t)} className={t === 0 ? 'dg-axis' : 'dg-grid'} />
          <text x={m.l - 6} y={sy(t) + 4} className="dg-muted" fontSize={11} textAnchor="end">{fmt(t, yFormat)}</text>
        </g>
      ))}
      {xTicks.map((t) => (
        <text key={`x${t}`} x={sx(t)} y={H - m.b + 16} className="dg-muted" fontSize={11} textAnchor="middle">{fmt(t, xFormat ?? 'plain')}</text>
      ))}
      <text x={m.l + pw / 2} y={H - 4} className="dg-muted" fontSize={11} textAnchor="middle">{xLabel}</text>
      {series.map((s, i) => {
        const d = s.points.map((p, k) => `${k ? 'L' : 'M'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ');
        const last = s.points[s.points.length - 1];
        return (
          <g key={s.label}>
            <path d={d} fill="none" style={{ stroke: toneVar(s.tone) }} strokeWidth={2.5} strokeDasharray={DASHES[i % DASHES.length]} strokeLinejoin="round" strokeLinecap="round" />
            {last && <circle cx={sx(last[0])} cy={sy(last[1])} r={3.5} style={{ fill: toneVar(s.tone) }} />}
          </g>
        );
      })}
    </>
  );
}
LineChart.height = 210;

function linearTicks(min: number, max: number, maxCount: number): number[] {
  if (max <= min) return [min];
  const span = max - min;
  const raw = span / maxCount;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => span / s <= maxCount) ?? 10 * mag;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(Number(v.toPrecision(10)));
  return out;
}

// ── Stacked bars ─────────────────────────────────────────
export function BarChart({ bars, yFormat, yLabel }: {
  bars: Array<{ label: string; segments: BarSegment[] }>; yFormat: ValueFormat; yLabel: string;
}) {
  const H = 210;
  const m = { l: 44, r: 12, t: 24, b: 30 };
  const totals = bars.map((b) => b.segments.reduce((a, s) => a + Math.max(0, s.value), 0));
  const ticks = niceTicks(0, Math.max(...totals, 0), 4);
  const top = ticks[ticks.length - 1];
  const pw = W - m.l - m.r;
  const ph = H - m.t - m.b;
  const sy = (v: number) => m.t + ph - (v / (top || 1)) * ph;
  const slot = pw / Math.max(1, bars.length);
  const bw = Math.min(52, slot * 0.6);
  return (
    <>
      <text x={4} y={14} className="dg-muted" fontSize={11}>{yLabel}</text>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={m.l} x2={W - m.r} y1={sy(t)} y2={sy(t)} className={t === 0 ? 'dg-axis' : 'dg-grid'} />
          <text x={m.l - 6} y={sy(t) + 4} className="dg-muted" fontSize={11} textAnchor="end">{fmt(t, yFormat)}</text>
        </g>
      ))}
      {bars.map((b, i) => {
        const cx = m.l + slot * i + slot / 2;
        let acc = 0;
        return (
          <g key={b.label}>
            {b.segments.map((s, k) => {
              const v = Math.max(0, s.value);
              const yTop = sy(acc + v);
              const h = sy(acc) - yTop;
              acc += v;
              return (
                <rect key={k} x={cx - bw / 2} y={yTop} width={bw} height={Math.max(0, h)} style={{ fill: toneVar(s.tone) }} className="dg-seg" />
              );
            })}
            <text x={cx} y={sy(totals[i]) - 5} className="dg-text" fontSize={11} textAnchor="middle" fontWeight={700}>{fmt(totals[i], yFormat)}</text>
            <text x={cx} y={H - m.b + 16} className="dg-muted" fontSize={11} textAnchor="middle">{b.label}</text>
          </g>
        );
      })}
    </>
  );
}

// ── Ladder ───────────────────────────────────────────────
function Ladder({ lowLabel, highLabel, rungs }: { lowLabel: string; highLabel: string; rungs: Array<{ label: string; note: string }> }) {
  const left = 30;
  const step = 7;
  const pad = 8;
  const layouts = rungs.map((r, i) => {
    const x = left;
    // Lower rungs are shorter on the right, so the stack reads as a staircase.
    const w = W - x - (rungs.length - 1 - i) * step - 2;
    const label = wrapPx(r.label, w - pad * 2, 13);
    const note = wrapPx(r.note, w - pad * 2, 11);
    const h = pad * 2 + label.length * 16 + note.length * 14;
    return { x, w, label, note, h };
  });
  // Highest rung drawn at the top.
  const order = [...layouts.keys()].reverse();
  const gap = 6;
  let y = 22;
  const placed = order.map((i) => {
    const r = { ...layouts[i], y, i };
    y += layouts[i].h + gap;
    return r;
  });
  const bottom = y - gap;
  const H = bottom + 22;
  return {
    height: H,
    node: (
      <>
        <text x={left} y={14} className="dg-muted" fontSize={11}>▲ {highLabel}</text>
        <text x={left} y={H - 6} className="dg-muted" fontSize={11}>▼ {lowLabel}</text>
        <line x1={12} x2={12} y1={bottom} y2={28} className="dg-arrow" strokeWidth={2} />
        <polygon points={`6,32 12,20 18,32`} className="dg-arrowhead" />
        {placed.map((r) => (
          <g key={r.i}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={6} className="dg-box" />
            <rect x={r.x} y={r.y} width={6} height={r.h} rx={3} style={{ fill: rungTone(r.i, rungs.length) }} />
            <Lines x={r.x + pad + 4} y={r.y + pad + 12} lines={r.label} size={13} weight={700} />
            <Lines x={r.x + pad + 4} y={r.y + pad + 12 + r.label.length * 16} lines={r.note} size={11} cls="dg-muted" />
          </g>
        ))}
      </>
    ),
  };
}

function rungTone(i: number, n: number): string {
  const f = n <= 1 ? 0 : i / (n - 1);
  return f < 0.34 ? toneVar('chart3') : f < 0.67 ? toneVar('chart1') : toneVar('chart2');
}

// ── Flow ─────────────────────────────────────────────────
function Flow({ nodes, edges }: { nodes: Array<{ label: string; note?: string }>; edges: string[] }) {
  const bw = 236;
  const bx = 14;
  const pad = 8;
  const gapH = 30;
  let y = 4;
  const placed = nodes.map((n) => {
    const label = wrapPx(n.label, bw - pad * 2, 13);
    const note = n.note ? wrapPx(n.note, bw - pad * 2, 11) : [];
    const h = pad * 2 + label.length * 16 + note.length * 14;
    const r = { y, h, label, note };
    y += h + gapH;
    return r;
  });
  const H = y - gapH + 4;
  const cx = bx + bw / 2;
  return {
    height: H,
    node: (
      <>
        {placed.map((p, i) => (
          <g key={i}>
            <rect x={bx} y={p.y} width={bw} height={p.h} rx={8} className={i === placed.length - 1 ? 'dg-box dg-box-strong' : 'dg-box'} />
            <Lines x={bx + pad} y={p.y + pad + 12} lines={p.label} size={13} weight={700} />
            {p.note.length > 0 && <Lines x={bx + pad} y={p.y + pad + 12 + p.label.length * 16} lines={p.note} size={11} cls="dg-muted" />}
            {i < placed.length - 1 && (
              <g>
                <line x1={cx} x2={cx} y1={p.y + p.h + 2} y2={p.y + p.h + gapH - 8} className="dg-arrow" strokeWidth={2} />
                <polygon points={`${cx - 5},${p.y + p.h + gapH - 10} ${cx + 5},${p.y + p.h + gapH - 10} ${cx},${p.y + p.h + gapH - 2}`} className="dg-arrowhead" />
                {edges[i] && (
                  <Lines x={bx + bw + 8} y={p.y + p.h + gapH / 2 + 4} lines={wrapPx(edges[i], W - bw - bx - 10, 11)} size={11} cls="dg-muted dg-italic" />
                )}
              </g>
            )}
          </g>
        ))}
      </>
    ),
  };
}

// ── Timeline ─────────────────────────────────────────────
function Timeline({ span, unit, rows }: { span: number; unit: string; rows: Array<{ label: string; events: TimelineEvent[] }> }) {
  const x0 = 22;
  const x1 = W - 22;
  const rowH = 132;
  const sx = (v: number) => x0 + (v / (span || 1)) * (x1 - x0);
  const H = rows.length * rowH + 24;
  return {
    height: H,
    node: (
      <>
        {rows.map((row, r) => {
          const axisY = r * rowH + 70;
          return (
            <g key={r}>
              <text x={4} y={r * rowH + 14} className="dg-text" fontSize={12} fontWeight={700}>{row.label}</text>
              <line x1={x0} x2={x1} y1={axisY} y2={axisY} className="dg-axis" strokeWidth={2} />
              {row.events.map((e, k) => {
                const x = sx(e.at);
                const anchor = e.at <= 0 ? 'start' : e.at >= span ? 'end' : 'middle';
                const lx = anchor === 'start' ? x - 6 : anchor === 'end' ? x + 6 : x;
                if (e.dir === 'mark') {
                  const above = k % 2 === 0;
                  return (
                    <g key={k}>
                      <circle cx={x} cy={axisY} r={6} className="dg-dot" />
                      {e.label && (
                        <text x={lx} y={above ? axisY - 14 : axisY + 24} className="dg-text" fontSize={11} textAnchor={anchor}>{e.label}</text>
                      )}
                    </g>
                  );
                }
                const len = 34 * (e.size ?? 1);
                const up = e.dir === 'in';
                const tone = up ? toneVar('chart1') : toneVar('chart2');
                const tip = up ? axisY - len : axisY + len;
                const base = up ? axisY - 2 : axisY + 2;
                const head = up ? `${x - 5},${tip + 8} ${x + 5},${tip + 8} ${x},${tip}` : `${x - 5},${tip - 8} ${x + 5},${tip - 8} ${x},${tip}`;
                return (
                  <g key={k}>
                    <line x1={x} x2={x} y1={base} y2={up ? tip + 6 : tip - 6} style={{ stroke: tone }} strokeWidth={3} strokeDasharray={up ? '' : '5 3'} />
                    <polygon points={head} style={{ fill: tone }} />
                    {e.label && (
                      <text x={lx} y={up ? tip - 6 : tip + 15} className="dg-text" fontSize={11} textAnchor={anchor}>{e.label}</text>
                    )}
                  </g>
                );
              })}
              <text x={x0} y={axisY + 52} className="dg-muted" fontSize={11}>0</text>
              <text x={x1} y={axisY + 52} className="dg-muted" fontSize={11} textAnchor="end">{`${span} ${unit}`}</text>
            </g>
          );
        })}
        <text x={W / 2} y={H - 4} className="dg-muted" fontSize={11} textAnchor="middle">▲ money to you · ▼ money you pay · ● milestone</text>
      </>
    ),
  };
}

// ── Donut ────────────────────────────────────────────────
function Donut({ centre, slices }: { centre: string; slices: Array<{ label: string; value: number; tone: Tone }> }) {
  const cx = 82;
  const cy = 86;
  const R = 72;
  const r = 42;
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  let a0 = -Math.PI / 2;
  const arcs = slices.map((s) => {
    const a1 = a0 + (s.value / total) * Math.PI * 2;
    const d = arcPath(cx, cy, R, r, a0, a1);
    a0 = a1;
    return d;
  });
  let ly = 22;
  const legend = slices.map((s) => {
    const lines = wrapPx(`${s.label} — ${Math.round((s.value / total) * 100)}%`, W - 186, 12);
    const y = ly;
    ly += lines.length * 15 + 8;
    return { y, lines, tone: s.tone };
  });
  const H = Math.max(176, ly);
  return {
    height: H,
    node: (
      <>
        {arcs.map((d, i) => (
          <path key={i} d={d} style={{ fill: toneVar(slices[i].tone) }} className="dg-seg" />
        ))}
        <Lines x={cx} y={cy + 4} lines={wrapText(centre, 10)} size={11} anchor="middle" cls="dg-text" weight={700} />
        {legend.map((l, i) => (
          <g key={i}>
            <rect x={172} y={l.y - 10} width={11} height={11} rx={2} style={{ fill: toneVar(l.tone) }} />
            <Lines x={190} y={l.y} lines={l.lines} size={12} />
          </g>
        ))}
      </>
    ),
  };
}

function arcPath(cx: number, cy: number, R: number, r: number, a0: number, a1: number): string {
  const full = a1 - a0 >= Math.PI * 2 - 1e-6;
  if (full) a1 = a0 + Math.PI * 2 - 1e-4;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const p = (rad: number, a: number) => `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
  return `M${p(R, a0)} A${R},${R} 0 ${large} 1 ${p(R, a1)} L${p(r, a1)} A${r},${r} 0 ${large} 0 ${p(r, a0)} Z`;
}

// ── Pyramid ──────────────────────────────────────────────
function Pyramid({ levels }: { levels: Array<{ label: string; note: string }> }) {
  const bandH = 48;
  const top = 8;
  const baseW = 150;
  const apexX = 76;
  const n = levels.length;
  const H = top + n * bandH + 8;
  const halfAt = (y: number) => ((y - top) / (n * bandH)) * (baseW / 2);
  return {
    height: H,
    node: (
      <>
        {levels.map((lv, i) => {
          const yA = top + i * bandH;
          const yB = yA + bandH;
          const a = halfAt(yA);
          const b = halfAt(yB);
          const pts = `${apexX - a},${yA} ${apexX + a},${yA} ${apexX + b},${yB} ${apexX - b},${yB}`;
          const isBase = i === n - 1;
          const labelLines = wrapPx(lv.label, W - 166, 13);
          const note = wrapPx(lv.note, W - 166, 11);
          const ty = yA + bandH / 2 - ((labelLines.length * 16 + note.length * 14) / 2) + 12;
          return (
            <g key={i}>
              <polygon points={pts} className={isBase ? 'dg-seg' : 'dg-box'} style={isBase ? { fill: toneVar('chart2') } : undefined} />
              <line x1={apexX + (a + b) / 2 + 4} x2={160} y1={yA + bandH / 2} y2={yA + bandH / 2} className="dg-grid" />
              <Lines x={164} y={ty} lines={labelLines} size={13} weight={700} />
              <Lines x={164} y={ty + labelLines.length * 16} lines={note} size={11} cls="dg-muted" />
            </g>
          );
        })}
      </>
    ),
  };
}

// ── Compare ──────────────────────────────────────────────
function Compare({ columns }: { columns: Array<{ heading: string; tone: Tone; items: string[] }> }) {
  const gap = 8;
  const cw = (W - gap * (columns.length - 1)) / columns.length;
  const pad = 8;
  const cols = columns.map((c) => {
    const heading = wrapPx(c.heading, cw - pad * 2, 13);
    let y = 14 + pad + heading.length * 16 + 4;
    const items = c.items.map((it) => {
      const lines = wrapPx(it, cw - pad * 2 - 12, 12);
      const r = { y, lines };
      y += lines.length * 15 + 7;
      return r;
    });
    return { heading, items, h: y + pad - 4 };
  });
  const H = Math.max(...cols.map((c) => c.h)) + 2;
  return {
    height: H,
    node: (
      <>
        {columns.map((c, i) => {
          const x = i * (cw + gap);
          const col = cols[i];
          return (
            <g key={i}>
              <rect x={x + 1} y={1} width={cw - 2} height={H - 2} rx={8} className="dg-box" />
              <rect x={x + 1} y={1} width={cw - 2} height={7} rx={3} style={{ fill: toneVar(c.tone) }} />
              <Lines x={x + pad} y={14 + pad + 8} lines={col.heading} size={13} weight={700} />
              {col.items.map((it, k) => (
                <g key={k}>
                  <circle cx={x + pad + 3} cy={it.y + 10} r={3} style={{ fill: toneVar(c.tone) }} />
                  <Lines x={x + pad + 12} y={it.y + 14} lines={it.lines} size={12} />
                </g>
              ))}
            </g>
          );
        })}
      </>
    ),
  };
}

/** Renders a spec body; returns the SVG children and the viewBox height. */
export function renderBody(body: DiagramBody): { height: number; node: ReactNode; legend?: LegendItem[] } {
  switch (body.type) {
    case 'lines':
      return {
        height: LineChart.height,
        node: <LineChart {...body} />,
        legend: body.series.map((s, i) => ({ label: s.label, tone: s.tone, dash: DASHES[i % DASHES.length], kind: 'line' })),
      };
    case 'bars': {
      const seen = new Map<string, LegendItem>();
      body.bars.forEach((b) => b.segments.forEach((s) => seen.set(s.label, { label: s.label, tone: s.tone, kind: 'box' })));
      return { height: 210, node: <BarChart {...body} />, legend: [...seen.values()] };
    }
    case 'ladder':
      return Ladder(body);
    case 'flow':
      return Flow(body);
    case 'timeline':
      return Timeline(body);
    case 'donut':
      return Donut(body);
    case 'pyramid':
      return Pyramid(body);
    case 'compare':
      return Compare(body);
  }
}

export interface LegendItem {
  label: string;
  tone: Tone;
  kind: 'line' | 'box';
  dash?: string;
}

export function Legend({ items }: { items: LegendItem[] }) {
  if (items.length < 2) return null;
  return (
    <ul className="legend" aria-hidden="true">
      {items.map((it) => (
        <li key={it.label}>
          <svg width="28" height="12" viewBox="0 0 28 12" focusable="false">
            {it.kind === 'line' ? (
              <line x1="1" x2="27" y1="6" y2="6" style={{ stroke: toneVar(it.tone) }} strokeWidth={3} strokeDasharray={it.dash} strokeLinecap="round" />
            ) : (
              <rect x="6" y="0" width="14" height="12" rx="2" style={{ fill: toneVar(it.tone) }} />
            )}
          </svg>
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/** Accessible figure wrapper shared by static diagrams and live calculator charts. */
export function Figure({ title, desc, caption, height, children, legend }: {
  title: string; desc: string; caption?: ReactNode; height: number; children: ReactNode; legend?: LegendItem[];
}) {
  const id = useId();
  const tId = `${id}-t`;
  const dId = `${id}-d`;
  return (
    <figure className="diagram">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-labelledby={`${tId} ${dId}`} focusable="false" className="diagram-svg">
        <title id={tId}>{title}</title>
        <desc id={dId}>{desc}</desc>
        {children}
      </svg>
      {legend && <Legend items={legend} />}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
