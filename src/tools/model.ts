import type { ToolId } from '../content/types';
import type { BarSegment, LineSeries, ValueFormat } from '../diagrams/specs';
import { bondCashflows, compoundGrowth, emergencyPlan, feeDrag, mmfReturn, purchasingPower, realRatePct, tbillReturn } from '../lib/finance';
import { kes, parseNumber, pct } from '../lib/format';

export interface FieldSpec {
  key: string;
  label: string;
  def: string;
  min: number;
  max: number;
  prefix?: string;
  suffix?: string;
  integer?: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
}

export type Values = Record<string, number>;

export type ChartSpec =
  | { kind: 'line'; series: LineSeries[]; yFormat: ValueFormat; xLabel: string; yLabel: string }
  | { kind: 'bar'; bars: Array<{ label: string; segments: BarSegment[] }>; yFormat: ValueFormat; yLabel: string };

export interface ToolOutput {
  results: { label: string; value: string }[];
  chart: ChartSpec;
  chartTitle: string;
  /** Plain-language summary of the chart, read by screen readers and shown as the caption. */
  desc: string;
  note?: string;
}

export interface ToolDef {
  id: ToolId;
  fields: FieldSpec[];
  compute: (v: Values) => ToolOutput;
}

export function validateField(f: FieldSpec, raw: string): { value: number | null; error?: string } {
  const n = parseNumber(raw);
  if (n === null) return { value: null, error: 'Enter a number.' };
  if (f.integer && !Number.isInteger(n)) return { value: null, error: 'Enter a whole number.' };
  if (n < f.min || n > f.max) {
    const fmt = (x: number) => (f.prefix === 'KES' ? kes(x) : `${x.toLocaleString('en-KE')}${f.suffix ? ` ${f.suffix}` : ''}`);
    return { value: null, error: `Enter a value from ${fmt(f.min)} to ${fmt(f.max)}.` };
  }
  return { value: n };
}

export function defaults(def: ToolDef): Record<string, string> {
  return Object.fromEntries(def.fields.map((f) => [f.key, f.def]));
}

/** Evenly spaced sample of up to `max` items, always keeping the first and last. */
function sample<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  const out: T[] = [];
  for (let i = 0; i < max; i++) out.push(items[Math.round((i * (items.length - 1)) / (max - 1))]);
  return out;
}

const KES_F = { prefix: 'KES' } as const;
const PCT_F = { suffix: '%' } as const;
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

const compound: ToolDef = {
  id: 'compound',
  fields: [
    { key: 'initial', label: 'Starting amount', def: '10,000', min: 0, max: 1e9, ...KES_F },
    { key: 'monthly', label: 'Added each month', def: '2,000', min: 0, max: 1e8, ...KES_F },
    { key: 'rate', label: 'Yearly return (your guess)', def: '8', min: -20, max: 30, ...PCT_F, hint: 'Real returns go up and down; try a few rates.' },
    { key: 'years', label: 'Years', def: '10', min: 1, max: 50, integer: true },
  ],
  compute: ({ initial, monthly, rate, years }) => {
    const pts = compoundGrowth({ initial, monthly, annualRatePct: rate, years });
    const last = pts[pts.length - 1];
    const growth = last.balance - last.contributed;
    const bars = sample(pts.slice(1), 6).map((p) => ({
      label: `Yr ${p.year}`,
      segments: [
        { label: 'Money you put in', value: p.contributed, tone: 'chart1' as const },
        { label: 'Growth', value: Math.max(0, p.balance - p.contributed), tone: 'chart2' as const },
      ],
    }));
    return {
      results: [
        { label: `Balance after ${plural(years, 'year')}`, value: kes(last.balance) },
        { label: 'Money you put in', value: kes(last.contributed) },
        { label: growth >= 0 ? 'Growth' : 'Loss', value: kes(Math.abs(growth)) },
      ],
      chartTitle: 'Money put in versus growth over time',
      chart: { kind: 'bar', bars, yFormat: 'kes', yLabel: 'KES' },
      desc: `At ${pct(rate, 1)} a year, the balance after ${plural(years, 'year')} is ${kes(last.balance)}: ${kes(last.contributed)} you put in and ${kes(growth)} of ${growth >= 0 ? 'growth' : 'loss'}.`,
      note: 'Assumes the same return every year and monthly compounding. Real returns vary, and can be negative.',
    };
  },
};

