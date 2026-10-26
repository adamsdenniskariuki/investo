import type { Lesson } from './types';
import { SRC } from './sources';

/**
 * Track 3 – Global stocks and ETFs, seen from Kenya. Lesson and question ids are append-only.
 * Tax rules and products change: present them as examples “as of” `reviewed` and link the official source.
 */
export const GLOBAL: Lesson[] = [
  {
    id: 'g01',
    rev: 1,
    title: 'Why look beyond Kenya?',
    summary: 'The NSE is one small market. Spreading across the world spreads your risk.',
    minutes: 5,
    steps: [
      {
        kind: 'text',
        heading: 'One market, a few big names',
        body: [
          'The Nairobi Securities Exchange lists about sixty companies, and a handful of large ones make up much of its total value. When those few companies have a bad year, the whole market feels it.',
          'Global stock markets list thousands of companies across many countries, industries and currencies. Owning a slice of many of them means no single company, country or currency decides your result.',
        ],
      },
      { kind: 'diagram', heading: 'Kenya alone vs the world', diagram: 'nse-vs-world', caption: 'Global markets add more companies, industries and currencies to choose from.' },
      {
        kind: 'text',
        heading: 'Home bias',
        body: [
          'Most people put nearly all their money in their home country because it feels familiar. That is called **home bias**. It is not wrong to invest at home, but your job, house and savings may already depend on Kenya’s economy.',
          'Adding some global investments can mean that a slowdown at home does not hit everything you own at once.',
        ],
      },
      { kind: 'diagram', heading: 'A spread-out mix', diagram: 'global-diversify', caption: 'One illustrative mix only — not a recommendation. The right mix depends on your goals and time horizon.' },
      {
        kind: 'callout',
        tone: 'warning',
        heading: 'Global is not risk-free',
        body: ['World markets can fall together, sometimes sharply, and currency moves add a second layer of ups and downs. Diversifying lowers the risk of one bad bet; it does not remove market risk.'],
      },
    ],
    quiz: [
      {
        id: 'g01-q1',
        prompt: 'What does “home bias” mean?',
        choices: ['Putting most of your money in your home country', 'Buying a home before investing', 'A tax on foreign investments', 'Preferring bonds over shares'],
        answer: 0,
        explanation: 'Home bias is the habit of investing mostly where you live, even when it concentrates risk.',
      },
      {
        id: 'g01-q2',
        prompt: 'Why might a Kenyan add global shares to their savings?',
        choices: ['Global shares are guaranteed to rise', 'To spread risk across more companies, countries and currencies', 'To avoid all taxes', 'Because the NSE is closing'],
        answer: 1,
        explanation: 'Spreading across many markets reduces the damage any one market can do.',
      },
      {
        id: 'g01-q3',
        prompt: 'Which statement about global diversification is true?',
        choices: ['It removes all risk', 'It means you never lose money', 'It lowers the risk of one bad bet, but world markets can still fall together', 'It only works with forex'],
        answer: 2,
        explanation: 'Diversification spreads specific risks; overall market falls still happen.',
      },
    ],
    sources: [SRC.nse, SRC.cma],
  },
  {
    id: 'g02',
    rev: 1,
    title: 'Shares, index funds and ETFs',
    summary: 'Buying one company versus buying a whole market in one go.',
    minutes: 6,
    steps: [
      {
        kind: 'text',
        heading: 'One company or many',
        body: [
          'Buying a **share** makes you a part-owner of one company. If that company struggles, your investment can fall a lot.',
          'An **index** is a list of companies chosen by fixed rules — for example, the largest companies in a country or in the world. An **index fund** simply buys the companies in the index, so you own a small slice of all of them.',
        ],
      },
      { kind: 'diagram', heading: 'One unit, many companies', diagram: 'index-basket', caption: 'An index fund or ETF bundles many shares into one thing you can buy.' },
      {
        kind: 'text',
        heading: 'What makes an ETF different',
        body: [
          'An **exchange-traded fund (ETF)** is a fund whose units are listed on a stock exchange. You buy and sell ETF units through a stockbroker during trading hours, at the market price, just like a share.',
          'A traditional unit trust is bought from, and sold back to, the fund manager, usually at a price worked out once a day.',
        ],
      },
      { kind: 'diagram', heading: 'ETF vs unit trust', diagram: 'etf-vs-mutual', caption: 'Both pool money. The main difference is how you buy and sell.' },
      {
        kind: 'list',
        heading: 'What to check in any fund',
        items: [
          'Which index or assets it follows, and how many holdings it has.',
          'The yearly fee (often called the expense ratio or total expense ratio).',
          'The currency it is priced in and the currency of what it owns.',
          'How easy it is to sell: for an ETF, how often it actually trades.',
        ],
      },
    ],
    quiz: [
      {
        id: 'g02-q1',
        prompt: 'What does an index fund do?',
        choices: ['Picks the shares a manager thinks will win', 'Buys the companies in an index, following fixed rules', 'Lends money to the government', 'Trades currencies'],
        answer: 1,
        explanation: 'An index fund tracks an index rather than trying to pick winners.',
      },
      {
        id: 'g02-q2',
        prompt: 'How do you usually buy ETF units?',
        choices: ['Directly from the central bank', 'Only from the fund manager once a day', 'At a Sacco', 'Through a stockbroker on a stock exchange'],
        answer: 3,
        explanation: 'ETF units are listed on an exchange and trade through brokers during market hours.',
      },
      {
        id: 'g02-q3',
        prompt: 'Why does a fund’s yearly fee matter?',
        choices: ['It is taken every year, so it compounds into a big cost over time', 'It is paid only once', 'It increases your return', 'It is refunded at the end'],
        answer: 0,
        explanation: 'Small yearly fees add up — see the fee drag lesson in Basics.',
      },
    ],
    sources: [SRC.secIndex, SRC.secEtf, SRC.nse],
  },
  {
    id: 'g03',
    rev: 1,
    title: 'Ways to invest globally from Kenya',
    summary: 'NSE-listed ETFs, global unit trusts and brokers — and the trade-offs of each.',
    minutes: 7,
    reviewed: '2026-10',
    steps: [
      {
        kind: 'text',
        heading: 'Several routes',
        body: [
          'There is more than one way to own global investments as a Kenyan. Some routes stay inside Kenya’s regulated system and are priced in shillings. Others send your money abroad.',
          'Kenya does not have general exchange controls, so moving money abroad to invest is usually allowed, but each route has its own costs, risks and protections.',
        ],
      },
      { kind: 'diagram', heading: 'From closer to home to further away', diagram: 'global-routes', caption: 'Routes nearer the bottom keep more Kenyan oversight; routes higher up offer more choice but less local protection.' },
      {
        kind: 'text',
        heading: 'Global ETFs listed on the NSE',
        body: [
          'Some ETFs listed on the NSE give exposure to assets outside Kenya. For example, a gold ETF has been listed since 2017, and in 2025 a **feeder ETF** tracking a world share index was announced for listing. These are examples to understand the idea — not recommendations.',
          'You buy them with a CDS account through a licensed stockbroker, in shillings, like any NSE share. Check the [NSE](https://www.nse.co.ke/) for what is currently listed.',
        ],
      },
      { kind: 'diagram', heading: 'How a feeder fund works', diagram: 'feeder-etf-flow', caption: 'A feeder fund invests in a bigger “master” fund abroad, which holds the actual shares.' },
      {
        kind: 'callout',
        tone: 'kenya',
        heading: 'Check before you send money',
        body: ['Local fund managers and stockbrokers should appear on the [CMA licensees portal](https://licensees.cma.or.ke/). A foreign broker is not regulated by CMA, so you depend on its home regulator and its rules if something goes wrong.'],
      },
    ],
    quiz: [
      {
        id: 'g03-q1',
        prompt: 'How would you usually buy an ETF listed on the NSE?',
        choices: ['Through DhowCSD', 'With a CDS account through a licensed stockbroker', 'Only through a foreign bank', 'From CBK'],
        answer: 1,
        explanation: 'NSE-listed ETFs trade like NSE shares, through a stockbroker and a CDS account.',
      },
      {
        id: 'g03-q2',
        prompt: 'What is a feeder fund?',
        choices: ['A fund that pays a monthly salary', 'A fund that only buys Kenyan shares', 'A Sacco product', 'A fund that invests in a larger “master” fund'],
        answer: 3,
        explanation: 'A feeder fund collects money locally and invests it in a master fund that holds the assets.',
      },
      {
        id: 'g03-q3',
        prompt: 'You open an account with a foreign online broker. Who regulates it?',
        choices: ['Its home-country regulator, not CMA', 'CMA', 'NSSF', 'The NSE'],
        answer: 0,
        explanation: 'CMA regulates firms it licenses in Kenya. A foreign broker answers to its own regulator.',
      },
    ],
    sources: [SRC.nseSatrix, SRC.nse, SRC.cmaLicensees, SRC.cbk],
  },
  {
    id: 'g04',
    rev: 1,
    title: 'Currency risk',
    summary: 'Your return in shillings depends on the investment and on the exchange rate.',
    minutes: 6,
    steps: [
      {
        kind: 'text',
        heading: 'Two returns in one',
        body: [
          'When you own something priced in US dollars, your result in shillings has two parts: how the investment did in dollars, and how the dollar moved against the shilling.',
          'If the dollar **strengthens** (one dollar buys more shillings), your dollar assets are worth more shillings. If it **weakens**, they are worth fewer.',
        ],
      },
      { kind: 'diagram', heading: 'Same investment, three currency outcomes', diagram: 'fx-return-bars', caption: 'An 8% gain in dollars can become more or less than 8% in shillings.' },
      {
        kind: 'text',
        heading: 'The simple formula',
        body: ['Return in shillings = (1 + return in dollars) × (1 + change in the dollar against the shilling) − 1. For example, 8% in dollars with the dollar up 5% gives about 13.4% in shillings.'],
      },
      { kind: 'diagram', heading: 'It can help or hurt', diagram: 'currency-two-ways', caption: 'Nobody can reliably predict exchange rates. Currency moves add both upside and downside.' },
      { kind: 'tool', heading: 'Try it: currency and return', tool: 'fx-return', intro: 'Enter a return and a currency change to see what you would have in shillings. CBK publishes daily exchange rates.' },
    ],
    quiz: [
      {
        id: 'g04-q1',
        prompt: 'Your US investment rises 10% in dollars, and the dollar weakens against the shilling. In shillings, your return is…',
        choices: ['Exactly 10%', 'More than 10%', 'Less than 10%', 'Always negative'],
        answer: 2,
        explanation: 'A weaker dollar means your dollar assets convert into fewer shillings.',
      },
      {
        id: 'g04-q2',
        prompt: 'What does it mean when “the dollar strengthens” against the shilling?',
        choices: ['One dollar buys more shillings', 'One dollar buys fewer shillings', 'Interest rates rise', 'Shares become cheaper'],
        answer: 0,
        explanation: 'A stronger dollar is worth more shillings per dollar.',
      },
      {
        id: 'g04-q3',
        prompt: 'Which is the most honest view of currency moves?',
        choices: ['The shilling always weakens, so foreign assets always win', 'Experts can predict them reliably', 'They only matter for forex traders', 'They add uncertainty in both directions'],
        answer: 3,
        explanation: 'Exchange rates are hard to predict and can move either way.',
      },
    ],
    sources: [SRC.cbkFx, SRC.cbk],
  },
  {
    id: 'g05',
    rev: 1,
    title: 'Costs and taxes abroad',
    summary: 'Conversion fees, fund fees and foreign withholding tax can eat into returns.',
    minutes: 7,
    reviewed: '2026-10',
    steps: [
      {
        kind: 'text',
        heading: 'Layers of cost',
        body: [
          'Investing abroad often adds costs you do not see at home: converting shillings to dollars, sending money, broker commissions, fund fees and sometimes account or inactivity fees.',
          'Each looks small on its own. Together, and repeated, they can take a real bite out of your return.',
        ],
      },
      { kind: 'diagram', heading: 'Where money leaks', diagram: 'global-cost-stack', caption: 'Ask for every fee in writing before you open an account.' },
      {
        kind: 'text',
        heading: 'US dividend withholding tax',
        body: [
          'When a US company pays a dividend to a foreign investor, US tax is usually withheld before you receive it. Kenya does not have a tax treaty with the US, so as of our last check (2026-10) the standard US rate of **30%** generally applies to Kenyan residents. Your broker normally asks you to fill in IRS **Form W-8BEN** to confirm you are not a US person.',
          'The US generally does not tax non-residents on gains from selling ordinary shares, but rules have exceptions. Kenya may also tax foreign income — check with [KRA](https://www.kra.go.ke/) or a qualified tax adviser.',
        ],
      },
      { kind: 'diagram', heading: 'Where a US dividend goes', diagram: 'us-dividend-wht', caption: 'Illustrative only, using the 30% rate as of 2026-10. Check the current rules before relying on them.' },
      {
        kind: 'callout',
        tone: 'warning',
        heading: 'US estate tax',
        body: ['The IRS says non-residents who hold more than USD 60,000 of US assets (including US shares) when they die may have to file a US estate tax return, and estate tax may be due. Some people use funds domiciled outside the US partly for this reason. Get professional advice if this could apply to you.'],
      },
    ],
    quiz: [
      {
        id: 'g05-q1',
        prompt: 'What is IRS Form W-8BEN used for?',
        choices: ['Opening a CDS account', 'Confirming to a US broker that you are not a US person', 'Paying Kenyan income tax', 'Registering a Sacco'],
        answer: 1,
        explanation: 'The W-8BEN certifies foreign status so the right US withholding applies.',
      },
      {
        id: 'g05-q2',
        prompt: 'As of 2026-10, roughly how much US tax is usually withheld from a US dividend paid to a Kenyan resident?',
        choices: ['0%', '5%', '15%', '30%'],
        answer: 3,
        explanation: 'With no Kenya–US tax treaty, the standard 30% rate generally applies. Rules can change.',
      },
      {
        id: 'g05-q3',
        prompt: 'Why can many small fees matter a lot?',
        choices: ['They add up and repeat, reducing what compounds', 'They are always refunded', 'They only apply in Kenya', 'They make returns guaranteed'],
        answer: 0,
        explanation: 'Every fee comes out of the money that would otherwise keep growing.',
      },
    ],
    sources: [SRC.irsW8, SRC.irsEstate, SRC.kra],
  },
  {
    id: 'g06',
    rev: 1,
    title: 'Choosing a platform safely',
    summary: 'Who holds your investments, who regulates the platform, and the red flags.',
    minutes: 6,
    steps: [
      {
        kind: 'text',
        heading: 'Who is holding your money?',
        body: [
          'A good platform keeps your investments in your name and separate from its own money, usually with an independent **custodian**. If the platform fails, your assets should not be used to pay its debts.',
          'Before you sign up, find out which company you are actually contracting with, where it is based and which regulator supervises it.',
        ],
      },
      { kind: 'diagram', heading: 'The custody chain', diagram: 'custody-chain', caption: 'Each link should be a regulated firm you can look up.' },
      { kind: 'diagram', heading: 'Green flags and red flags', diagram: 'platform-checklist', caption: 'One red flag is a reason to stop and check.' },
      {
        kind: 'list',
        heading: 'How to check',
        items: [
          'Kenyan firms: search the [CMA licensees portal](https://licensees.cma.or.ke/).',
          'US brokers: look them up on [FINRA BrokerCheck](https://brokercheck.finra.org/).',
          'Other countries: use the home regulator’s public register, and compare the exact company name and website.',
          'Start small, and test a withdrawal before adding more.',
        ],
      },
      {
        kind: 'callout',
        tone: 'warning',
        heading: 'Social-media “global trading” apps',
        body: ['Be very careful of apps or agents promoted on WhatsApp, Telegram or social media that promise fixed daily or weekly returns on “US stocks”. Real investments do not guarantee returns.'],
      },
    ],
    quiz: [
      {
        id: 'g06-q1',
        prompt: 'What does a custodian do?',
        choices: ['Gives stock tips', 'Sets exchange rates', 'Holds investors’ assets separately from the platform’s own money', 'Guarantees returns'],
        answer: 2,
        explanation: 'Independent custody helps protect your assets if the platform gets into trouble.',
      },
      {
        id: 'g06-q2',
        prompt: 'An app promises 2% a week on US shares, guaranteed. What should you do?',
        choices: ['Invest a little to test it', 'Treat it as a red flag and check the regulator', 'Invest more for higher returns', 'Share it with friends'],
        answer: 1,
        explanation: 'Guaranteed high returns are a classic scam sign.',
      },
      {
        id: 'g06-q3',
        prompt: 'Where can you check whether a Kenyan stockbroker or fund manager is licensed?',
        choices: ['The CMA licensees portal', 'A WhatsApp group', 'The broker’s own adverts', 'Any search result'],
        answer: 0,
        explanation: 'Use the regulator’s own register, not the firm’s marketing.',
      },
    ],
    sources: [SRC.cmaLicensees, SRC.finra, SRC.cma],
  },
];
