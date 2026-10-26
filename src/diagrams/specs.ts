import { bondPrice, compoundGrowth, purchasingPower, type GrowthPoint } from '../lib/finance';
import { makeMarket, recoveryGainPct, type Candle } from '../lib/market';

export type Tone = 'chart1' | 'chart2' | 'chart3' | 'muted';
export type ValueFormat = 'kes' | 'pct' | 'plain';

export interface LineSeries {
  label: string;
  tone: Tone;
  points: Array<[number, number]>;
}

export interface BarSegment {
  label: string;
  value: number;
  tone: Tone;
}

export interface TimelineEvent {
  at: number;
  label?: string;
  /** "in" = money to you, "out" = money from you, "mark" = a milestone with no cash. */
  dir: 'in' | 'out' | 'mark';
  /** Relative arrow size (1 = normal). */
  size?: number;
}

export interface CandleMark {
  /** Bar index the label points at. */
  at: number;
  label: string;
  kind: 'buy' | 'sell' | 'note';
}

export type DiagramBody =
  | { type: 'candles'; yLabel: string; candles: Candle[]; marks?: CandleMark[]; level?: { value: number; label: string } }
  | { type: 'lines'; xLabel: string; yLabel: string; yFormat: ValueFormat; xFormat?: ValueFormat; series: LineSeries[]; zeroBase?: boolean }
  | { type: 'bars'; yLabel: string; yFormat: ValueFormat; bars: Array<{ label: string; segments: BarSegment[] }> }
  | { type: 'ladder'; lowLabel: string; highLabel: string; rungs: Array<{ label: string; note: string }> }
  | { type: 'flow'; nodes: Array<{ label: string; note?: string }>; edges: string[] }
  | { type: 'timeline'; span: number; unit: string; rows: Array<{ label: string; events: TimelineEvent[] }> }
  | { type: 'donut'; centre: string; slices: Array<{ label: string; value: number; tone: Tone }> }
  | { type: 'pyramid'; levels: Array<{ label: string; note: string }> }
  | { type: 'compare'; columns: Array<{ heading: string; tone: Tone; items: string[] }> };

export type DiagramSpec = DiagramBody & {
  /** Short accessible name. */
  title: string;
  /** Full text alternative describing what the picture shows. */
  desc: string;
};

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const compoundYears = range(31).map((y) => [y, 100000 * Math.pow(1.1, y)] as [number, number]);
const simpleYears = range(31).map((y) => [y, 100000 * (1 + 0.1 * y)] as [number, number]);

const snowball = compoundGrowth({ initial: 0, monthly: 5000, annualRatePct: 10, years: 30 });
const snowBar = (year: number) => {
  const p = snowball[year];
  return {
    label: `Year ${year}`,
    segments: [
      { label: 'Money you put in', value: p.contributed, tone: 'chart3' as Tone },
      { label: 'Growth', value: p.balance - p.contributed, tone: 'chart1' as Tone },
    ],
  };
};

const toPts = (pts: GrowthPoint[]) => pts.map((p) => [p.year, p.balance] as [number, number]);
const fee0 = compoundGrowth({ initial: 100000, monthly: 0, annualRatePct: 10, years: 20 });
const fee1 = compoundGrowth({ initial: 100000, monthly: 0, annualRatePct: 9, years: 20 });
const fee2 = compoundGrowth({ initial: 100000, monthly: 0, annualRatePct: 8, years: 20 });

const pension = compoundGrowth({ initial: 0, monthly: 3000, annualRatePct: 8, years: 30 });

const marketYields = range(13).map((i) => 6 + i);
const priceAt = (y: number) => bondPrice(100, 6, 20, y / 200);