const inflation: ToolDef = {
  id: 'inflation',
  fields: [
    { key: 'amount', label: 'Amount today', def: '100,000', min: 1, max: 1e9, ...KES_F },
    { key: 'nominal', label: 'Yearly return before inflation', def: '10', min: -20, max: 40, ...PCT_F },
    { key: 'inflation', label: 'Yearly inflation', def: '5', min: -5, max: 40, ...PCT_F, hint: 'KNBS publishes Kenya’s inflation rate each month.' },
    { key: 'years', label: 'Years', def: '10', min: 1, max: 50, integer: true },
  ],
  compute: ({ amount, nominal, inflation: inf, years }) => {
    const real = realRatePct(nominal, inf);
    const nominalEnd = amount * Math.pow(1 + nominal / 100, years);
    const realEnd = purchasingPower(nominalEnd, inf, years);
    const cashEnd = purchasingPower(amount, inf, years);
    const yearsArr = Array.from({ length: years + 1 }, (_, i) => i);
    return {
      results: [
        { label: 'Real return per year', value: pct(real, 2) },
        { label: `Invested: worth after ${plural(years, 'year')}`, value: kes(nominalEnd) },
        { label: 'In today’s money', value: kes(realEnd) },
        { label: 'Cash kept idle, in today’s money', value: kes(cashEnd) },
      ],
      chartTitle: 'Invested money versus idle cash, in today’s money',
      chart: {
        kind: 'line',
        series: [
          { label: 'Invested, before inflation', tone: 'chart1', points: yearsArr.map((y) => [y, amount * Math.pow(1 + nominal / 100, y)]) },
          { label: 'Invested, in today’s money', tone: 'chart2', points: yearsArr.map((y) => [y, amount * Math.pow(1 + real / 100, y)]) },
          { label: 'Idle cash, in today’s money', tone: 'chart3', points: yearsArr.map((y) => [y, purchasingPower(amount, inf, y)]) },
        ],
        yFormat: 'kes',
        xLabel: 'Years',
        yLabel: 'KES',
      },
      desc: `With ${pct(nominal, 1)} returns and ${pct(inf, 1)} inflation, the real return is about ${pct(real, 2)} a year. After ${plural(years, 'year')}, ${kes(amount)} invested buys what ${kes(realEnd)} buys today, while idle cash buys only what ${kes(cashEnd)} buys today.`,
    };
  },
};

const fees: ToolDef = {
  id: 'fees',
  fields: [
    { key: 'initial', label: 'Starting amount', def: '100,000', min: 0, max: 1e9, ...KES_F },
    { key: 'monthly', label: 'Added each month', def: '5,000', min: 0, max: 1e8, ...KES_F },
    { key: 'gross', label: 'Yearly return before fees', def: '10', min: -20, max: 30, ...PCT_F },
    { key: 'fee', label: 'Yearly fee', def: '2', min: 0, max: 10, ...PCT_F, hint: 'Check the fund’s fact sheet for its total fees.' },
    { key: 'years', label: 'Years', def: '20', min: 1, max: 50, integer: true },
  ],
  compute: ({ initial, monthly, gross, fee, years }) => {
    const r = feeDrag({ initial, monthly, grossRatePct: gross, feePct: fee, years });
    const a = compoundGrowth({ initial, monthly, annualRatePct: gross, years });
    const b = compoundGrowth({ initial, monthly, annualRatePct: gross - fee, years });
    return {
      results: [
        { label: 'Without fees', value: kes(r.withoutFees) },
        { label: `With a ${pct(fee, 1)} fee`, value: kes(r.withFees) },
        { label: 'Cost of the fee', value: kes(r.lost) },
        { label: 'Share of the pot lost', value: pct(r.lostPct, 1) },
      ],
      chartTitle: 'Growth with and without fees',
      chart: {
        kind: 'line',
        series: [
          { label: 'Without fees', tone: 'chart1', points: a.map((p) => [p.year, p.balance]) },
          { label: `With ${pct(fee, 1)} fee`, tone: 'chart3', points: b.map((p) => [p.year, p.balance]) },
        ],
        yFormat: 'kes',
        xLabel: 'Years',
        yLabel: 'KES',
      },
      desc: `Over ${plural(years, 'year')}, a ${pct(fee, 1)} yearly fee turns ${kes(r.withoutFees)} into ${kes(r.withFees)}, costing ${kes(r.lost)} (${pct(r.lostPct, 1)} of the pot).`,
      note: 'The fee is taken off the return each year. Funds charge in different ways; read the fund’s documents.',
    };
  },
};

const TENORS = [
  { value: '91', label: '91 days' },
  { value: '182', label: '182 days' },
  { value: '364', label: '364 days' },
];

