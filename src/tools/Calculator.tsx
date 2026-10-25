import { useId, useMemo, useRef, useState } from 'react';
import { BarChart, DASHES, Figure, LineChart, type LegendItem } from '../diagrams/primitives';
import { useStore } from '../state/store';
import { defaults, validateField, type ChartSpec, type FieldSpec, type ToolDef, type ToolOutput, type Values } from './model';

function Field({ f, raw, error, onChange, idBase }: { f: FieldSpec; raw: string; error?: string; onChange: (v: string) => void; idBase: string }) {
  const id = `${idBase}-${f.key}`;
  const hintId = f.hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;
  if (f.options) {
    return (
      <div className="field">
        <label htmlFor={id}>{f.label}</label>
        {f.hint && <span className="hint" id={hintId}>{f.hint}</span>}
        <select id={id} value={raw} onChange={(e) => onChange(e.target.value)} aria-describedby={describedBy}>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  const input = (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={raw}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
    />
  );
  return (
    <div className="field">
      <label htmlFor={id}>{f.label}</label>
      {f.hint && <span className="hint" id={hintId}>{f.hint}</span>}
      {f.prefix || f.suffix ? (
        <div className="input-affix">
          {f.prefix && <span aria-hidden="true">{f.prefix}</span>}
          {input}
          {f.suffix && <span aria-hidden="true">{f.suffix}</span>}
        </div>
      ) : (
        input
      )}
      {error && (
        <div className="error" id={errId}>
          {error}
        </div>
      )}
    </div>
  );
}

function Chart({ chart }: { chart: ChartSpec }) {
  if (chart.kind === 'line') return <LineChart series={chart.series} yFormat={chart.yFormat} xLabel={chart.xLabel} yLabel={chart.yLabel} />;
  return <BarChart bars={chart.bars} yFormat={chart.yFormat} yLabel={chart.yLabel} />;
}

function legendFor(chart: ChartSpec): LegendItem[] {
  if (chart.kind === 'line') return chart.series.map((s, i) => ({ label: s.label, tone: s.tone, kind: 'line', dash: DASHES[i % DASHES.length] }));
  const seen = new Map<string, LegendItem>();
  for (const b of chart.bars) for (const s of b.segments) if (!seen.has(s.label)) seen.set(s.label, { label: s.label, tone: s.tone, kind: 'box' });
  return [...seen.values()];
}

export function Calculator({ def }: { def: ToolDef }) {
  const idBase = useId();
  const { markToolUsed } = useStore();
  const [raw, setRaw] = useState<Record<string, string>>(() => defaults(def));
  const lastGood = useRef<ToolOutput | null>(null);
  const rewarded = useRef(false);

  const { values, errors } = useMemo(() => parseAll(def, raw), [def, raw]);
  const valid = Object.keys(errors).length === 0;
  const computed = useMemo(() => (valid ? def.compute(values as Values) : null), [valid, values, def]);
  const out = computed ?? lastGood.current ?? def.compute(parseAll(def, defaults(def)).values as Values);
  lastGood.current = out;

  const onChange = (key: string, v: string) => {
    const next = { ...raw, [key]: v };
    setRaw(next);
    if (!rewarded.current && Object.keys(parseAll(def, next).errors).length === 0) {
      rewarded.current = true;
      markToolUsed(def.id);
    }
  };

  return (
    <div className="card calculator">
      <form onSubmit={(e) => e.preventDefault()} aria-label="Calculator inputs">
        <div className="fields">
          {def.fields.map((f) => (
            <Field key={f.key} f={f} raw={raw[f.key]} error={errors[f.key]} idBase={idBase} onChange={(v) => onChange(f.key, v)} />
          ))}
        </div>
        <div className="btn-row">
          <button type="button" className="btn secondary" onClick={() => setRaw(defaults(def))}>
            Reset to example
          </button>
        </div>
      </form>
      <p className="small" aria-live="polite">
        {valid ? '' : 'Fix the highlighted fields to update the results. Showing the last valid result.'}
      </p>
      <h3 className="visually-hidden">Results</h3>
      <ul className="results">
        {out.results.map((r) => (
          <li key={r.label}>
            <span className="label">{r.label}</span>
            <span className="value">{r.value}</span>
          </li>
        ))}
      </ul>
      <Figure title={out.chartTitle} desc={out.desc} caption={out.desc} height={LineChart.height} legend={legendFor(out.chart)}>
        <Chart chart={out.chart} />
      </Figure>
      {out.note && <p className="small muted">{out.note}</p>}
    </div>
  );
}

function parseAll(def: ToolDef, raw: Record<string, string>) {
  const values: Record<string, number> = {};
  const errors: Record<string, string> = {};
  for (const f of def.fields) {
    const r = validateField(f, raw[f.key] ?? '');
    if (r.value === null) errors[f.key] = r.error ?? 'Invalid value.';
    else values[f.key] = r.value;
  }
  return { values, errors };
}
