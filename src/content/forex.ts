import type { Lesson } from './types';
import { SRC } from './sources';

/**
 * Track 5 – Forex. Teaching only: how currency trading works and why it is so risky. No signals or broker picks.
 * Lesson and question ids are append-only. Rules and figures change: quote them “as of” `reviewed` with a source.
 */
export const FOREX: Lesson[] = [
  {
    id: 'f01',
    rev: 1,
    title: 'How the currency market works',
    summary: 'The biggest market in the world, and why that does not make it easy.',
    minutes: 6,
    reviewed: '2026-10',
    steps: [
      {
        kind: 'text',
        heading: 'A huge, mostly professional market',
        body: [
          'The foreign exchange (forex or FX) market is where currencies are swapped. Banks, companies, governments and investment funds use it every day to pay for imports, invest abroad and manage risk.',
          'As of the Bank for International Settlements survey published in 2025, about **USD 9.6 trillion** changed hands on an average day in April 2025. Nearly all of that is professionals. Retail traders are a tiny part of the market.',
        ],
      },
      { kind: 'diagram', heading: 'The size of the market', diagram: 'fx-market-size', caption: 'BIS survey figures, as of our 2026-10 review. The next survey is due in 2028.' },
      {
        kind: 'text',
        heading: 'Prices come in pairs',
        body: [
          'Currencies are always quoted against each other, such as EUR/USD or USD/KES. The first is the **base** currency; the second is the **quote** currency. The price tells you how much of the quote currency buys one unit of the base.',
          'Retail “forex trading” usually means betting on whether that price will rise or fall, through an online broker, without ever holding the actual currency.',
        ],
      },
      { kind: 'diagram', heading: 'Reading a pair', diagram: 'currency-pair', caption: 'A made-up EUR/USD price, for illustration only.' },
      {
        kind: 'callout',
        tone: 'kenya',
        heading: 'Changing money is not the same as trading',
        body: ['Buying dollars to pay school fees abroad or to invest in a global fund is a currency exchange. Forex trading is short-term speculation on price moves, usually with borrowed money. They carry very different risks.'],
      },
    ],
    quiz: [
      {
        id: 'f01-q1',
        prompt: 'Who does most of the trading in the currency market?',
        choices: ['Individual traders on phones', 'Banks, companies, governments and funds', 'Saccos', 'The NSE'],
        answer: 1,
        explanation: 'The market is dominated by professional institutions; retail traders are a small part.',
      },
      {
        id: 'f01-q2',
        prompt: 'In the pair EUR/USD, which is the base currency?',
        choices: ['USD', 'Both equally', 'Neither', 'EUR'],
        answer: 3,
        explanation: 'The first currency in a pair is the base.',
      },
      {
        id: 'f01-q3',
        prompt: 'What does retail “forex trading” usually involve?',
        choices: ['Betting on short-term price moves through an online broker', 'Opening a dollar savings account', 'Buying Treasury bills', 'Paying for imports'],
        answer: 0,
        explanation: 'Retail forex trading is speculation on price changes, usually with leverage.',
      },
    ],
    sources: [SRC.bisFx, SRC.cbkFx],
  },
  {
    id: 'f02',
    rev: 1,
    title: 'Pips, lots and spreads',
    summary: 'The units forex prices move in, and what each move is worth.',
    minutes: 6,
    steps: [
      {
        kind: 'text',
        heading: 'Pips',
        body: [
          'Currency prices move in tiny steps. A **pip** is usually the fourth decimal place — EUR/USD moving from 1.0850 to 1.0851 is a one-pip move. For pairs quoted against the Japanese yen, a pip is the second decimal place.',
          'Many brokers also show a fifth decimal, sometimes called a pipette or fractional pip.',
        ],
      },
      { kind: 'diagram', heading: 'Counting pips', diagram: 'pip-ladder', caption: 'Made-up prices. One pip is a very small change in the exchange rate.' },
      {
        kind: 'text',
        heading: 'Lots and pip value',
        body: [
          'Trades are sized in **lots**. A standard lot is 100,000 units of the base currency, a mini lot 10,000 and a micro lot 1,000.',
          'Because positions are so large, a tiny pip is worth real money. On EUR/USD, one pip on a standard lot is worth about USD 10. A 50-pip move against you on one standard lot is roughly a USD 500 loss.',
        ],
      },
      { kind: 'diagram', heading: 'What one pip is worth', diagram: 'lot-sizes', caption: 'Approximate values for EUR/USD. Other pairs differ.' },
      {
        kind: 'text',
        heading: 'The spread',
        body: [
          'Like shares, every currency pair has a bid and an ask. The gap, measured in pips, is the **spread**. You pay it every time you open and close a trade. Spreads usually widen at quiet times and around big news, just when prices jump most.',
        ],
      },
    ],
    quiz: [
      {
        id: 'f02-q1',
        prompt: 'EUR/USD moves from 1.0850 to 1.0860. How many pips is that?',
        choices: ['1', '100', '10', '0.1'],
        answer: 2,
        explanation: 'The fourth decimal place moved by 10, so it is a 10-pip move.',
      },
      {
        id: 'f02-q2',
        prompt: 'How many units of the base currency are in a standard lot?',
        choices: ['1,000', '10,000', '1,000,000', '100,000'],
        answer: 3,
        explanation: 'A standard lot is 100,000 units; mini and micro lots are smaller.',
      },
      {
        id: 'f02-q3',
        prompt: 'When do spreads often widen?',
        choices: ['At quiet times and around big news', 'Only on weekends when markets are closed', 'Never — spreads are fixed by law', 'Only for micro lots'],
        answer: 0,
        explanation: 'Spreads tend to widen when there are fewer buyers and sellers or prices are jumping.',
      },
    ],
    sources: [SRC.cmaForexRegs, SRC.secOrders],
  },
  {
    id: 'f03',
    rev: 1,
    title: 'Leverage and margin',
    summary: 'Borrowed exposure makes small moves into big gains — and big losses.',
    minutes: 7,
    reviewed: '2026-10',
    steps: [
      {
        kind: 'text',
        heading: 'Controlling more than you have',
        body: [
          '**Leverage** lets you open a position much larger than your deposit. At 100 times leverage, KES 10,000 of **margin** controls a position worth KES 1,000,000.',
          'Profits and losses are worked out on the full position, not your deposit. So a price move of just 1% against you loses KES 10,000 — all of your margin.',
        ],
      },
      { kind: 'diagram', heading: 'One move, three leverage levels', diagram: 'leverage-magnify', caption: 'The price move is the same; only the leverage changes.' },
      {
        kind: 'text',
        heading: 'Margin calls and stop-outs',
        body: [
          'When losses eat into your margin, the broker issues a **margin call** asking you to add money. If losses keep growing, the broker closes your positions automatically — a **stop-out**.',
          'In fast markets, prices can jump past the stop-out level. Some regulators require brokers to stop retail accounts going below zero; check what your broker’s rules say.',
        ],
      },
      { kind: 'diagram', heading: 'When a trade goes wrong', diagram: 'margin-call-flow', caption: 'Leverage turns ordinary price moves into account-ending losses.' },
      { kind: 'tool', heading: 'Try it: leverage and margin', tool: 'leverage', intro: 'Change the leverage and the price move to see how quickly a deposit can disappear.' },
      {
        kind: 'callout',
        tone: 'warning',
        heading: 'Limits differ by country',
        body: [
          'As of our 2026-10 review, European regulators cap retail leverage on major currency pairs at 30 times. Kenya’s 2017 online forex regulations also set leverage limits, which are higher. Offshore brokers may offer 500 times or more. Higher leverage only means you can lose faster.',
        ],
      },
    ],
    quiz: [
      {
        id: 'f03-q1',
        prompt: 'At 50 times leverage, what price move against you wipes out your margin?',
        choices: ['50%', '2%', '5%', '0.5%'],
        answer: 1,
        explanation: '100 ÷ 50 = 2%. A 2% move against a 50× position equals the whole deposit.',
      },
      {
        id: 'f03-q2',
        prompt: 'What is a margin call?',
        choices: ['A broker asking you to add money because losses are eating your margin', 'A bonus for profitable traders', 'A phone call offering trading signals', 'A type of savings account'],
        answer: 0,
        explanation: 'A margin call warns that your margin is running low.',
      },
      {
        id: 'f03-q3',
        prompt: 'What does higher leverage do?',
        choices: ['Reduces risk', 'Guarantees profit', 'Removes the spread', 'Makes both gains and losses bigger for the same price move'],
        answer: 3,
        explanation: 'Leverage magnifies both directions — losses included.',
      },
    ],
    sources: [SRC.cmaForexRegs, SRC.esmaCfd],
  },
  {
    id: 'f04',
    rev: 1,
    title: 'Why most retail forex traders lose',
    summary: 'The evidence, and the costs stacked against short-term currency bets.',
    minutes: 6,
    reviewed: '2026-10',
    steps: [
      {
        kind: 'text',
        heading: 'What regulators found',
        body: [
          'When the European Securities and Markets Authority reviewed retail trading in contracts for difference (CFDs) — the product most retail forex trading uses — it found that **74% to 89%** of retail accounts lost money, depending on the firm.',
          'Many brokers are now required to show their own figure, such as “72% of retail investor accounts lose money”, on their websites. Look for it.',
        ],
      },
      { kind: 'diagram', heading: 'The evidence', diagram: 'cfd-loss-range', caption: 'From ESMA’s 2018 review, as of our 2026-10 review. Figures vary by firm and year.' },
      {
        kind: 'text',
        heading: 'Costs stacked on costs',
        body: [
          'Short-term currency moves are very hard to predict. On top of that, you pay the spread on every trade, and usually an overnight financing fee (a “swap”) for positions held past the end of the day.',
          'Leverage turns ordinary noise into large losses, and losing streaks tempt people to trade bigger to win it back.',
        ],
      },
      { kind: 'diagram', heading: 'What a trader is up against', diagram: 'forex-costs', caption: 'Each layer makes long-run profit less likely.' },
    ],
    quiz: [
      {
        id: 'f04-q1',
        prompt: 'In ESMA’s review, what share of retail CFD accounts lost money?',
        choices: ['About 10% to 20%', 'About 30% to 40%', 'About 74% to 89%', 'Almost none'],
        answer: 2,
        explanation: 'ESMA found that 74–89% of retail accounts lost money, depending on the firm.',
      },
      {
        id: 'f04-q2',
        prompt: 'What is an overnight financing fee (swap)?',
        choices: ['A charge for holding a leveraged position past the end of the day', 'A free bonus', 'A government tax refund', 'The price of a micro lot'],
        answer: 0,
        explanation: 'Holding positions overnight usually costs a financing charge.',
      },
      {
        id: 'f04-q3',
        prompt: 'Why do losing streaks often get worse?',
        choices: ['Brokers raise prices for losers', 'Spreads disappear', 'Leverage is removed', 'People trade bigger to win back losses'],
        answer: 3,
        explanation: 'Chasing losses with bigger trades is a common, costly mistake.',
      },
    ],
    sources: [SRC.esmaCfd, SRC.secDayTrading],
  },
  {
    id: 'f05',
    rev: 1,
    title: 'Licensed brokers and forex scams in Kenya',
    summary: 'How to check a broker, and the warning signs of a forex scam.',
    minutes: 6,
    reviewed: '2026-10',
    steps: [
      {
        kind: 'text',
        heading: 'Licensing in Kenya',
        body: [
          'In Kenya, online forex brokers serving the public must be licensed by the **Capital Markets Authority (CMA)** under the Capital Markets (Online Foreign Exchange Trading) Regulations, 2017. Among other things, the rules require client money to be kept separate from the broker’s own money.',
          'You can search the CMA licensees portal for the exact company name. Being licensed does not make trading safe or profitable — it means the firm is supervised and you have somewhere to complain.',
        ],
      },
      { kind: 'diagram', heading: 'Before you deposit', diagram: 'check-broker-flow', caption: 'Check the exact name on the CMA portal, and that the contact details match.' },
      {
        kind: 'text',
        heading: 'Common forex scams',
        body: [
          'Many forex scams in Kenya start on WhatsApp, Telegram, TikTok or Instagram. Typical patterns include paid **signal groups**, “account managers” who offer to trade your money for a share of profits, and schemes that promise fixed daily or weekly returns.',
          'Screenshots of big profits and luxury lifestyles are easy to fake. If someone promises a guaranteed return from forex, it is a red flag — legitimate trading has no guarantees.',
        ],
      },
      { kind: 'diagram', heading: 'Red flags vs licensed broker signs', diagram: 'forex-scam-signs', caption: 'A single red flag is enough reason to walk away.' },
      {
        kind: 'callout',
        tone: 'warning',
        heading: 'If you have been targeted',
        body: ['Stop sending money, keep records of messages and payments, and report it to the CMA and the police. Be wary of “recovery” services that ask for a fee to get your money back — these are often scams too.'],
      },
    ],
    quiz: [
      {
        id: 'f05-q1',
        prompt: 'Which body licenses online forex brokers in Kenya?',
        choices: ['The Capital Markets Authority (CMA)', 'The Kenya Revenue Authority (KRA)', 'The NSE', 'A Telegram group admin'],
        answer: 0,
        explanation: 'The CMA licenses online forex brokers under the 2017 regulations.',
      },
      {
        id: 'f05-q2',
        prompt: 'A stranger offers to trade your money and promises 10% a week. What is this?',
        choices: ['A normal investment', 'A government bond', 'A classic red flag for a scam', 'A licensed fund'],
        answer: 2,
        explanation: 'Guaranteed returns and “we trade for you” offers are classic warning signs.',
      },
      {
        id: 'f05-q3',
        prompt: 'What does a CMA licence tell you?',
        choices: ['Profits are guaranteed', 'Losses are impossible', 'The broker gives free signals', 'The firm is supervised, but trading can still lose money'],
        answer: 3,
        explanation: 'Licensing adds oversight and protections; it does not remove market risk.',
      },
    ],
    sources: [SRC.cmaForexRegs, SRC.cmaLicensees, SRC.cmaScams],
  },
];