const mmfTbill: ToolDef = {
  id: 'mmf-tbill',
  fields: [
    { key: 'amount', label: 'Amount', def: '100,000', min: 1, max: 1e9, ...KES_F },
    { key: 'mmf', label: 'MMF yield (yearly, before tax)', def: '10', min: 0, max: 40, ...PCT_F, hint: 'Funds publish their daily yield; it changes.' },
    { key: 'tbill', label: 'T-bill rate (yearly)', def: '10', min: 0, max: 40, ...PCT_F, hint: 'See CBK’s latest auction results.' },
    { key: 'days', label: 'Period', def: '91', min: 1, max: 366, integer: true, options: TENORS },
    { key: 'wht', label: 'Withholding tax on interest', def: '15', min: 0, max: 50, ...PCT_F, hint: 'Check KRA for the current rate.' },
  ],
  compute: ({ amount, mmf, tbill, days, wht }) => {
    const m = mmfReturn({ amount, annualYieldPct: mmf, days, whtPct: wht });
    const t = tbillReturn({ amount, annualRatePct: tbill, days, whtPct: wht });
    const diff = m.net - t.net;
    const bar = (label: string, r: typeof m) => ({
      label,
      segments: [
        { label: 'You keep', value: r.net, tone: 'chart1' as const },
        { label: 'Withholding tax', value: r.tax, tone: 'chart3' as const },
      ],
    });
    const better = Math.abs(diff) < 1 ? 'about the same' : diff > 0 ? `${kes(Math.abs(diff))} more in the MMF` : `${kes(Math.abs(diff))} more in the T-bill`;
    return {
      results: [
        { label: 'MMF: interest you keep', value: kes(m.net) },
        { label: 'T-bill: interest you keep', value: kes(t.net) },
        { label: 'Difference', value: better },
      ],
      chartTitle: `Interest after ${days} days`,
      chart: { kind: 'bar', bars: [bar('MMF', m), bar('T-bill', t)], yFormat: 'kes', yLabel: 'KES interest' },
      desc: `Over ${days} days on ${kes(amount)}: the MMF earns ${kes(m.gross)} and you keep ${kes(m.net)}; the T-bill earns ${kes(t.gross)} and you keep ${kes(t.net)}. That is ${better}.`,
      note: 'Simplified. MMF yields change daily and are not guaranteed; CBK prices T-bills at a discount, so real figures differ slightly. T-bills via DhowCSD have a minimum investment.',
    };
  },
};

const bond: ToolDef = {
  id: 'bond',
  fields: [
    { key: 'face', label: 'Face value', def: '100,000', min: 1, max: 1e9, ...KES_F },
    { key: 'coupon', label: 'Coupon rate (yearly)', def: '12', min: 0, max: 40, ...PCT_F },
    { key: 'years', label: 'Years to maturity', def: '5', min: 1, max: 30, integer: true },
    { key: 'price', label: 'Price you pay (% of face value)', def: '100', min: 50, max: 150, suffix: '%', hint: '100 = at par; below 100 = discount; above = premium.' },
    { key: 'wht', label: 'Withholding tax on coupons', def: '15', min: 0, max: 50, ...PCT_F, hint: 'Infrastructure bonds are usually tax-exempt; check the prospectus.' },
  ],
  compute: ({ face, coupon, years, price, wht }) => {
    const r = bondCashflows({ faceValue: face, couponPct: coupon, years, pricePct: price, whtPct: wht });
    return {
      results: [
        { label: 'Coupon every 6 months (after tax)', value: kes(r.netCouponPerPayment) },
        { label: 'Number of coupons', value: String(r.payments) },
        { label: 'Current yield', value: pct(r.currentYieldPct, 2) },
        { label: 'Yield to maturity (before tax)', value: pct(r.ytmPct, 2) },
        { label: 'Total you get back', value: kes(r.totalReceived) },
        { label: r.gain >= 0 ? 'Gain over price paid' : 'Loss over price paid', value: kes(Math.abs(r.gain)) },
      ],
      chartTitle: 'What you pay versus what you get back',
      chart: {
        kind: 'bar',
        bars: [
          { label: 'You pay', segments: [{ label: 'Price', value: r.price, tone: 'muted' }] },
          {
            label: 'You get back',
            segments: [
              { label: 'Face value at maturity', value: face, tone: 'chart1' },
              { label: 'Coupons after tax', value: r.totalNetCoupons, tone: 'chart2' },
            ],
          },
        ],
        yFormat: 'kes',
        yLabel: 'KES',
      },
      desc: `You pay ${kes(r.price)} and, if you hold to maturity, receive ${r.payments} coupons totalling ${kes(r.totalNetCoupons)} after tax plus ${kes(face)} face value: ${kes(r.totalReceived)} in all.`,
      note: 'Assumes the government pays every coupon and you hold to maturity. Selling early means accepting the market price, which may be lower.',
    };
  },
};

