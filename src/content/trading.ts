import type { Lesson } from './types';
import { SRC } from './sources';

/**
 * Track 4 – Charts and paper trading. Teaching only: paper money, made-up markets, no signals or tips.
 * Lesson and question ids are append-only. Market rules change: quote them “as of” `reviewed` with a source.
 */
export const TRADING: Lesson[] = [
  {
    id: 't01',
    rev: 1,
    title: 'Investing vs trading',
    summary: 'Owning businesses for years is a different game from betting on short-term price moves.',
    minutes: 6,
    reviewed: '2026-10',
    steps: [
      {
        kind: 'text',
        heading: 'Two different games',
        body: [
          '**Investing** means owning shares, bonds or funds for years. Your return comes mostly from businesses growing, paying dividends and paying interest. You make few decisions and pay few fees.',
          '**Trading** means buying and selling over days, hours or minutes, hoping to profit from price moves. Every trade has a cost, and someone on the other side of each trade is often a professional with better tools and information.',
        ],
      },
      { kind: 'diagram', heading: 'Side by side', diagram: 'invest-vs-trade', caption: 'Investing earns from growth and income; trading only earns if you predict price moves better than others, after costs.' },
      {
        kind: 'text',
        heading: 'What the research shows',
        body: [
          'Large studies of real trading records find that most short-term traders lose money. A study of everyone who day traded Brazilian equity index futures for more than 300 days between 2013 and 2015 found that about **97%** lost money, and only about 1% earned more than the minimum wage.',
          'A study of day traders in Taiwan found that fewer than 1% earned predictable profits after fees, year after year. Results like these are the reason regulators warn that day trading is very risky.',
        ],
      },
      { kind: 'diagram', heading: 'One study, in one picture', diagram: 'day-trader-results', caption: 'Figures from one published study (as of our 2026-10 review). Other markets and periods differ, but the pattern is similar.' },
      {
        kind: 'callout',
        tone: 'warning',
        heading: 'Why this track exists',
        body: [
          'This track teaches how charts, orders and risk work so you can spot hype and protect yourself. It uses paper money and made-up markets only. It will never tell you what to buy or sell.',
        ],
      },
    ],
    quiz: [
      {
        id: 't01-q1',
        prompt: 'Where does most of a long-term investor’s return come from?',
        choices: ['Guessing daily price moves', 'Businesses growing and paying dividends and interest', 'Trading signals', 'Leverage'],
        answer: 1,
        explanation: 'Long-term investors earn mainly from growth and income, not from timing price moves.',
      },
      {
        id: 't01-q2',
        prompt: 'In the Brazilian study of people who day traded for over 300 days, roughly what share lost money?',
        choices: ['About 10%', 'About 50%', 'About 75%', 'About 97%'],
        answer: 3,
        explanation: 'About 97% of those persistent day traders lost money.',
      },
      {
        id: 't01-q3',
        prompt: 'Why do costs matter more for traders than for long-term investors?',
        choices: ['Traders pay costs on every one of many trades', 'Investors pay no fees at all', 'Costs only apply to bonds', 'Traders are exempt from taxes'],
        answer: 0,
        explanation: 'Frequent trading multiplies fees and spreads, which eat into any gains.',
      },
    ],
    sources: [SRC.dayTradingBrazil, SRC.dayTradingTaiwan, SRC.secDayTrading],
  },
  {
    id: 't02',
    rev: 1,
    title: 'Reading a candlestick chart',
    summary: 'Open, high, low and close — four prices in one shape.',
    minutes: 5,
    steps: [
      {
        kind: 'text',
        heading: 'Four prices per day',
        body: [
          'A price chart often shows one **candle** for each day (or hour, or minute). Each candle packs in four prices: where the price **opened**, the **highest** and **lowest** it reached, and where it **closed**.',
          'The thick part is the **body**, between the open and the close. The thin lines above and below are **wicks** (or shadows), reaching to the high and the low.',
        ],
      },
      { kind: 'diagram', heading: 'Anatomy of a candle', diagram: 'candle-anatomy', caption: 'In Investo, up candles are hollow and down candles are filled, so you can tell them apart without colour.' },
      {
        kind: 'text',
        heading: 'Reading a row of candles',
        body: [
          'A long body means the price moved a lot between open and close. A long upper wick means the price went up during the day but fell back before the close. A long lower wick means it dipped and then recovered.',
          'Candles describe what **already happened**. They do not tell you what will happen next.',
        ],
      },
      { kind: 'diagram', heading: 'A short made-up history', diagram: 'candles-sample', caption: 'Made-up prices. Try describing each day in words before reading the description.' },
    ],
    quiz: [
      {
        id: 't02-q1',
        prompt: 'Which four prices does a candle show?',
        choices: ['Bid, ask, spread and volume', 'Open, high, low and close', 'Dividend, yield, price and fee', 'Buy, sell, stop and limit'],
        answer: 1,
        explanation: 'Each candle shows the open, high, low and close for its period.',
      },
      {
        id: 't02-q2',
        prompt: 'In Investo’s charts, a hollow candle means…',
        choices: ['The market was closed', 'The price closed lower than it opened', 'The price closed higher than it opened', 'Nobody traded'],
        answer: 2,
        explanation: 'Hollow candles closed above their open; filled candles closed below it.',
      },
      {
        id: 't02-q3',
        prompt: 'A long upper wick shows that…',
        choices: ['The price rose during the period but fell back before the close', 'The company paid a dividend', 'The price will rise tomorrow', 'Trading was halted'],
        answer: 0,
        explanation: 'The wick shows the high was well above where the price ended. It describes the past, not the future.',
      },
    ],
    sources: [SRC.nse, SRC.secDayTrading],
  },
  {
    id: 't03',
    rev: 1,
    title: 'Patterns, trends and randomness',
    summary: 'Pure chance can draw convincing trends. Be careful what you read into a chart.',
    minutes: 6,
    steps: [
      {
        kind: 'text',
        heading: 'Chance draws pictures',
        body: [
          'The chart below was made with random numbers — like flipping a coin each day to decide whether the price goes up or down. Nothing about it can be predicted.',
          'Yet it shows “uptrends”, “downtrends”, “support” and “breakouts”. Our brains are built to find patterns, even in noise.',
        ],
      },
      { kind: 'diagram', heading: 'Three random paths', diagram: 'random-walks', caption: 'All three start at 100 and are pure chance. Any trend you see was not planned.' },
      {
        kind: 'text',
        heading: 'Why patterns fool us',
        body: [
          'If you look at enough charts, some patterns will appear to have “worked” just by luck. We tend to remember the times a pattern worked and forget the times it failed.',
          'Rules built to fit past prices can look brilliant on old data and then fail on new data. This is called **overfitting**. Anyone selling a “system” that never loses is likely showing you only the good part.',
        ],
      },
      { kind: 'diagram', heading: 'What it looks like vs what may be true', diagram: 'pattern-traps', caption: 'A healthy dose of doubt protects your money.' },
      {
        kind: 'callout',
        tone: 'tip',
        heading: 'A useful habit',
        body: ['Before believing a chart pattern, ask: how often did it fail? Who is telling me this, and do they earn money if I trade?'],
      },
    ],
    quiz: [
      {
        id: 't03-q1',
        prompt: 'A chart made only from random moves can still show…',
        choices: ['Nothing at all', 'Only straight lines', 'Guaranteed profits', 'What look like trends and breakouts'],
        answer: 3,
        explanation: 'Random paths often look like they have trends, which is why charts can fool us.',
      },
      {
        id: 't03-q2',
        prompt: 'What is “overfitting”?',
        choices: ['Buying too many shares', 'A rule tuned so closely to past prices that it fails on new prices', 'Paying too much in fees', 'A type of stop order'],
        answer: 1,
        explanation: 'An overfitted rule explains the past perfectly and the future poorly.',
      },
      {
        id: 't03-q3',
        prompt: 'Someone shows you a trading system that “never loses”. What is most likely?',
        choices: ['They are only showing the trades that worked', 'It is a government product', 'It will make you rich', 'It is regulated by the CMA'],
        answer: 0,
        explanation: 'Real trading always includes losses. A perfect record is a red flag.',
      },
    ],
    sources: [SRC.secDayTrading, SRC.cmaScams],
  },
  {
    id: 't04',
    rev: 1,
    title: 'Orders, spreads and market hours',
    summary: 'How a buy or sell order actually gets filled, and what it costs.',
    minutes: 6,
    reviewed: '2026-10',
    steps: [
      {
        kind: 'text',
        heading: 'Common order types',
        body: [
          'A **market order** buys or sells straight away at the best price available. It fills quickly, but you do not control the exact price.',
          'A **limit order** sets the highest price you will pay (or lowest you will accept). You control the price, but the order may never fill.',
          'A **stop order** (often called a stop-loss) becomes a market order once the price reaches a level you choose. In a fast fall, it can fill well below that level.',
        ],
      },
      { kind: 'diagram', heading: 'Market, limit and stop', diagram: 'order-types', caption: 'Each order type trades off speed against control of the price.' },
      {
        kind: 'text',
        heading: 'The spread is a hidden cost',
        body: [
          'At any moment there is a **bid** (the best price a buyer will pay) and an **ask** (the best price a seller will take). The gap is the **spread**. If you buy and then sell straight away, you lose the spread, plus fees.',
          'Shares that trade rarely tend to have wider spreads. On a thinly traded share, the spread can cost more than the brokerage fee.',
        ],
      },
      { kind: 'diagram', heading: 'Bid, ask and spread', diagram: 'bid-ask-spread', caption: 'Made-up prices. The spread is paid every time you go in and out.' },
      {
        kind: 'callout',
        tone: 'kenya',
        heading: 'On the NSE',
        body: [
          'As of our 2026-10 review, NSE equity trading runs on weekdays from 09:30 to 15:00 East Africa Time, and most shares cannot move more than about 10% up or down from the previous close in one day. Check the NSE website for the current rules, which can change.',
          'You place orders through a CMA-licensed stockbroker, and trades settle into your CDS account a few days later.',
        ],
      },
    ],
    quiz: [
      {
        id: 't04-q1',
        prompt: 'Which order lets you set the exact worst price you will accept?',
        choices: ['Market order', 'Stop order', 'Limit order', 'Any order'],
        answer: 2,
        explanation: 'A limit order sets your price, but may not fill.',
      },
      {
        id: 't04-q2',
        prompt: 'The bid is KES 49.90 and the ask is KES 50.10. What is the spread?',
        choices: ['KES 0.20', 'KES 50.00', 'KES 0.10', 'KES 100.00'],
        answer: 0,
        explanation: 'The spread is the ask minus the bid: 50.10 − 49.90 = 0.20.',
      },
      {
        id: 't04-q3',
        prompt: 'Why can a stop-loss sell below its stop price?',
        choices: ['Brokers always add a penalty', 'Stops only work on bonds', 'It is a type of limit order', 'If the price gaps or falls fast, the next available price may be lower'],
        answer: 3,
        explanation: 'A stop becomes a market order; in a gap or fast fall the fill can be worse than the stop level.',
      },
    ],
    sources: [SRC.nse, SRC.secOrders, SRC.cmaLicensees],
  },
  {
    id: 't05',
    rev: 1,
    title: 'Position sizing: risk a small slice',
    summary: 'Decide how much you could lose before deciding how much to buy.',
    minutes: 6,
    steps: [
      {
        kind: 'text',
        heading: 'Start with the loss, not the gain',
        body: [
          'Every trade can lose. Careful traders first decide the **most** they are willing to lose on one trade — often a small percentage of the account — and work out the size from that.',
          'Losses come in streaks. Risking a small slice keeps a bad run from wiping you out.',
        ],
      },
      { kind: 'diagram', heading: 'Ten losses in a row', diagram: 'risk-per-trade', caption: 'Starting from KES 100,000 of practice money. A losing streak is far less damaging at a small risk per trade.' },
      {
        kind: 'text',
        heading: 'The simple formula',
        body: [
          'Position size = amount you will risk ÷ distance from your entry price to your stop price.',
          'For example, risking KES 1,000 with a stop KES 2 below your entry gives 500 shares. If the stop is hit, you lose about KES 1,000 plus fees — unless the price gaps past your stop.',
        ],
      },
      { kind: 'diagram', heading: 'Working it out', diagram: 'position-size-flow', caption: 'The stop decides the size, not the other way round.' },
      { kind: 'tool', heading: 'Try it: position size', tool: 'position-size', intro: 'Enter a practice account, how much you would risk and where your stop is.' },
    ],
    quiz: [
      {
        id: 't05-q1',
        prompt: 'You risk KES 2,000 and your stop is KES 4 below your entry. How many shares?',
        choices: ['50', '200', '500', '8,000'],
        answer: 2,
        explanation: '2,000 ÷ 4 = 500 shares.',
      },
      {
        id: 't05-q2',
        prompt: 'Why risk only a small slice of the account on each trade?',
        choices: ['It guarantees profit', 'Losing streaks happen, and small risks keep you in the game', 'Brokers require it by law', 'It removes fees'],
        answer: 1,
        explanation: 'A run of losses is normal; small position sizes limit the damage.',
      },
      {
        id: 't05-q3',
        prompt: 'What should be decided first?',
        choices: ['How much profit you want', 'How many shares look nice', 'Which tip to follow', 'The most you are willing to lose and where your stop is'],
        answer: 3,
        explanation: 'The risk amount and stop determine the size.',
      },
    ],
    sources: [SRC.secOrders, SRC.secDayTrading],
  },
  {
    id: 't06',
    rev: 1,
    title: 'Win rate, reward and risk',
    summary: 'Winning often is not enough — how much you win and lose matters too.',
    minutes: 7,
    steps: [
      {
        kind: 'text',
        heading: 'Two numbers, not one',
        body: [
          'Your **win rate** is the share of trades that make money. Your **reward-to-risk** compares the size of an average win with an average loss.',
          'You can win most of your trades and still lose money if the losses are much bigger than the wins. You can lose most trades and still come out ahead if the wins are much bigger — before costs.',
        ],
      },
      { kind: 'diagram', heading: 'Break-even win rates', diagram: 'breakeven-win-rate', caption: 'Bigger wins relative to losses lower the win rate you need — but fees raise it again.' },
      {
        kind: 'text',
        heading: 'Expectancy',
        body: [
          'The **expectancy** is the average result per trade: (win rate × average win) − (loss rate × average loss) − fees.',
          'If it is negative, more trades only make things worse. Your real win rate and average sizes are hard to know — a few dozen trades are mostly luck.',
        ],
      },
      { kind: 'diagram', heading: 'Averages over many trades', diagram: 'expectancy-lines', caption: 'Average paths only. Real accounts swing up and down around these lines.' },
      { kind: 'tool', heading: 'Try it: win rate and reward/risk', tool: 'risk-reward', intro: 'Enter your guesses and see the average result per trade, before and after fees.' },
    ],
    quiz: [
      {
        id: 't06-q1',
        prompt: 'If wins and losses are the same size and there are no fees, what win rate breaks even?',
        choices: ['25%', '33%', '50%', '75%'],
        answer: 2,
        explanation: 'With equal sizes you need to win half of your trades to break even.',
      },
      {
        id: 't06-q2',
        prompt: 'You win 70% of trades but your average loss is much bigger than your average win. What can happen?',
        choices: ['You can still lose money overall', 'You must make money', 'Fees disappear', 'Your win rate rises to 100%'],
        answer: 0,
        explanation: 'A high win rate does not help if the losses are larger than the wins.',
      },
      {
        id: 't06-q3',
        prompt: 'What do fees do to the break-even win rate?',
        choices: ['Lower it', 'Nothing', 'Make it zero', 'Raise it'],
        answer: 3,
        explanation: 'Fees are paid on every trade, so you need to win more often to break even.',
      },
    ],
    sources: [SRC.secDayTrading, SRC.dayTradingTaiwan],
  },
  {
    id: 't07',
    rev: 1,
    title: 'Drawdowns and discipline',
    summary: 'Big losses are hard to climb back from. A plan helps you avoid them.',
    minutes: 6,
    steps: [
      {
        kind: 'text',
        heading: 'The maths of losses',
        body: [
          'A **drawdown** is a fall from a peak. Recovering from one takes a bigger percentage gain than the loss itself: lose 50% and you need to double your money just to get back to where you started.',
          'That is why protecting against big losses matters more than chasing big gains.',
        ],
      },
      { kind: 'diagram', heading: 'Losses vs the gain needed to recover', diagram: 'drawdown-recovery', caption: 'The deeper the hole, the steeper the climb.' },
      {
        kind: 'text',
        heading: 'Emotions push us to break rules',
        body: [
          'After a loss, people often take bigger risks to “win it back”. After a win, they feel invincible. Both can lead to large losses.',
          'A written plan, made before money moves, helps. So does a journal: record why you entered, how you felt and what happened, then review it.',
        ],
      },
      { kind: 'diagram', heading: 'A practice loop', diagram: 'trading-plan-loop', caption: 'Plan, size, act, review — every time.' },
      {
        kind: 'callout',
        tone: 'warning',
        heading: 'Never trade money you need',
        body: ['Rent, school fees, your emergency fund and loan money should never be used for trading. If trading is affecting your sleep, relationships or bills, stop and talk to someone you trust.'],
      },
    ],
    quiz: [
      {
        id: 't07-q1',
        prompt: 'After a 50% loss, what gain do you need to get back to even?',
        choices: ['50%', '75%', '100%', '25%'],
        answer: 2,
        explanation: 'Half of your money has to double to return to the start: a 100% gain.',
      },
      {
        id: 't07-q2',
        prompt: 'What is a drawdown?',
        choices: ['A fall in account value from a previous peak', 'A cash withdrawal', 'A type of bond', 'A broker’s fee'],
        answer: 0,
        explanation: 'A drawdown measures how far value has fallen from its high point.',
      },
      {
        id: 't07-q3',
        prompt: 'Which habit helps most with discipline?',
        choices: ['Doubling the size after a loss', 'Following tips from social media', 'Trading with rent money', 'Writing a plan before the trade and keeping a journal'],
        answer: 3,
        explanation: 'Plans and journals reduce emotional decisions.',
      },
    ],
    sources: [SRC.secDayTrading, SRC.cmaScams],
  },
  {
    id: 't08',
    rev: 1,
    title: 'Practise with the paper replay',
    summary: 'Try buying, selling and stops on a made-up market, then review honestly.',
    minutes: 10,
    steps: [
      {
        kind: 'text',
        heading: 'A safe place to practise',
        body: [
          'The paper replay gives you KES 100,000 of pretend money and a made-up market built from random moves. You step forward one day at a time and decide whether to buy, sell or wait.',
          'Because the market is random, there is nothing to predict. That is the point: notice how fees, stops and position size change your result even when skill cannot help.',
        ],
      },
      { kind: 'diagram', heading: 'How the replay works', diagram: 'replay-how', caption: 'Made-up market, paper money, honest review.' },
      { kind: 'tool', heading: 'Try it: paper replay', tool: 'replay', intro: 'Pick a market and a fee level. Use Next day to step forward, and finish the session to see your review.' },
      {
        kind: 'text',
        heading: 'Reading your review',
        body: [
          'Compare your result with simply holding from the first day. Look at the fees you paid and the largest fall from a peak. Then try a different market, or a higher fee, and see how much changes.',
          'A good or bad session on paper says very little about real skill. Real money adds fear, greed and real costs.',
        ],
      },
      { kind: 'diagram', heading: 'What paper can and cannot teach', diagram: 'paper-vs-real', caption: 'Paper trading builds understanding, not proof of an edge.' },
    ],
    quiz: [
      {
        id: 't08-q1',
        prompt: 'Why does the replay use a made-up random market?',
        choices: ['To hide a secret pattern', 'So that results show the effect of fees, stops and sizing, not prediction', 'Because real markets are closed', 'To give trading signals'],
        answer: 1,
        explanation: 'With nothing to predict, you can see clearly what costs and risk choices do.',
      },
      {
        id: 't08-q2',
        prompt: 'You made money in two paper sessions. What does that prove?',
        choices: ['You have a proven edge', 'You should trade with your savings', 'Very little — a few sessions are mostly luck', 'Fees do not matter'],
        answer: 2,
        explanation: 'Short records are dominated by chance.',
      },
      {
        id: 't08-q3',
        prompt: 'What can paper trading NOT teach well?',
        choices: ['How orders work', 'How to size a position', 'How to keep a journal', 'How fear and greed feel with real money'],
        answer: 3,
        explanation: 'Emotions with real money are hard to simulate.',
      },
    ],
    sources: [SRC.secDayTrading, SRC.secOrders],
  },
];
