import { bondPrice, compoundGrowth, purchasingPower, type GrowthPoint } from '../lib/finance';

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

export type DiagramBody =
  | { type: 'lines'; xLabel: string; yLabel: string; yFormat: ValueFormat; xFormat?: ValueFormat; series: LineSeries[] }
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
} satisfies Record<string, DiagramSpec>;

export type DiagramId = keyof typeof DIAGRAMS;

export function getDiagram(id: DiagramId): DiagramSpec {
  return DIAGRAMS[id];
}

export function isDiagramId(id: string): id is DiagramId {
  return Object.prototype.hasOwnProperty.call(DIAGRAMS, id);
}