export const DIAGRAMS = {
  // ── Basics ───────────────────────────────────────────────
  'save-vs-invest': {
    type: 'compare',
    title: 'Saving compared with investing',
    desc: 'Two columns. Saving: money kept safe and easy to reach, small or no growth, suits goals within about two years. Investing: money put to work for growth, value can go up and down, suits goals five or more years away.',
    columns: [
      { heading: 'Saving', tone: 'chart3', items: ['Goal: keep money safe', 'Easy to reach quickly', 'Small, steady growth', 'Best for the next 0–2 years'] },
      { heading: 'Investing', tone: 'chart1', items: ['Goal: grow money', 'Value moves up and down', 'Higher growth over time', 'Best for 5+ years away'] },
    ],
  },
  'money-jobs': {
    type: 'ladder',
    title: 'Give every shilling a job',
    desc: 'A ladder of four money jobs from the bottom up: everyday spending cash, an emergency fund, short-term goals, and long-term goals. The further up the ladder, the longer the money can stay invested and the more ups and downs it can handle.',
    lowLabel: 'Needed soon, keep safe',
    highLabel: 'Needed later, can grow',
    rungs: [
      { label: 'Everyday cash', note: 'Bills and spending this month' },
      { label: 'Emergency fund', note: '3–6 months of essentials, easy to reach' },
      { label: 'Short-term goals', note: 'Fees, rent deposit, a phone: 1–3 years' },
      { label: 'Long-term goals', note: 'Home, retirement: 5+ years, can be invested' },
    ],
  },
  'emergency-budget': {
    type: 'donut',
    title: 'What an emergency fund covers',
    desc: 'A donut chart of one example month of essential spending: rent 40 percent, food 25 percent, transport 15 percent, and utilities, school and health 20 percent. The emergency fund multiplies this monthly total by three to six.',
    centre: '1 month',
    slices: [
      { label: 'Rent', value: 40, tone: 'chart1' },
      { label: 'Food', value: 25, tone: 'chart2' },
      { label: 'Transport', value: 15, tone: 'chart3' },
      { label: 'Utilities, school, health', value: 20, tone: 'muted' },
    ],
  },
  'buffer-vs-debt': {
    type: 'compare',
    title: 'A shock with and without a buffer',
    desc: 'Two columns comparing what happens after a sudden expense. With an emergency fund: pay from the fund, investments stay untouched, refill the fund over a few months. Without one: borrow at high interest or sell investments at a bad time, and repayments squeeze future months.',
    columns: [
      { heading: 'With a buffer', tone: 'chart1', items: ['Pay from the fund', 'Investments keep growing', 'Refill over a few months', 'Stress stays low'] },
      { heading: 'Without one', tone: 'chart2', items: ['Borrow at high interest', 'Or sell investments at a loss', 'Repayments eat future pay', 'One shock leads to another'] },
    ],
  },
  'compound-vs-simple': {
    type: 'lines',
    title: 'Compound growth against simple interest',
    desc: 'A line chart over 30 years starting from KES 100,000 at 10 percent a year. Simple interest grows in a straight line to KES 400,000. Compound growth curves upward and reaches about KES 1.74 million, because each year’s growth also earns growth.',
    xLabel: 'Years',
    yLabel: 'Value (KES)',
    yFormat: 'kes',
    series: [
      { label: 'Compound, 10% a year', tone: 'chart1', points: compoundYears },
      { label: 'Simple, 10% a year', tone: 'chart2', points: simpleYears },
    ],
  },
  'compound-snowball': {
    type: 'bars',
    title: 'The snowball: your money versus growth',
    desc: 'Stacked bars for saving KES 5,000 a month at an illustrative 10 percent a year. At year 5 most of the balance is your own money. By year 30 you have put in KES 1.8 million but the growth part is about KES 9.5 million, several times larger.',
    yLabel: 'Balance (KES)',
    yFormat: 'kes',
    bars: [snowBar(5), snowBar(10), snowBar(20), snowBar(30)],
  },
  'inflation-erosion': {
    type: 'lines',
    title: 'Inflation shrinks what money can buy',
    desc: 'A line chart of what KES 100,000 kept as cash can buy over 20 years, in today’s shillings. At 5 percent inflation it falls to about KES 38,000. At 8 percent it falls to about KES 21,000.',
    xLabel: 'Years',
    yLabel: 'Buying power (today’s KES)',
    yFormat: 'kes',
    series: [
      { label: '5% inflation', tone: 'chart1', points: range(21).map((y) => [y, purchasingPower(100000, 5, y)] as [number, number]) },
      { label: '8% inflation', tone: 'chart2', points: range(21).map((y) => [y, purchasingPower(100000, 8, y)] as [number, number]) },
    ],
  },
  'real-return': {
    type: 'bars',
    title: 'Nominal return minus inflation leaves the real return',
    desc: 'Three bars: a nominal return of 10 percent, inflation of 6 percent, and the real return of about 3.8 percent that is left after inflation.',
    yLabel: 'Percent a year',
    yFormat: 'pct',
    bars: [
      { label: 'Nominal', segments: [{ label: 'Return before inflation', value: 10, tone: 'chart1' }] },
      { label: 'Inflation', segments: [{ label: 'Inflation', value: 6, tone: 'chart2' }] },
      { label: 'Real', segments: [{ label: 'Real return', value: 3.8, tone: 'chart3' }] },
    ],
  },
  'risk-ladder': {
    type: 'ladder',
    title: 'The risk and return ladder',
    desc: 'A staircase from lower to higher risk: bank and Sacco deposits, money market funds, Treasury bills, Treasury bonds, REITs, and shares. Each step up usually offers a higher expected return in exchange for bigger swings and a higher chance of losses.',
    lowLabel: 'Lower risk, lower expected return',
    highLabel: 'Higher risk, higher expected return',
    rungs: [
      { label: 'Bank & Sacco deposits', note: 'Steady, but can trail inflation' },
      { label: 'Money market funds', note: 'Short-term debt, small daily moves' },
      { label: 'Treasury bills', note: 'Government debt up to one year' },
      { label: 'Treasury bonds', note: 'Prices move when rates change' },
      { label: 'REITs', note: 'Property income, traded prices swing' },
      { label: 'Shares', note: 'Ownership: biggest swings and potential' },
    ],
  },
  'two-paths': {
    type: 'lines',
    title: 'A calm path and a bumpy path',
    desc: 'An illustrative line chart over ten years. A lower-risk investment rises gently and steadily. A higher-risk investment zigzags, falls below its starting value twice, but ends higher. The numbers are made up to show the shape, not real data.',
    xLabel: 'Years',
    yLabel: 'Value (KES)',
    yFormat: 'kes',
    series: [
      { label: 'Lower risk (made up)', tone: 'chart3', points: [[0, 100000], [1, 107000], [2, 114000], [3, 122000], [4, 130000], [5, 139000], [6, 149000], [7, 159000], [8, 170000], [9, 182000], [10, 195000]] },
      { label: 'Higher risk (made up)', tone: 'chart2', points: [[0, 100000], [1, 124000], [2, 92000], [3, 118000], [4, 150000], [5, 121000], [6, 96000], [7, 155000], [8, 190000], [9, 172000], [10, 238000]] },
    ],
  },
  'diversified-mix': {
    type: 'donut',
    title: 'An example of spreading money across baskets',
    desc: 'A donut chart of an illustrative mix: 30 percent money market fund, 30 percent Treasury bonds, 25 percent shares across several companies, and 15 percent REITs. It is an example of spreading, not a recommendation.',
    centre: 'Example',
    slices: [
      { label: 'Money market fund', value: 30, tone: 'chart3' },
      { label: 'Treasury bonds', value: 30, tone: 'chart1' },
      { label: 'Shares (many firms)', value: 25, tone: 'chart2' },
      { label: 'REITs', value: 15, tone: 'muted' },
    ],
  },
  'diversify-smoothing': {
    type: 'lines',
    title: 'Two investments that zig and zag smooth each other',
    desc: 'An illustrative line chart. Investment A and investment B both zigzag, but often in opposite directions. A 50-50 mix of the two follows a smoother path between them.',
    xLabel: 'Years',
    yLabel: 'Value (start = 100)',
    yFormat: 'plain',
    series: [
      { label: 'Investment A', tone: 'chart2', points: [[0, 100], [1, 112], [2, 97], [3, 116], [4, 104], [5, 124], [6, 110], [7, 131]] },
      { label: 'Investment B', tone: 'chart3', points: [[0, 100], [1, 95], [2, 110], [3, 101], [4, 118], [5, 108], [6, 127], [7, 119]] },
      { label: '50-50 mix', tone: 'chart1', points: [[0, 100], [1, 103.5], [2, 103.5], [3, 108.5], [4, 111], [5, 116], [6, 118.5], [7, 125]] },
    ],
  },
  'horizon-ladder': {
    type: 'ladder',
    title: 'Match the investment to when you need the money',
    desc: 'A ladder pairing time horizons with kinds of places for money: under one year with deposits and money market funds; one to three years with Treasury bills and shorter bonds; three to five years with a bond-heavy mix; five years or more with a mix that can include shares and REITs.',
    lowLabel: 'Need it soon',
    highLabel: 'Need it much later',
    rungs: [
      { label: 'Under 1 year', note: 'Deposits, money market funds' },
      { label: '1–3 years', note: 'Treasury bills, shorter bonds' },
      { label: '3–5 years', note: 'Mostly bonds, a little growth' },
      { label: '5+ years', note: 'Room for shares and REITs' },
    ],
  },
  'horizon-funnel': {
    type: 'lines',
    title: 'Longer holding periods narrow the range of outcomes',
    desc: 'An illustrative chart of best and worst average yearly returns for a share-heavy investment by how long it was held. Held for one year the range runs from about minus 30 to plus 40 percent. Held for 20 years it narrows to roughly plus 4 to plus 11 percent. Made-up numbers showing a common pattern, not a promise.',
    xLabel: 'Years held',
    yLabel: 'Average yearly return (%)',
    yFormat: 'pct',
    series: [
      { label: 'Best case (made up)', tone: 'chart1', points: [[1, 40], [3, 25], [5, 18], [10, 14], [15, 12], [20, 11]] },
      { label: 'Worst case (made up)', tone: 'chart2', points: [[1, -30], [3, -12], [5, -4], [10, 1], [15, 3], [20, 4]] },
    ],
  },
  'fee-drag': {
    type: 'lines',
    title: 'Fees compound too',
    desc: 'A line chart of KES 100,000 over 20 years at a 10 percent gross return. With no fees it reaches about KES 733,000. With a 1 percent yearly fee it reaches about KES 601,000. With a 2 percent fee about KES 493,000, roughly a third less than with no fees.',
    xLabel: 'Years',
    yLabel: 'Value (KES)',
    yFormat: 'kes',
    series: [
      { label: 'No fee', tone: 'chart1', points: toPts(fee0) },
      { label: '1% fee', tone: 'chart3', points: toPts(fee1) },
      { label: '2% fee', tone: 'chart2', points: toPts(fee2) },
    ],
  },
  'fee-layers': {
    type: 'flow',
    title: 'From gross return to what you keep',
    desc: 'A top-to-bottom flow: the gross return an investment earns, minus the management fee, minus other costs such as trustee, custody and transaction charges, minus tax where it applies, leaves the net return you keep.',
    nodes: [
      { label: 'Gross return', note: 'What the underlying investments earn' },
      { label: 'Management fee', note: 'Charged yearly as a % of your balance' },
      { label: 'Other costs', note: 'Trustee, custody, brokerage, levies' },
      { label: 'Tax', note: 'For example withholding tax on interest' },
      { label: 'Net return you keep', note: 'The number that matters' },
    ],
    edges: ['minus', 'minus', 'minus', 'leaves'],
  },
  'liquidity-ladder': {
    type: 'ladder',
    title: 'How quickly can it become cash?',
    desc: 'A ladder from fastest to slowest to turn into cash: mobile money and bank savings within minutes to a day; money market funds usually within a few working days; listed shares and REITs after selling and settlement; Treasury bills and bonds at maturity or by selling, possibly at a different price; pensions and land, which can take months or years.',
    lowLabel: 'Fast to cash',
    highLabel: 'Slow to cash',
    rungs: [
      { label: 'Mobile money, bank savings', note: 'Minutes to a day' },
      { label: 'Money market funds', note: 'Usually a few working days' },
      { label: 'Listed shares, REITs', note: 'Sell, then settlement days' },
      { label: 'Treasury bills & bonds', note: 'At maturity, or sell at market price' },
      { label: 'Pensions, land', note: 'Months to years, rules apply' },
    ],
  },
  'liquidity-tradeoff': {
    type: 'compare',
    title: 'The liquidity trade-off',
    desc: 'Two columns. Very liquid money is quick to reach and stable but usually earns less. Less liquid money is slower or costlier to reach, and may need to be sold at an unknown price, but can offer higher returns.',
    columns: [
      { heading: 'Very liquid', tone: 'chart3', items: ['Reach it fast', 'Price is stable', 'Usually earns less', 'Good for emergencies'] },
      { heading: 'Less liquid', tone: 'chart1', items: ['Slower or costly to exit', 'May sell at a lower price', 'Can earn more over time', 'Good for long goals'] },
    ],
  },
  'scam-pyramid': {
    type: 'pyramid',
    title: 'How a pyramid scheme pays',
    desc: 'A pyramid with four levels. At the top the promoter collects from everyone. Early joiners are paid with money from later joiners. Recruiters must keep bringing in new people. The wide base of newest recruits pays in and is left with the losses when recruitment slows.',
    levels: [
      { label: 'Promoter', note: 'Collects from every level' },
      { label: 'Early joiners', note: 'Paid with newer people’s money' },
      { label: 'Recruiters', note: 'Must keep signing people up' },
      { label: 'Newest recruits', note: 'Pay in last and lose the most' },
    ],
  },
  'verify-flow': {
    type: 'flow',
    title: 'Check before you pay',
    desc: 'A top-to-bottom checklist. Pause, because pressure to act fast is a warning sign. Find the regulator: CMA for investments, CBK for banks and payment firms, SASRA for deposit-taking Saccos, RBA for pensions. Search the regulator’s official list for the exact name. Contact the firm only through details on that official list. If anything does not match, walk away and report it.',
    nodes: [
      { label: 'Pause', note: 'Pressure to act fast is a warning sign' },
      { label: 'Find the regulator', note: 'CMA · CBK · SASRA · RBA' },
      { label: 'Search the official list', note: 'Exact legal name, licence type' },
      { label: 'Use official contacts', note: 'Not the number that called you' },
      { label: 'No match? Walk away', note: 'Report it to the regulator' },
    ],
    edges: ['then', 'then', 'then', 'if in doubt'],
  },

  // ── Kenya ───────────────────────────────────────────────
  'mmf-flow': {
    type: 'flow',
    title: 'How money moves in a money market fund',
    desc: 'A top-to-bottom flow. Many investors put money into one pooled fund and receive units. A licensed fund manager invests the pool in short-term debt such as Treasury bills, bank deposits and commercial paper. A custodian holds the assets and a trustee watches over the manager for investors. Interest earned, minus fees, is shared back to investors in proportion to their units.',
    nodes: [
      { label: 'Many investors', note: 'Each buys units in the fund' },
      { label: 'Pooled fund', note: 'One pot, a CMA-approved scheme' },
      { label: 'Fund manager invests', note: 'T-bills, deposits, short-term debt' },
      { label: 'Custodian & trustee', note: 'Hold the assets · watch the manager' },
      { label: 'Income shared back', note: 'Interest minus fees, by units held' },
    ],
    edges: ['money in', 'managed by', 'safeguarded by', 'returns'],
  },
  'cis-types': {
    type: 'ladder',
    title: 'Kinds of unit trust funds',
    desc: 'A ladder of collective investment scheme types from lower to higher risk: money market funds, fixed income or bond funds, balanced funds, and equity funds.',
    lowLabel: 'Lower risk',
    highLabel: 'Higher risk',
    rungs: [
      { label: 'Money market fund', note: 'Short-term debt, small daily moves' },
      { label: 'Fixed income fund', note: 'Mostly bonds, moves with rates' },
      { label: 'Balanced fund', note: 'A mix of bonds and shares' },
      { label: 'Equity fund', note: 'Mostly shares, biggest swings' },
    ],
  },
  'sacco-deposits-shares': {
    type: 'compare',
    title: 'Sacco deposits compared with share capital',
    desc: 'Two columns. Deposits: savings you add regularly, usually not withdrawable while you remain a member, back your loan limit, and earn interest on deposits. Share capital: your ownership stake, often a fixed minimum, can often be transferred but not withdrawn, and earns a dividend.',
    columns: [
      { heading: 'Deposits', tone: 'chart3', items: ['Added monthly', 'Usually locked while a member', 'Set your loan limit', 'Earn interest on deposits'] },
      { heading: 'Share capital', tone: 'chart1', items: ['Your ownership stake', 'Often a fixed minimum', 'Transferable, not withdrawable', 'Earns a dividend'] },
    ],
  },
  'sacco-loop': {
    type: 'flow',
    title: 'The Sacco money loop',
    desc: 'A top-to-bottom loop. Members save deposits and buy shares. The Sacco pools the money and lends it to members. Borrowers repay with interest. After costs, the surplus is returned as interest on deposits and dividends on shares, back to members.',
    nodes: [
      { label: 'Members save', note: 'Deposits and share capital' },
      { label: 'Sacco pools the money', note: 'SASRA-licensed if deposit-taking' },
      { label: 'Loans to members', note: 'Often a multiple of your deposits' },
      { label: 'Repayments with interest', note: 'Income for the Sacco' },
      { label: 'Surplus shared', note: 'Interest on deposits, dividends on shares' },
    ],
    edges: ['into', 'lent out', 'repaid', 'after costs'],
  },
  'tbill-timeline': {
    type: 'timeline',
    title: 'A Treasury bill’s cash flows',
    desc: 'A timeline for a 364-day Treasury bill. On day 0 you pay less than the face value. Nothing is paid in between. On day 364 you receive the full face value. The difference is your interest, before withholding tax.',
    span: 364,
    unit: 'days',
    rows: [
      {
        label: '364-day T-bill',
        events: [
          { at: 0, dir: 'out', label: 'Pay discounted price' },
          { at: 364, dir: 'in', label: 'Get face value', size: 1.3 },
        ],
      },
    ],
  },
  'dhowcsd-flow': {
    type: 'flow',
    title: 'Buying a Treasury bill through DhowCSD',
    desc: 'A top-to-bottom flow. Open a CBK DhowCSD account online with your ID and KRA PIN and link a bank account. Place a bid in the weekly auction. CBK decides which bids are accepted. Pay for accepted bids and the bill is recorded in your account. At maturity, money returns to your bank account or is rolled over if you chose that.',
    nodes: [
      { label: 'Open a DhowCSD account', note: 'ID, KRA PIN, linked bank account' },
      { label: 'Bid in an auction', note: 'Non-competitive or competitive' },
      { label: 'CBK accepts bids', note: 'Results published after the auction' },
      { label: 'Pay and hold', note: 'Security recorded in your account' },
      { label: 'Maturity', note: 'Proceeds to your bank, or roll over' },
    ],
    edges: ['then', 'auction', 'if accepted', 'on the due date'],
  },
  'bond-timeline': {
    type: 'timeline',
    title: 'A Treasury bond’s cash flows',
    desc: 'A timeline for a three-year Treasury bond. You pay the price at the start. Every six months you receive a coupon, six in total. At the end you receive the last coupon plus the face value back.',
    span: 3,
    unit: 'years',
    rows: [
      {
        label: '3-year bond',
        events: [
          { at: 0, dir: 'out', label: 'Pay price' },
          { at: 0.5, dir: 'in', label: 'Coupons', size: 0.6 },
          { at: 1, dir: 'in', size: 0.6 },
          { at: 1.5, dir: 'in', size: 0.6 },
          { at: 2, dir: 'in', size: 0.6 },
          { at: 2.5, dir: 'in', size: 0.6 },
          { at: 3, dir: 'in', label: 'Coupon + face value', size: 1.4 },
        ],
      },
    ],
  },
  'price-yield-seesaw': {
    type: 'lines',
    title: 'When market rates rise, existing bond prices fall',
    desc: 'A line chart for a 10-year bond paying a 12 percent coupon. When market yields are 6 percent its price is about 145 per 100 of face value. At 12 percent it is 100. At 18 percent it falls to about 73. Price and yield move like a seesaw.',
    xLabel: 'Market yield',
    yLabel: 'Price per 100 face value',
    yFormat: 'plain',
    xFormat: 'pct',
    series: [{ label: 'Bond price', tone: 'chart1', points: marketYields.map((y) => [y, priceAt(y)] as [number, number]) }],
  },
  'nse-trade-flow': {
    type: 'flow',
    title: 'How an NSE share purchase flows',
    desc: 'A top-to-bottom flow. You place an order with a licensed stockbroker. The broker enters it on the Nairobi Securities Exchange trading system. The order is matched with a seller. CDSC settles the trade, swapping cash and shares, three business days after the trade. The shares appear in your CDS account.',
    nodes: [
      { label: 'You', note: 'Order: which share, how many, what price' },
      { label: 'Stockbroker', note: 'CMA-licensed, opens your CDS account' },
      { label: 'NSE trading system', note: 'Matches buyers and sellers' },
      { label: 'CDSC settlement', note: 'Cash and shares swap on T+3' },
      { label: 'Your CDS account', note: 'Electronic record of your shares' },
    ],
    edges: ['places order', 'enters trade', 'matched', 'settled'],
  },
  'share-returns': {
    type: 'compare',
    title: 'Two ways shares can pay you',
    desc: 'Two columns. Dividends: cash paid from company profits, not guaranteed, with withholding tax deducted. Price change: the share price can rise or fall, and a gain or loss is only locked in when you sell.',
    columns: [
      { heading: 'Dividends', tone: 'chart1', items: ['Cash from profits', 'Can be cut or skipped', 'Withholding tax applies', 'Paid to holders on record'] },
      { heading: 'Price change', tone: 'chart2', items: ['Price rises or falls', 'Locked in only when you sell', 'You can lose money', 'Driven by profits and mood'] },
    ],
  },
  'tplus3-timeline': {
    type: 'timeline',
    title: 'T+3 settlement',
    desc: 'A timeline across three business days. On trade day T your order is matched. During T+1 and T+2 brokers and CDSC confirm and prepare. On T+3 cash moves to the seller and shares move into the buyer’s CDS account.',
    span: 3,
    unit: 'business days',
    rows: [
      {
        label: 'One trade',
        events: [
          { at: 0, dir: 'mark', label: 'T: matched' },
          { at: 1, dir: 'mark', label: 'T+1' },
          { at: 2, dir: 'mark', label: 'T+2' },
          { at: 3, dir: 'mark', label: 'T+3: settled' },
        ],
      },
    ],
  },
  'dividend-dates': {
    type: 'timeline',
    title: 'Dividend key dates',
    desc: 'A timeline of a dividend. First the company announces the dividend and its dates. Next comes book closure, when the register of shareholders is fixed; you must already be a settled holder by then. Later comes the payment date, when the dividend after withholding tax is paid.',
    span: 2,
    unit: 'weeks apart',
    rows: [
      {
        label: 'A dividend',
        events: [
          { at: 0, dir: 'mark', label: 'Announced' },
          { at: 1, dir: 'mark', label: 'Book closure' },
          { at: 2, dir: 'in', label: 'Paid' },
        ],
      },
    ],
  },
  'reit-structure': {
    type: 'flow',
    title: 'How a REIT is put together',
    desc: 'A top-to-bottom flow. Investors buy units in the REIT. A trustee holds the property on the investors’ behalf and a REIT manager runs it, both under CMA rules. The money owns or develops property such as offices, malls or housing. Rent or sale proceeds, after costs, are distributed back to unit holders.',
    nodes: [
      { label: 'Investors', note: 'Buy units in the REIT' },
      { label: 'Trustee + REIT manager', note: 'Hold the assets · run the strategy' },
      { label: 'Property', note: 'Offices, malls, housing, hostels' },
      { label: 'Rent or sale proceeds', note: 'Minus running costs' },
      { label: 'Distributions', note: 'Paid out to unit holders' },
    ],
    edges: ['pooled into', 'invest in', 'earns', 'shared as'],
  },
  'ireit-vs-dreit': {
    type: 'compare',
    title: 'I-REIT compared with D-REIT',
    desc: 'Two columns. An income REIT owns finished, rent-earning property and pays out most of its income. A development REIT builds or develops property, so returns come later and risk is higher; some are open only to professional investors.',
    columns: [
      { heading: 'I-REIT (income)', tone: 'chart1', items: ['Owns finished property', 'Earns rent now', 'Pays out most income', 'Lower risk of the two'] },
      { heading: 'D-REIT (development)', tone: 'chart2', items: ['Builds new property', 'Returns come later', 'Higher risk', 'Some for professionals only'] },
    ],
  },
  'pension-pillars': {
    type: 'ladder',
    title: 'Layers of retirement saving in Kenya',
    desc: 'A ladder of retirement layers from the base up: NSSF Tier I for every employee; NSSF Tier II, paid to NSSF or an approved private scheme; an employer’s occupational pension or provident fund; and a personal pension plan you choose yourself.',
    lowLabel: 'Base layer',
    highLabel: 'Extra layers you add',
    rungs: [
      { label: 'NSSF Tier I', note: 'Mandatory, on the lower band of pay' },
      { label: 'NSSF Tier II', note: 'Upper band; NSSF or approved scheme' },
      { label: 'Employer scheme', note: 'Occupational pension or provident fund' },
      { label: 'Personal pension plan', note: 'You choose and contribute' },
    ],
  },
  'pension-growth': {
    type: 'lines',
    title: 'Small monthly contributions over a career',
    desc: 'A line chart of saving KES 3,000 a month for 30 years. Total contributions reach KES 1.08 million. At an illustrative 8 percent a year the balance reaches about KES 4.5 million, mostly from growth in the later years.',
    xLabel: 'Years',
    yLabel: 'Value (KES)',
    yFormat: 'kes',
    series: [
      { label: 'Balance at 8% (illustrative)', tone: 'chart1', points: toPts(pension) },
      { label: 'Money paid in', tone: 'chart3', points: pension.map((p) => [p.year, p.contributed] as [number, number]) },
    ],
  },
  'wht-flow': {
    type: 'flow',
    title: 'How withholding tax is taken',
    desc: 'A top-to-bottom flow. An investment earns gross interest or dividends. The payer, such as a bank, fund manager, CBK or a company, deducts withholding tax before paying you. The tax goes to KRA. You receive the net amount. For many resident individuals this withholding is the final tax on that income.',
    nodes: [
      { label: 'Gross income', note: 'Interest or dividend earned' },
      { label: 'Payer deducts tax', note: 'Bank, fund manager, CBK or company' },
      { label: 'Tax paid to KRA', note: 'Withheld at source' },
      { label: 'Net income to you', note: 'Often the final tax for individuals' },
    ],
    edges: ['before paying', 'sent to', 'rest to you'],
  },
  'tax-compare': {
    type: 'compare',
    title: 'Tax treatment differs by product',
    desc: 'Two columns of examples, to be confirmed with KRA and the offer documents. Usually taxed at source: bank and Sacco interest, money market fund income, most Treasury bill and bond interest, and dividends. Often exempt or relieved: interest on infrastructure bonds when the prospectus says so, and pension contributions within the allowed limit, which can reduce taxable pay.',
    columns: [
      { heading: 'Usually taxed at source', tone: 'chart2', items: ['Bank & Sacco interest', 'Money market fund income', 'Most T-bill & bond interest', 'Dividends'] },
      { heading: 'Often exempt or relieved', tone: 'chart1', items: ['Infrastructure bond interest (check the prospectus)', 'Pension contributions within the limit'] },
    ],
  },
  // ── Global ───────────────────────────────────────────────
  'nse-vs-world': {
    type: 'compare',
    title: 'The NSE alone compared with global markets',
    desc: 'Two columns. NSE only: about sixty listed companies, a few large firms make up much of the value, one economy, one currency. Global markets: thousands of companies, many industries and countries, several currencies, so no single company decides the result.',
    columns: [
      { heading: 'NSE only', tone: 'chart2', items: ['About 60 listed companies', 'A few big names dominate', 'One economy', 'One currency (KES)'] },
      { heading: 'Global markets', tone: 'chart1', items: ['Thousands of companies', 'Many industries', 'Many countries', 'Several currencies'] },
    ],
  },
  'global-diversify': {
    type: 'donut',
    title: 'One illustrative spread-out mix',
    desc: 'A donut chart of one made-up example mix, not a recommendation: Kenyan money market fund and bonds 40 percent, NSE shares 20 percent, global shares through a fund 30 percent, and other assets such as a REIT or gold 10 percent.',
    centre: 'Example mix',
    slices: [
      { label: 'Kenyan MMF and bonds', value: 40, tone: 'chart3' },
      { label: 'NSE shares', value: 20, tone: 'chart2' },
      { label: 'Global shares fund', value: 30, tone: 'chart1' },
      { label: 'Other (REIT, gold)', value: 10, tone: 'muted' },
    ],
  },
  'index-basket': {
    type: 'flow',
    title: 'How one fund unit holds many companies',
    desc: 'A flow from top to bottom. You buy one unit of an index fund or ETF. The fund pools money from many investors. It buys every company in the index in the index proportions. You get the index return, minus the fund fee.',
    nodes: [
      { label: 'You buy one unit', note: 'Through a broker or the fund manager' },
      { label: 'The fund pools money', note: 'From many investors' },
      { label: 'It buys the whole index', note: 'Hundreds or thousands of companies' },
      { label: 'You get the index return', note: 'Minus the yearly fund fee' },
    ],
    edges: ['money in', 'follows fixed rules', 'gains and losses'],
  },
  'etf-vs-mutual': {
    type: 'compare',
    title: 'ETF compared with a traditional unit trust',
    desc: 'Two columns. ETF: listed on a stock exchange, bought through a stockbroker, price moves during the trading day, needs a CDS or brokerage account. Unit trust: bought from and sold back to the fund manager, priced once a day, often allows small regular top-ups.',
    columns: [
      { heading: 'ETF', tone: 'chart1', items: ['Listed on an exchange', 'Buy through a stockbroker', 'Price moves all day', 'Needs a CDS or broker account'] },
      { heading: 'Unit trust', tone: 'chart3', items: ['Buy from the manager', 'Sell back to the manager', 'Priced once a day', 'Easy small top-ups'] },
    ],
  },
  'global-routes': {
    type: 'ladder',
    title: 'Routes to global investing from Kenya',
    desc: 'A ladder of four routes from bottom to top. NSE-listed ETFs bought in shillings through a stockbroker. Global or offshore unit trusts from CMA-approved Kenyan managers. CMA-licensed Kenyan brokers that offer foreign markets. Foreign online brokers, regulated abroad, not by CMA. Higher rungs give more choice but less Kenyan oversight.',
    lowLabel: 'More Kenyan oversight, priced in KES',
    highLabel: 'More choice, less local protection',
    rungs: [
      { label: 'NSE-listed ETFs', note: 'Shillings, CDS account, local stockbroker' },
      { label: 'Global unit trusts', note: 'From CMA-approved Kenyan fund managers' },
      { label: 'Kenyan broker, foreign markets', note: 'CMA-licensed firm with an overseas partner' },
      { label: 'Foreign online broker', note: 'Regulated abroad, not by CMA' },
    ],
  },
  'feeder-etf-flow': {
    type: 'flow',
    title: 'How a feeder ETF reaches global shares',
    desc: 'A flow from top to bottom. You buy feeder ETF units on the NSE in shillings through a stockbroker. The feeder ETF invests in a larger master fund abroad. The master fund holds shares in many companies around the world. Their value, in shillings, flows back to your units.',
    nodes: [
      { label: 'You, via a stockbroker', note: 'Buy units on the NSE in KES' },
      { label: 'Feeder ETF (Kenya)', note: 'Collects investors’ money' },
      { label: 'Master fund (abroad)', note: 'A large global index fund' },
      { label: 'Global shares', note: 'Many companies worldwide' },
    ],
    edges: ['units bought', 'invests in', 'holds'],
  },
  'fx-return-bars': {
    type: 'bars',
    title: 'One dollar return, three shilling results',
    desc: 'Three bars, each starting with KES 100,000 in an investment that gains 8 percent in dollars. If the dollar stays flat against the shilling, you end with KES 108,000. If the dollar strengthens 5 percent, about KES 113,400. If it weakens 5 percent, about KES 102,600.',
    yLabel: 'KES',
    yFormat: 'kes',
    bars: [
      { label: 'USD −5%', segments: [{ label: 'Starting amount', value: 100000, tone: 'chart3' }, { label: 'Gain in KES', value: 2600, tone: 'chart1' }] },
      { label: 'USD flat', segments: [{ label: 'Starting amount', value: 100000, tone: 'chart3' }, { label: 'Gain in KES', value: 8000, tone: 'chart1' }] },
      { label: 'USD +5%', segments: [{ label: 'Starting amount', value: 100000, tone: 'chart3' }, { label: 'Gain in KES', value: 13400, tone: 'chart1' }] },
    ],
  },
  'currency-two-ways': {
    type: 'compare',
    title: 'What exchange-rate moves do to foreign assets',
    desc: 'Two columns. When the dollar strengthens against the shilling: each dollar buys more shillings, your dollar assets are worth more in shillings, and the currency adds to your return. When the dollar weakens: each dollar buys fewer shillings, your assets are worth less in shillings, and the currency eats into your return.',
    columns: [
      { heading: 'Dollar strengthens', tone: 'chart1', items: ['1 USD buys more KES', 'Your assets are worth more KES', 'Currency adds to return'] },
      { heading: 'Dollar weakens', tone: 'chart2', items: ['1 USD buys fewer KES', 'Your assets are worth fewer KES', 'Currency cuts your return'] },
    ],
  },
  'global-cost-stack': {
    type: 'flow',
    title: 'Where money leaks when investing abroad',
    desc: 'A flow from top to bottom showing costs. Your shillings first lose a little to the currency conversion spread, then to transfer or bank fees, then to broker commission when you buy, then to the yearly fund fee, and finally to withholding tax on dividends. What is left is your actual investment return.',
    nodes: [
      { label: 'Your shillings', note: 'For example KES 100,000' },
      { label: 'Currency conversion', note: 'The spread between buy and sell rates' },
      { label: 'Transfer and broker fees', note: 'Per transfer and per trade' },
      { label: 'Fund fees and dividend tax', note: 'Every year you hold' },
      { label: 'What you actually keep' },
    ],
    edges: ['spread', 'fees', 'yearly costs', 'net'],
  },
  'us-dividend-wht': {
    type: 'bars',
    title: 'Where a US dividend goes',
    desc: 'One stacked bar for an illustrative 100 dollar dividend from a US company paid to a Kenyan resident. Using the 30 percent rate as of 2026-10, 30 dollars is withheld as US tax and 70 dollars reaches your account before any Kenyan tax or fees.',
    yLabel: 'USD',
    yFormat: 'plain',
    bars: [
      { label: 'USD 100 dividend', segments: [{ label: 'You receive', value: 70, tone: 'chart1' }, { label: 'US tax withheld', value: 30, tone: 'chart2' }] },
    ],
  },
  'custody-chain': {
    type: 'flow',
    title: 'The custody chain behind a platform',
    desc: 'A flow from top to bottom. You open an account in your own name with a platform or broker. The broker places your orders on an exchange. An independent custodian or depository holds the shares in your name, separate from the broker’s own money. A regulator supervises each link.',
    nodes: [
      { label: 'You', note: 'Account in your own name' },
      { label: 'Platform or broker', note: 'Places your orders' },
      { label: 'Custodian or depository', note: 'Holds your shares separately' },
      { label: 'Regulator', note: 'Supervises each link' },
    ],
    edges: ['instructions', 'settles trades', 'oversight'],
  },
  'platform-checklist': {
    type: 'compare',
    title: 'Green flags and red flags for an investing platform',
    desc: 'Two columns. Green flags: licensed by a named regulator you can look up, assets held in your name with a custodian, clear fee list, easy withdrawals. Red flags: guaranteed or fixed high returns, contact only through WhatsApp or Telegram, pressure to deposit fast, trouble withdrawing.',
    columns: [
      { heading: 'Green flags', tone: 'chart1', items: ['Regulator you can look up', 'Assets held in your name', 'Clear written fee list', 'Withdrawals work'] },
      { heading: 'Red flags', tone: 'chart2', items: ['“Guaranteed” returns', 'Only WhatsApp or Telegram', 'Pressure to pay fast', 'Hard to withdraw'] },
    ],
  },
  // ── Trading ──────────────────────────────────────────────
  'invest-vs-trade': {
    type: 'compare',
    title: 'Investing compared with trading',
    desc: 'Two columns. Investing: own businesses or funds for years, returns come from company growth, dividends and interest, few decisions and low costs. Trading: buy and sell over days or minutes, aim to profit from price moves, many decisions, costs on every trade, and most short-term traders lose money.',
    columns: [
      { heading: 'Investing', tone: 'chart1', items: ['Hold for years', 'Gain from growth and income', 'Few decisions', 'Low costs'] },
      { heading: 'Trading', tone: 'chart2', items: ['Hold for minutes to weeks', 'Gain only from price moves', 'Many decisions', 'Costs on every trade'] },
    ],
  },
  'day-trader-results': {
    type: 'bars',
    title: 'What happened to persistent day traders in one large study',
    desc: 'One stacked bar from a study of people who day traded Brazilian equity futures for more than 300 days between 2013 and 2015.     About 97 percent lost money and only about 3 percent did not.',
    yLabel: '% of traders',
    yFormat: 'pct',
    bars: [
          { label: 'Day traders, 300+ days', segments: [{ label: 'Lost money', value: 97, tone: 'chart2' }, { label: 'Did not lose', value: 3, tone: 'chart1' }] },
    ],
  },
  'candle-anatomy': {
    type: 'compare',
    title: 'How to read a candlestick',
    desc: 'Two columns. An up candle, drawn hollow: the bottom of the body is the open, the top is the close, so the price rose. A down candle, drawn filled: the top of the body is the open and the bottom is the close, so the price fell. On both, the thin wicks reach the highest and lowest prices of the period.',
    columns: [
      { heading: 'Up candle (hollow)', tone: 'chart1', items: ['Body bottom = open', 'Body top = close', 'Price rose', 'Wicks = high and low'] },
      { heading: 'Down candle (filled)', tone: 'chart2', items: ['Body top = open', 'Body bottom = close', 'Price fell', 'Wicks = high and low'] },
    ],
  },
  'candles-sample': {
    type: 'candles',
    title: 'Twelve days of a made-up share price',
    desc: 'A candlestick chart of twelve made-up days, price between about 49 and 56 shillings. It rises for two days, dips, jumps strongly on day four, then day five shows a long upper wick where the price spiked but closed near its open. Three down days follow, day eight has a long lower wick where buyers pushed the price back up, and the last four days drift higher.',
    yLabel: 'KES per share',
    candles: [
      [50, 51.2, 49.6, 51], [51, 52.4, 50.8, 52.1], [52.1, 52.6, 51.2, 51.5], [51.5, 53.8, 51.4, 53.5],
      [53.5, 55.6, 53.3, 53.7], [53.7, 54, 51.8, 52.2], [52.2, 52.5, 50.4, 50.9], [50.9, 51.1, 48.6, 50.8],
      [50.8, 52.2, 50.6, 52], [52, 52.3, 51.6, 51.9], [51.9, 53, 51.7, 52.8], [52.8, 53.4, 52.1, 53.1],
    ].map(([o, h, l, c]) => ({ o, h, l, c })),
    marks: [
      { at: 4, label: 'Long upper wick', kind: 'note' },
      { at: 7, label: 'Long lower wick', kind: 'note' },
    ],
  },
  'random-walks': {
    type: 'lines',
    title: 'Three price paths made from pure chance',
    desc: 'A line chart of three made-up price paths over 120 days, each starting at 100 and built only from random coin-flip moves with no trend built in. Even so, they wander apart and show what look like trends, peaks and breakouts — patterns that predict nothing.',
    xLabel: 'Days',
    yLabel: 'Price',
    yFormat: 'plain',
    zeroBase: false,
    series: [3, 11, 29].map((seed, i) => {
      const m = makeMarket(seed, 121, 100);
      return { label: `Random path ${i + 1}`, tone: (['chart1', 'chart2', 'chart3'] as Tone[])[i], points: m.map((k, d) => [d, k.c] as [number, number]) };
    }),
  },
  'pattern-traps': {
    type: 'compare',
    title: 'Chart patterns and what may really be going on',
    desc: 'Two columns. What it looks like: a clear trend, a pattern that worked last time, an indicator that called the top. What may be true: random moves can form trends, you remember the hits and forget the misses, and an indicator fitted to past prices can fail on new ones.',
    columns: [
      { heading: 'What it looks like', tone: 'chart2', items: ['A clear trend', 'A pattern that worked before', 'An indicator that called it'] },
      { heading: 'What may be true', tone: 'chart1', items: ['Chance can make trends', 'We remember hits, forget misses', 'Fitted to the past, fails later'] },
    ],
  },
  'order-types': {
    type: 'compare',
    title: 'Three common order types',
    desc: 'Three columns. A market order buys or sells now at the best available price, so the price is not certain. A limit order sets the worst price you accept, so it may not fill. A stop order turns into a sell order once the price falls to a level you choose, and in a fast fall can fill below it.',
    columns: [
      { heading: 'Market', tone: 'chart1', items: ['Trade now', 'Best price available', 'Price not certain'] },
      { heading: 'Limit', tone: 'chart3', items: ['Your price or better', 'May not fill', 'Controls price'] },
      { heading: 'Stop', tone: 'chart2', items: ['Triggers at a level', 'Limits a loss', 'Can fill worse'] },
    ],
  },
  'bid-ask-spread': {
    type: 'ladder',
    title: 'The bid, the ask and the spread',
    desc: 'A ladder of three prices for a made-up share. At the bottom, the bid of KES 49.90 is the best price buyers offer, where you can sell. In the middle, the mid price of KES 50.00. At the top, the ask of KES 50.10 is the best price sellers want, where you buy. Buying and selling straight away loses the 20 cent spread.',
    lowLabel: 'Lower price',
    highLabel: 'Higher price',
    rungs: [
      { label: 'Bid: KES 49.90', note: 'Best price buyers offer — you sell here' },
      { label: 'Mid: KES 50.00', note: 'Halfway, often shown on charts' },
      { label: 'Ask: KES 50.10', note: 'Best price sellers want — you buy here' },
    ],
  },
  'risk-per-trade': {
    type: 'bars',
    title: 'Ten losses in a row at different risk levels',
    desc: 'Three bars starting from a KES 100,000 practice account after ten losing trades in a row. Risking 1 percent of the account per trade leaves about KES 90,400. Risking 5 percent leaves about KES 59,900. Risking 10 percent leaves about KES 34,900.',
    yLabel: 'KES',
    yFormat: 'kes',
    bars: [1, 5, 10].map((r) => {
      const left = 100000 * Math.pow(1 - r / 100, 10);
      return { label: `${r}% a trade`, segments: [{ label: 'Left', value: left, tone: 'chart1' as Tone }, { label: 'Lost', value: 100000 - left, tone: 'chart2' as Tone }] };
    }),
  },
  'position-size-flow': {
    type: 'flow',
    title: 'Working out a position size',
    desc: 'A flow from top to bottom. Start with the account size, for example KES 100,000. Choose the most you will risk on one trade, for example 1 percent, which is KES 1,000. Decide where your stop is, for example KES 2 below your entry price. Divide KES 1,000 by KES 2 to get 500 shares.',
    nodes: [
      { label: 'Account: KES 100,000' },
      { label: 'Risk 1% = KES 1,000', note: 'The most you accept losing on this trade' },
      { label: 'Stop KES 2 below entry', note: 'Where the idea is proven wrong' },
      { label: 'Size: 1,000 ÷ 2 = 500 shares' },
    ],
    edges: ['× risk %', 'distance to stop', '÷'],
  },
  'breakeven-win-rate': {
    type: 'bars',
    title: 'Win rate needed to break even',
    desc: 'Three bars showing the share of trades you must win just to break even, before costs. If wins and losses are the same size, 50 percent. If wins are twice the size of losses, about 33 percent. If wins are three times the size of losses, 25 percent. Fees push every bar higher.',
    yLabel: '% of trades won',
    yFormat: 'pct',
    bars: [1, 2, 3].map((rr) => ({ label: `Win = ${rr}× loss`, segments: [{ label: 'Break-even win rate', value: 100 / (1 + rr), tone: 'chart1' as Tone }] })),
  },
  'expectancy-lines': {
    type: 'lines',
    title: 'Average outcome over many trades',
    desc: 'A line chart of the average path of a KES 100,000 account over 50 trades. Winning 40 percent of trades with wins twice the size of KES 1,000 losses averages plus KES 200 a trade and rises. Winning 70 percent with KES 400 wins and KES 1,000 losses averages minus KES 20 a trade and slowly falls. Winning half of equal KES 1,000 bets with a KES 100 fee each time averages minus KES 100 and falls fastest.',
    xLabel: 'Trades',
    yLabel: 'KES',
    yFormat: 'kes',
    series: [
      { label: '40% wins, win 2× loss', tone: 'chart1', points: range(51).map((n) => [n, 100000 + 200 * n] as [number, number]) },
      { label: '70% wins, small wins', tone: 'chart3', points: range(51).map((n) => [n, 100000 - 20 * n] as [number, number]) },
      { label: '50% wins, equal, with fees', tone: 'chart2', points: range(51).map((n) => [n, 100000 - 100 * n] as [number, number]) },
    ],
  },
  'drawdown-recovery': {
    type: 'bars',
    title: 'The gain needed to recover from a loss',
    desc: 'Four bars. After losing 10 percent you need about 11 percent to get back to even. After 25 percent, about 33 percent. After 50 percent, 100 percent. After 75 percent, 300 percent. Bigger losses get much harder to recover from.',
    yLabel: '% gain needed',
    yFormat: 'pct',
    bars: [10, 25, 50, 75].map((l) => ({ label: `Lose ${l}%`, segments: [{ label: 'Gain needed to recover', value: recoveryGainPct(l), tone: 'chart2' as Tone }] })),
  },
  'trading-plan-loop': {
    type: 'flow',
    title: 'A disciplined practice loop',
    desc: 'A flow from top to bottom. Write a plan before the trade: why, where you enter and where you exit. Size the position so a loss is small. Enter with a stop. Exit when the plan says, not on a feeling. Record it in a journal and review the plan, then start again.',
    nodes: [
      { label: 'Write the plan first', note: 'Why, entry, exit, stop' },
      { label: 'Size it small', note: 'A loss should not hurt much' },
      { label: 'Enter with a stop' },
      { label: 'Exit by the plan', note: 'Not by fear or hope' },
      { label: 'Journal and review', note: 'Then repeat' },
    ],
    edges: ['before money moves', 'one decision', 'let it run', 'learn'],
  },
  'replay-how': {
    type: 'flow',
    title: 'How the paper replay works',
    desc: 'A flow from top to bottom. A made-up market is generated from random moves, so there is nothing to predict. You start with KES 100,000 of paper money and see some history. Step forward one day at a time and choose to buy, sell or wait, with an optional stop. At the end you get a review that compares your result with simply holding.',
    nodes: [
      { label: 'A made-up market', note: 'Random moves, no hidden pattern' },
      { label: 'KES 100,000 paper money', note: 'Some history is shown first' },
      { label: 'Step day by day', note: 'Buy, sell or wait; optional stop' },
      { label: 'Session review', note: 'Compare with simply holding' },
    ],
    edges: ['start', 'decide', 'finish'],
  },
  'paper-vs-real': {
    type: 'compare',
    title: 'What paper trading can and cannot teach',
    desc: 'Two columns. Paper trading can teach: reading a chart, placing orders, sizing positions, using stops and keeping a journal. It cannot teach: how fear and greed feel with real money, real slippage and fees, or prove you have an edge, because results over a few sessions are mostly luck.',
    columns: [
      { heading: 'Paper can teach', tone: 'chart1', items: ['Reading charts', 'Placing orders', 'Sizing and stops', 'Keeping a journal'] },
      { heading: 'Paper cannot', tone: 'chart2', items: ['Real fear and greed', 'Real slippage', 'Prove you have an edge'] },
    ],
  },
  // ── Forex ────────────────────────────────────────────────
  'fx-market-size': {
    type: 'bars',
    title: 'How the size of the global currency market compares',
    desc: 'Two bars in trillions of US dollars traded per day. In April 2025 the global currency market averaged about 9.6 trillion dollars a day, according to the Bank for International Settlements survey; in April 2022 it was about 7.5 trillion. Most of this is banks, companies and funds, not individuals.',
    yLabel: 'USD trillions a day',
    yFormat: 'plain',
    bars: [
      { label: 'April 2022', segments: [{ label: 'Daily turnover', value: 7.5, tone: 'chart1' }] },
      { label: 'April 2025', segments: [{ label: 'Daily turnover', value: 9.6, tone: 'chart1' }] },
    ],
  },
  'currency-pair': {
    type: 'compare',
    title: 'Reading a currency pair',
    desc: 'Two columns explaining a made-up quote of EUR/USD 1.0850. The first currency, the euro, is the base: you are buying or selling one euro. The second, the US dollar, is the quote currency: 1.0850 dollars is the price of one euro. If the number rises, the euro has strengthened against the dollar.',
    columns: [
      { heading: 'Base: EUR (first)', tone: 'chart1', items: ['The thing being priced', '1 euro', 'Buy = bet it strengthens'] },
      { heading: 'Quote: USD (second)', tone: 'chart3', items: ['The money you pay in', '1.0850 dollars per euro', 'Sell = bet the euro weakens'] },
    ],
  },
  'pip-ladder': {
    type: 'ladder',
    title: 'Pips, using a made-up EUR/USD price',
    desc: 'A ladder of three made-up EUR/USD prices. At the bottom 1.0850. One pip up is 1.0851, a change in the fourth decimal place. Ten pips up is 1.0860. For pairs quoted against the Japanese yen, a pip is the second decimal place instead.',
    lowLabel: 'Lower price',
    highLabel: 'Higher price',
    rungs: [
      { label: '1.0850', note: 'Starting price' },
      { label: '1.0851', note: '+1 pip (fourth decimal place)' },
      { label: '1.0860', note: '+10 pips' },
    ],
  },
  'lot-sizes': {
    type: 'bars',
    title: 'Common lot sizes and the value of one pip',
    desc: 'Three bars showing roughly what one pip is worth in US dollars on EUR/USD for common trade sizes. A standard lot of 100,000 euros: about 10 dollars a pip. A mini lot of 10,000: about 1 dollar. A micro lot of 1,000: about 10 cents.',
    yLabel: 'USD per pip',
    yFormat: 'plain',
    bars: [
      { label: 'Standard (100,000)', segments: [{ label: 'USD per pip', value: 10, tone: 'chart1' }] },
      { label: 'Mini (10,000)', segments: [{ label: 'USD per pip', value: 1, tone: 'chart1' }] },
      { label: 'Micro (1,000)', segments: [{ label: 'USD per pip', value: 0.1, tone: 'chart1' }] },
    ],
  },
  'leverage-magnify': {
    type: 'bars',
    title: 'The same 1% move with different leverage',
    desc: 'Three bars for a KES 10,000 deposit and a 1 percent price move. With no leverage the gain or loss is KES 100. At 10 times leverage it is KES 1,000. At 100 times leverage it is KES 10,000 — the whole deposit.',
    yLabel: 'KES gained or lost',
    yFormat: 'kes',
    bars: [1, 10, 100].map((L) => ({ label: `${L}×`, segments: [{ label: 'Gain or loss on a 1% move', value: 100 * L, tone: (L === 100 ? 'chart2' : 'chart1') as Tone }] })),
  },
  'margin-call-flow': {
    type: 'flow',
    title: 'What happens when a leveraged trade goes wrong',
    desc: 'A flow from top to bottom. You deposit margin and open a leveraged position. The price moves against you and your losses eat into the margin. The broker warns you with a margin call to add money. If losses keep growing, the broker closes the position automatically, called a stop-out, and you keep whatever margin is left — sometimes nothing.',
    nodes: [
      { label: 'Deposit margin, open a big position' },
      { label: 'Price moves against you', note: 'Losses eat the margin' },
      { label: 'Margin call', note: 'Add money or reduce the trade' },
      { label: 'Stop-out', note: 'Broker closes it for you' },
    ],
    edges: ['leverage', 'warning', 'more losses'],
  },
  'cfd-loss-range': {
    type: 'bars',
    title: 'Share of retail CFD accounts that lost money (Europe, 2018)',
    desc: 'Two bars from the European Securities and Markets Authority 2018 review of retail trading in contracts for difference, which include most retail forex trading in Europe. Depending on the firm, between 74 and 89 percent of retail accounts lost money.',
    yLabel: '% of accounts',
    yFormat: 'pct',
    bars: [
      { label: 'Best firm', segments: [{ label: 'Lost money', value: 74, tone: 'chart2' }, { label: 'Did not lose', value: 26, tone: 'chart1' }] },
      { label: 'Worst firm', segments: [{ label: 'Lost money', value: 89, tone: 'chart2' }, { label: 'Did not lose', value: 11, tone: 'chart1' }] },
    ],
  },
  'forex-costs': {
    type: 'pyramid',
    title: 'Why most retail forex traders lose',
    desc: 'A pyramid of five layers, each making things harder. At the base, the market is close to random over short periods. Next, the spread and commission on every trade. Then overnight financing fees for holding positions. Then leverage, which magnifies losses. At the top, emotions such as chasing losses.',
    levels: [
      { label: 'Emotions', note: 'Chasing losses, overconfidence' },
      { label: 'Leverage', note: 'Small moves, big losses' },
      { label: 'Overnight fees', note: 'Charged for holding positions' },
      { label: 'Spread and commission', note: 'Paid on every trade' },
      { label: 'Short-term moves are mostly noise', note: 'Hard to predict' },
    ],
  },
  'forex-scam-signs': {
    type: 'compare',
    title: 'Forex red flags compared with signs of a licensed broker',
    desc: 'Two columns. Red flags: guaranteed daily returns, paid signal or copy-trading groups on WhatsApp or Telegram, someone offering to trade for you, pressure to deposit quickly, and withdrawals that are delayed. Signs of a licensed broker: listed on the CMA licensees portal, risk warnings shown clearly, client money kept separate, and no promises of profit.',
    columns: [
      { heading: 'Red flags', tone: 'chart2', items: ['Guaranteed returns', 'Paid signal groups', '“We trade for you”', 'Pressure to deposit', 'Slow withdrawals'] },
      { heading: 'Licensed broker signs', tone: 'chart1', items: ['On the CMA licensees portal', 'Clear risk warnings', 'Client money kept separate', 'No profit promises'] },
    ],
  },
  'check-broker-flow': {
    type: 'flow',
    title: 'Checking a forex broker before you deposit',
    desc: 'A flow from top to bottom. Search the CMA licensees portal for the exact company name. Make sure the website and contact details match the licensed firm, since scammers copy real names. Read the risk warning and the fees. If anything does not match, do not deposit, and report it to the CMA.',
    nodes: [
      { label: 'Search the CMA licensees portal', note: 'Exact company name' },
      { label: 'Match website and contacts', note: 'Scammers copy real names' },
      { label: 'Read risk warnings and fees' },
      { label: 'Anything off? Do not deposit', note: 'Report it to the CMA' },
    ],
    edges: ['found?', 'details match?', 'still unsure?'],
  },
  // ── Crypto ────────────────────────────────────────────────────────────────
  'blockchain-chain': {
    type: 'flow',
    title: 'How a blockchain records a payment',
    desc: 'A flow from top to bottom. Someone signs a payment with their private key. Computers on the network check that it is valid. Valid payments are grouped into a block. The block is linked to the one before it, so changing old records would mean redoing every later block. Thousands of computers keep a copy of the whole chain.',
    nodes: [
      { label: 'You sign a payment', note: 'With your private key' },
      { label: 'Network checks it', note: 'Is it valid? Is it spent?' },
      { label: 'Grouped into a block' },
      { label: 'Linked to earlier blocks', note: 'Hard to change history' },
      { label: 'Copies kept worldwide' },
    ],
    edges: ['broadcast', 'valid', 'added', 'shared'],
  },
  'crypto-types': {
    type: 'compare',
    title: 'Common kinds of crypto asset',
    desc: 'Three columns. Coins such as Bitcoin and Ether: run their own networks, prices swing widely, no company or government backs them. Stablecoins: aim to track a currency such as the US dollar, depend on the issuer holding enough reserves, and have broken their peg before. Other tokens and meme coins: thousands exist, many have little or no use, and many have gone to nearly zero.',
    columns: [
      { heading: 'Coins (e.g. Bitcoin)', tone: 'chart1', items: ['Own network', 'Big price swings', 'No one backs the value'] },
      { heading: 'Stablecoins', tone: 'chart3', items: ['Aim to track e.g. USD', 'Rely on the issuer’s reserves', 'Some have lost their peg'] },
      { heading: 'Tokens and meme coins', tone: 'chart2', items: ['Thousands exist', 'Often little real use', 'Many fall to near zero'] },
    ],
  },
  'crypto-swings': {
    type: 'lines',
    title: 'A made-up crypto price with boom and bust',
    desc: 'A line chart of a made-up crypto price over six years, starting at 100. It soars to about 900, crashes by more than 80 percent to about 150, climbs again to about 700, then falls by about 75 percent to about 170. The pattern is typical of crypto history, but the numbers are invented.',
    xLabel: 'Year',
    yLabel: 'Price',
    yFormat: 'plain',
    series: [
      {
        label: 'Made-up coin',
        tone: 'chart2',
        points: [[0, 100], [0.5, 250], [1, 600], [1.3, 900], [1.6, 450], [2, 180], [2.5, 150], [3, 220], [3.5, 400], [4, 700], [4.4, 520], [4.8, 260], [5.2, 170], [5.6, 210], [6, 240]],
      },
    ],
  },
  'crypto-risk-ladder': {
    type: 'ladder',
    title: 'Where crypto sits on the risk ladder',
    desc: 'A ladder from lower to higher risk. At the bottom, money market funds and Treasury bills. Then bonds. Then a broad share index fund. Then single shares. At the top, crypto assets, where falls of 70 percent or more have happened several times and some coins have gone to zero.',
    lowLabel: 'Lower risk',
    highLabel: 'Higher risk',
    rungs: [
      { label: 'MMFs and T-bills', note: 'Small, steady returns' },
      { label: 'Bonds', note: 'Prices move with rates' },
      { label: 'Share index funds', note: 'Can fall 30–50%' },
      { label: 'Single shares', note: 'One company can fail' },
      { label: 'Crypto assets', note: 'Falls of 70%+ and coins at zero' },
    ],
  },
  'custody-compare': {
    type: 'compare',
    title: 'Keeping crypto on an exchange compared with your own wallet',
    desc: 'Two columns. On an exchange: easy to use and you can recover a forgotten password, but the exchange holds the keys, so if it is hacked, freezes withdrawals or collapses, you may lose your coins. In your own wallet: you hold the keys and nobody can freeze them, but if you lose your recovery phrase or someone tricks you into sharing it, the coins are gone for good.',
    columns: [
      { heading: 'On an exchange', tone: 'chart3', items: ['Easy to use', 'Password can be reset', 'Exchange holds the keys', 'Hack or collapse risk'] },
      { heading: 'Your own wallet', tone: 'chart1', items: ['You hold the keys', 'Nobody can freeze it', 'Lose the phrase, lose it all', 'No one to call for help'] },
    ],
  },
  'keys-flow': {
    type: 'flow',
    title: 'Recovery phrase, private key and address',
    desc: 'A flow from top to bottom. A recovery phrase of 12 or 24 words creates your private keys. A private key signs payments and must stay secret. From it comes a public address, which is safe to share so people can pay you. Anyone with your recovery phrase controls all your coins.',
    nodes: [
      { label: 'Recovery phrase', note: '12 or 24 words — never share' },
      { label: 'Private key', note: 'Signs payments — secret' },
      { label: 'Public address', note: 'Safe to share to get paid' },
    ],
    edges: ['creates', 'gives'],
  },
  'kenya-crypto-regulators': {
    type: 'compare',
    title: 'Who oversees crypto businesses in Kenya',
    desc: 'Two columns, under the Virtual Asset Service Providers Act, 2025. The Central Bank of Kenya covers services such as virtual asset wallets, custody and payments. The Capital Markets Authority covers services such as virtual asset exchanges, investment advice and token offerings. Firms must be licensed before serving the public.',
    columns: [
      { heading: 'Central Bank of Kenya', tone: 'chart1', items: ['Wallets and custody', 'Payment services', 'Stablecoin issuers'] },
      { heading: 'Capital Markets Authority', tone: 'chart3', items: ['Exchanges and brokers', 'Investment advice', 'Token offerings'] },
    ],
  },
  'kenya-crypto-timeline': {
    type: 'flow',
    title: 'Crypto rules in Kenya over time',
    desc: 'Three milestones from top to bottom. In 2015 the Central Bank of Kenya warned that virtual currencies are not legal tender and are unregulated. In 2023 a 3 percent digital asset tax was introduced. In 2025 that tax was repealed, and the Virtual Asset Service Providers Act came into force in November 2025, bringing crypto businesses under licensing.',
    nodes: [
      { label: '2015: CBK warning', note: 'Not legal tender, unregulated' },
      { label: '2023: digital asset tax', note: '3% on transfers' },
      { label: '2025: VASP Act in force', note: 'Licensing; that tax repealed' },
    ],
    edges: ['8 years', '2 years'],
  },
  'crypto-scam-flow': {
    type: 'flow',
    title: 'How a typical crypto investment scam unfolds',
    desc: 'A flow from top to bottom. A friendly stranger or a fake celebrity post gets in touch online. They point you to an investment app or website that shows big profits. A small first withdrawal works, to build trust. You deposit more, sometimes borrowing. When you try to take out a large amount, you are told to pay a fee or tax first, and the money is never returned.',
    nodes: [
      { label: 'Friendly contact online', note: 'Social media, dating app, wrong number' },
      { label: 'Fake app shows profits' },
      { label: 'Small withdrawal works', note: 'To build trust' },
      { label: 'You deposit much more' },
      { label: '“Pay a fee to withdraw”', note: 'The money is gone' },
    ],
    edges: ['introduces', 'test', 'trust', 'blocked'],
  },
  'crypto-scam-signs': {
    type: 'compare',
    title: 'Crypto red flags compared with safer habits',
    desc: 'Two columns. Red flags: guaranteed or fixed daily returns, anyone asking for your recovery phrase, pressure to act fast, being asked to pay a fee before withdrawing, and celebrity endorsements on social media. Safer habits: check the firm is licensed in Kenya, never share your recovery phrase, start only with money you can afford to lose, and walk away from anything that rushes you.',
    columns: [
      { heading: 'Red flags', tone: 'chart2', items: ['Guaranteed returns', 'Asks for your recovery phrase', 'Pressure to act now', 'Fee to withdraw', 'Celebrity “endorsements”'] },
      { heading: 'Safer habits', tone: 'chart1', items: ['Check the licence', 'Never share your phrase', 'Only money you can lose', 'Walk away if rushed'] },
    ],
  },
} satisfies Record<string, DiagramSpec>;

export type DiagramId = keyof typeof DIAGRAMS;

export function getDiagram(id: DiagramId): DiagramSpec {
  return DIAGRAMS[id];
}

export function isDiagramId(id: string): id is DiagramId {
  return Object.prototype.hasOwnProperty.call(DIAGRAMS, id);
}
