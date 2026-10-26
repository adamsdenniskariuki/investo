import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TOOL_IDS } from '../content/tracks';
import { Figure, BarChart, LineChart } from '../diagrams/primitives';
import { defaults, TOOL_DEFS, validateField, type ChartSpec, type Values } from './model';

const parse = (id: keyof typeof TOOL_DEFS) => {
  const def = TOOL_DEFS[id];
  const raw = defaults(def);
  return Object.fromEntries(def.fields.map((f) => [f.key, validateField(f, raw[f.key]).value])) as Values;
};

function renderChart(title: string, desc: string, chart: ChartSpec): string {
  const body =
    chart.kind === 'line'
      ? createElement(LineChart, { series: chart.series, yFormat: chart.yFormat, xLabel: chart.xLabel, yLabel: chart.yLabel })
      : createElement(BarChart, { bars: chart.bars, yFormat: chart.yFormat, yLabel: chart.yLabel });
  return renderToStaticMarkup(createElement(Figure, { title, desc, caption: desc, height: 210, children: body }));
}

describe('tool definitions', () => {
  it('cover every tool id', () => {
    expect(Object.keys(TOOL_DEFS).sort()).toEqual(TOOL_IDS.filter((t) => t !== 'replay').sort());
  });

  for (const id of Object.keys(TOOL_DEFS) as Array<keyof typeof TOOL_DEFS>) {
    describe(id, () => {
      const def = TOOL_DEFS[id];

      it('has valid default inputs', () => {
        for (const f of def.fields) expect(validateField(f, f.def).error, f.key).toBeUndefined();
      });

      it('computes results and an accessible chart with no NaN', () => {
        const out = def.compute(parse(id));
        expect(out.results.length).toBeGreaterThan(1);
        for (const r of out.results) expect(r.value).not.toMatch(/NaN|undefined|Infinity/);
        expect(out.desc).not.toMatch(/NaN|undefined|Infinity/);
        const html = renderChart(out.chartTitle, out.desc, out.chart);
        expect(html).toContain('role="img"');
        expect(html).toContain('<figcaption>');
        expect(html).not.toMatch(/NaN|Infinity/);
      });

      it('handles the extremes of every field', () => {
        for (const which of ['min', 'max'] as const) {
          const v = parse(id);
          for (const f of def.fields) if (!f.options) v[f.key] = f[which];
          const out = def.compute(v);
          const html = renderChart(out.chartTitle, out.desc, out.chart);
          expect(html, `${id} at ${which}`).not.toMatch(/NaN/);
        }
      });
    });
  }
});

describe('validateField', () => {
  const f = TOOL_DEFS.compound.fields.find((x) => x.key === 'years')!;
  it('accepts formatted numbers and rejects bad input', () => {
    expect(validateField(TOOL_DEFS.compound.fields[0], '1,000,000').value).toBe(1_000_000);
    expect(validateField(f, '').error).toMatch(/number/);
    expect(validateField(f, 'abc').error).toMatch(/number/);
    expect(validateField(f, '2.5').error).toMatch(/whole/);
    expect(validateField(f, '99').error).toMatch(/from 1 to 50/);
  });
});

describe('calculations', () => {
  it('compound: zero rate means balance equals money put in', () => {
    const out = TOOL_DEFS.compound.compute({ initial: 1000, monthly: 100, rate: 0, years: 2 });
    expect(out.results[0].value).toBe('KES 3,400');
    expect(out.results[1].value).toBe('KES 3,400');
  });

  it('mmf-tbill: tax is the withholding share of gross interest', () => {
    const out = TOOL_DEFS['mmf-tbill'].compute({ amount: 365_000, mmf: 0, tbill: 10, days: 365, wht: 15 });
    expect(out.results[1].value).toBe('KES 31,025');
  });

  it('bond at par: yield to maturity equals the coupon rate', () => {
    const out = TOOL_DEFS.bond.compute({ face: 100_000, coupon: 12, years: 5, price: 100, wht: 0 });
    expect(out.results.find((r) => r.label.startsWith('Yield'))!.value).toBe('12.00%');
    expect(out.results.find((r) => r.label === 'Total you get back')!.value).toBe('KES 160,000');
  });

  it('emergency: reports months to target', () => {
    const out = TOOL_DEFS.emergency.compute({ essentials: 10_000, months: 3, saved: 0, saving: 7_000 });
    expect(out.results[0].value).toBe('KES 30,000');
    expect(out.results[3].value).toBe('5 months');
  });

  it('crash: a 50% fall needs a 100% gain to recover', () => {
    const out = TOOL_DEFS.crash.compute({ amount: 10_000, fall: 50, growth: 100 });
    expect(out.results[0].value).toBe('KES 5,000');
    expect(out.results[1].value).toBe('100%');
    expect(out.results[2].value).toBe('About 1 year');
  });

  it('fx-return: combines the dollar return with the currency change', () => {
    const out = TOOL_DEFS['fx-return'].compute({ amount: 100_000, rate: 8, fx: 5, years: 1 });
    expect(out.results[0].value).toBe('13.40%');
    expect(out.results[1].value).toBe('KES 113,400');
    expect(out.results[2].value).toBe('KES 108,000');
    expect(out.results[3].label).toBe('Currency added');
    const down = TOOL_DEFS['fx-return'].compute({ amount: 100_000, rate: 8, fx: -5, years: 1 });
    expect(down.results[3].label).toBe('Currency cost you');
  });
});