const emergency: ToolDef = {
  id: 'emergency',
  fields: [
    { key: 'essentials', label: 'Essential costs per month', def: '30,000', min: 0, max: 1e8, ...KES_F, hint: 'Rent, food, transport, school fees, loan repayments.' },
    { key: 'months', label: 'Months to cover', def: '6', min: 1, max: 24, integer: true, hint: 'Many guides suggest 3–6 months; more if income is irregular.' },
    { key: 'saved', label: 'Already saved', def: '20,000', min: 0, max: 1e9, ...KES_F },
    { key: 'saving', label: 'You can save per month', def: '5,000', min: 0, max: 1e8, ...KES_F },
  ],
  compute: ({ essentials, months, saved, saving }) => {
    const p = emergencyPlan({ monthlyEssentials: essentials, months, saved, monthlySaving: saving });
    const reachable = Number.isFinite(p.monthsToGoal);
    const horizon = Math.max(6, Math.min(120, reachable ? p.monthsToGoal + 2 : 24));
    const xs = Array.from({ length: horizon + 1 }, (_, i) => i);
    const when = p.gap === 0 ? 'You have already reached your target.' : reachable ? `About ${plural(p.monthsToGoal, 'month')} to reach it.` : 'Add a monthly saving amount to see when you would reach it.';
    return {
      results: [
        { label: 'Target', value: kes(p.target) },
        { label: 'Still to save', value: kes(p.gap) },
        { label: 'Progress', value: pct(p.progressPct, 0) },
        { label: 'Time to target', value: p.gap === 0 ? 'Done' : reachable ? plural(p.monthsToGoal, 'month') : '—' },
      ],
      chartTitle: 'Your emergency fund growing toward the target',
      chart: {
        kind: 'line',
        series: [
          { label: 'Target', tone: 'chart3', points: [[0, p.target], [horizon, p.target]] },
          { label: 'Your fund', tone: 'chart1', points: xs.map((m) => [m, Math.min(Math.max(p.target, saved), saved + saving * m)]) },
        ],
        yFormat: 'kes',
        xLabel: 'Months from now',
        yLabel: 'KES',
      },
      desc: `Target ${kes(p.target)} (${plural(months, 'month')} of ${kes(essentials)}). You have ${kes(saved)}. ${when}`,
      note: 'Keep an emergency fund somewhere safe and easy to reach, such as a bank savings account or a money market fund.',
    };
  },
};

const fxReturn: ToolDef = {
  id: 'fx-return',
  fields: [
    { key: 'amount', label: 'Amount invested', def: '100,000', min: 1, max: 1e9, ...KES_F },
    { key: 'rate', label: 'Yearly return in dollars (your guess)', def: '7', min: -50, max: 50, ...PCT_F },
    { key: 'fx', label: 'Yearly change in the dollar against the shilling', def: '2', min: -30, max: 30, ...PCT_F, hint: 'Positive means one dollar buys more shillings. Try negative values too.' },
    { key: 'years', label: 'Years', def: '10', min: 1, max: 40, integer: true },
  ],
  compute: ({ amount, rate, fx, years }) => {
    const kesRate = ((1 + rate / 100) * (1 + fx / 100) - 1) * 100;
    const yearsArr = Array.from({ length: years + 1 }, (_, i) => i);
    const grow = (r: number, y: number) => amount * Math.pow(1 + r / 100, y);
    const flatEnd = grow(rate, years);
    const kesEnd = grow(kesRate, years);
    const diff = kesEnd - flatEnd;
    return {
      results: [
        { label: 'Yearly return in shillings', value: pct(kesRate, 2) },
        { label: `Value after ${plural(years, 'year')}`, value: kes(kesEnd) },
        { label: 'If the exchange rate stayed the same', value: kes(flatEnd) },
        { label: diff >= 0 ? 'Currency added' : 'Currency cost you', value: kes(Math.abs(diff)) },
      ],
      chartTitle: 'Value in shillings with and without a currency move',
      chart: {
        kind: 'line',
        series: [
          { label: 'With your currency change', tone: 'chart1', points: yearsArr.map((y) => [y, grow(kesRate, y)]) },
          { label: 'Exchange rate unchanged', tone: 'chart2', points: yearsArr.map((y) => [y, grow(rate, y)]) },
        ],
        yFormat: 'kes',
        xLabel: 'Years',
        yLabel: 'KES',
      },
      desc: `A ${pct(rate, 1)} yearly return in dollars with the dollar changing ${pct(fx, 1)} a year against the shilling gives about ${pct(kesRate, 2)} a year in shillings. After ${plural(years, 'year')}, ${kes(amount)} becomes ${kes(kesEnd)}, compared with ${kes(flatEnd)} if the rate had not moved.`,
      note: 'Assumes steady yearly changes. Real returns and exchange rates jump around and cannot be predicted reliably. Conversion fees are not included.',
    };
  },
};

export const TOOL_DEFS: Record<ToolId, ToolDef> = {
  compound,
  inflation,
  fees,
  'mmf-tbill': mmfTbill,
  bond,
  emergency,
  'fx-return': fxReturn,
};
