import type { Lesson } from './types';
import { SRC } from './sources';

/**
 * Track 6 – Crypto. Teaching only: what crypto assets are, the risks, custody, Kenyan rules and scams.
 * No coin picks, price predictions or exchange recommendations. Lesson and question ids are append-only.
 */
export const CRYPTO: Lesson[] = [
  {
    id: 'c01',
    rev: 1,
    title: 'What crypto assets are',
    summary: 'Blockchains, coins, stablecoins and tokens in plain words.',
    minutes: 6,
    steps: [
      {
        kind: 'text',
        heading: 'Digital tokens on a shared record',
        body: [
          'A **crypto asset** is a digital token recorded on a **blockchain** — a shared record of payments kept by many computers around the world instead of one bank.',
          'New payments are checked by the network, grouped into blocks and linked to earlier blocks. That makes old records very hard to change, but it does not make the token valuable. Its price is simply what buyers will pay.',
        ],
      },
      { kind: 'diagram', heading: 'How a payment is recorded', diagram: 'blockchain-chain', caption: 'A simplified picture. Different networks check payments in different ways.' },
      {
        kind: 'text',
        heading: 'Not all crypto is the same',
        body: [
          'Coins such as Bitcoin run their own networks. **Stablecoins** try to hold a steady value, such as one US dollar, by keeping reserves — they are only as safe as those reserves and the issuer. Thousands of other tokens and “meme coins” exist, and many have little real use.',
          'Unlike a share, a coin usually gives you no part of a business, no profits and no vote. Unlike a bond, it pays no interest by itself.',
        ],
      },
      { kind: 'diagram', heading: 'Kinds of crypto asset', diagram: 'crypto-types', caption: 'Broad groups only. Each project has its own design and risks.' },
      {
        kind: 'callout',
        tone: 'kenya',
        heading: 'Not legal tender',
        body: ['The Central Bank of Kenya has warned since 2015 that virtual currencies such as Bitcoin are not legal tender in Kenya. Shops do not have to accept them, and the shilling remains the currency.'],
      },
    ],
    quiz: [
      {
        id: 'c01-q1',
        prompt: 'What is a blockchain?',
        choices: ['A type of bank account', 'A shared record of payments kept by many computers', 'A government bond', 'A stock exchange'],
        answer: 1,
        explanation: 'A blockchain is a shared, hard-to-change record maintained by a network of computers.',
      },
      {
        id: 'c01-q2',
        prompt: 'What does a stablecoin depend on to hold its value?',
        choices: ['Nothing — it can never change', 'The NSE', 'The issuer holding enough reserves', 'Mining more coins'],
        answer: 2,
        explanation: 'A stablecoin is only as stable as the reserves and the firm behind it; some have lost their peg.',
      },
      {
        id: 'c01-q3',
        prompt: 'How is a coin like Bitcoin different from a share?',
        choices: ['It usually gives you no part of a business or its profits', 'It pays a fixed dividend', 'It is guaranteed by the CBK', 'There is no difference'],
        answer: 0,
        explanation: 'A share is part-ownership of a company; most coins carry no such claim.',
      },
    ],
    sources: [SRC.cbkBitcoin, SRC.esasCrypto],
  },
  {
    id: 'c02',
    rev: 1,
    title: 'Volatility and crashes',
    summary: 'Why crypto prices swing so much, and the maths of falling 70%.',
    minutes: 7,
    steps: [
      {
        kind: 'text',
        heading: 'Big swings in both directions',
        body: [
          'Crypto prices can double in months and halve in weeks. Large coins have fallen more than 70% from their peaks more than once, and many smaller tokens have gone to nearly zero and never come back.',
          'Prices are driven mostly by sentiment, news and borrowed money, not by profits or interest. European regulators have warned that consumers could lose **all** the money they put in.',
        ],
      },
      { kind: 'diagram', heading: 'A boom-and-bust pattern', diagram: 'crypto-swings', caption: 'A made-up price that follows a pattern common in crypto history.' },
      {
        kind: 'text',
        heading: 'Falls are harder to climb out of',
        body: [
          'After a 70% fall, KES 10,000 becomes KES 3,000. Getting back to KES 10,000 needs a gain of about 233% — not 70%. The deeper the fall, the steeper the climb, and there is no rule that says a price must recover.',
        ],
      },
      { kind: 'tool', heading: 'Try it: crash and recovery', tool: 'crash', intro: 'Pick a fall and a guess at the yearly growth afterwards to see how long recovery could take.' },
      { kind: 'diagram', heading: 'Where crypto sits on the risk ladder', diagram: 'crypto-risk-ladder', caption: 'Crypto sits above single shares on the ladder.' },
      {
        kind: 'callout',
        tone: 'warning',
        heading: 'Only money you can afford to lose',
        body: ['If you choose to buy crypto, keep it to a small amount you could lose completely without hurting your emergency fund, rent or school fees — and never borrow to buy it.'],
      },
    ],
    quiz: [
      {
        id: 'c02-q1',
        prompt: 'A holding falls 70%. What gain is needed to get back to where it started?',
        choices: ['70%', 'About 100%', '30%', 'About 233%'],
        answer: 3,
        explanation: 'After a 70% fall only 30% is left; it must more than triple (about +233%) to recover.',
      },
      {
        id: 'c02-q2',
        prompt: 'What mostly drives crypto prices?',
        choices: ['Company profits', 'Sentiment, news and borrowed money', 'Fixed interest payments', 'CBK rate decisions only'],
        answer: 1,
        explanation: 'Without profits or interest, prices move largely on demand and sentiment.',
      },
      {
        id: 'c02-q3',
        prompt: 'Which money should never be used to buy crypto?',
        choices: ['Your emergency fund or borrowed money', 'A small amount you could lose', 'Paper money in a simulator', 'None — any money is fine'],
        answer: 0,
        explanation: 'Emergency savings and loans should never be put into something that can fall to zero.',
      },
    ],
    sources: [SRC.esasCrypto, SRC.cbkBitcoin],
  },
  {
    id: 'c03',
    rev: 1,
    title: 'Wallets, keys and custody',
    summary: 'Who really controls your coins, and how they get lost or stolen.',
    minutes: 6,
    steps: [
      {
        kind: 'text',
        heading: 'Keys, not coins',
        body: [
          'Your coins live on the blockchain. What you hold is a **private key** that lets you move them. Most wallets create keys from a **recovery phrase** of 12 or 24 words.',
          'Anyone who has your recovery phrase controls your coins, and blockchain payments usually cannot be reversed. No real wallet, exchange or support agent will ever ask for it.',
        ],
      },
      { kind: 'diagram', heading: 'Phrase, key and address', diagram: 'keys-flow', caption: 'Share your address to get paid. Never share the phrase or key.' },
      {
        kind: 'text',
        heading: 'Exchange or your own wallet?',
        body: [
          'If you leave coins on an exchange, the exchange holds the keys. That is convenient, but exchanges have been hacked, frozen withdrawals and collapsed, leaving customers waiting years or losing everything.',
          'Holding your own keys removes that risk but adds another: lose the phrase, or get tricked into sharing it, and nobody can help you.',
        ],
      },
      { kind: 'diagram', heading: 'Two ways to hold crypto', diagram: 'custody-compare', caption: 'Each choice swaps one risk for another.' },
    ],
    quiz: [
      {
        id: 'c03-q1',
        prompt: 'Someone from “wallet support” asks for your 12-word recovery phrase. What should you do?',
        choices: ['Send it so they can help', 'Send only half of it', 'Refuse — it is a scam; real support never asks', 'Post it publicly'],
        answer: 2,
        explanation: 'Whoever has the phrase controls the coins. Real support never asks for it.',
      },
      {
        id: 'c03-q2',
        prompt: 'What is safe to share so people can send you crypto?',
        choices: ['Your private key', 'Your recovery phrase', 'Your exchange password', 'Your public address'],
        answer: 3,
        explanation: 'The public address is for receiving payments; keys and phrases must stay secret.',
      },
      {
        id: 'c03-q3',
        prompt: 'What is a risk of keeping coins on an exchange?',
        choices: ['The exchange holds the keys and could be hacked or collapse', 'You cannot see the price', 'The coins earn too much interest', 'There is none'],
        answer: 0,
        explanation: 'With custody comes counterparty risk: if the exchange fails, your coins may be lost.',
      },
    ],
    sources: [SRC.esasCrypto, SRC.cbkVasp],
  },
  {
    id: 'c04',
    rev: 1,
    title: 'Crypto rules and tax in Kenya',
    summary: 'The 2025 licensing law, who supervises what, and tax at a glance.',
    minutes: 6,
    reviewed: '2026-10',
    steps: [
      {
        kind: 'text',
        heading: 'A licensing law since 2025',
        body: [
          'For years crypto in Kenya was largely unregulated. The **Virtual Asset Service Providers Act, 2025** came into force in November 2025. It requires businesses that offer crypto services to the public — such as exchanges, wallets and brokers — to be licensed.',
          'Supervision is split. Broadly, the Central Bank of Kenya covers services close to payments and custody, and the Capital Markets Authority covers exchanges, brokers, advice and token offerings. Detailed regulations are still being rolled out, so check the regulators’ websites.',
        ],
      },
      { kind: 'diagram', heading: 'Who supervises what', diagram: 'kenya-crypto-regulators', caption: 'A simplified summary of the 2025 Act, as of our 2026-10 review.' },
      {
        kind: 'text',
        heading: 'Tax at a conceptual level',
        body: [
          'Tax rules for crypto have changed several times. A 3% digital asset tax was introduced in 2023 and repealed in 2025; fees charged by crypto service providers now attract excise duty instead. Gains may also be taxable.',
          'As of our 2026-10 review, check the current position with the Kenya Revenue Authority or a qualified tax adviser rather than relying on any app or social media post.',
        ],
      },
      { kind: 'diagram', heading: 'How the rules changed', diagram: 'kenya-crypto-timeline', caption: 'Key milestones only, as of our 2026-10 review.' },
      {
        kind: 'callout',
        tone: 'warning',
        heading: 'A licence is not a guarantee',
        body: ['Licensing means a firm is supervised and has rules to follow. It does not stop crypto prices falling, and it does not make any coin a good investment.'],
      },
    ],
    quiz: [
      {
        id: 'c04-q1',
        prompt: 'What does the Virtual Asset Service Providers Act, 2025 mainly do?',
        choices: ['Bans all crypto in Kenya', 'Makes Bitcoin legal tender', 'Guarantees crypto prices', 'Requires crypto service businesses to be licensed'],
        answer: 3,
        explanation: 'The Act brings exchanges, wallets and similar businesses under licensing and supervision.',
      },
      {
        id: 'c04-q2',
        prompt: 'Which regulator broadly covers crypto exchanges and brokers under the 2025 Act?',
        choices: ['The Capital Markets Authority', 'The Kenya Revenue Authority', 'NSSF', 'The NSE'],
        answer: 0,
        explanation: 'Exchanges, brokers and advice sit broadly with the CMA; payments and custody with the CBK.',
      },
      {
        id: 'c04-q3',
        prompt: 'Where should you check how crypto is taxed today?',
        choices: ['A Telegram group', 'Whatever an exchange advert says', 'The Kenya Revenue Authority or a qualified tax adviser', 'Tax never applies to crypto'],
        answer: 2,
        explanation: 'Crypto tax rules have changed often; check the official source.',
      },
    ],
    sources: [SRC.vaspAct, SRC.cbkVasp, SRC.cma, SRC.kra, SRC.cbkBitcoin],
  },
  {
    id: 'c05',
    rev: 1,
    title: 'Crypto scams',
    summary: 'Fake platforms, romance scams and “recovery” tricks — and how to spot them.',
    minutes: 6,
    steps: [
      {
        kind: 'text',
        heading: 'Why scammers love crypto',
        body: [
          'Crypto payments are fast, cross borders easily and usually cannot be reversed. That makes them a favourite of scammers.',
          'A common pattern starts with a friendly message — on social media, a dating app or a “wrong number” text. The new friend introduces an investment app that shows fast profits. A small withdrawal works, so you put in more. When you try to take out a large amount, you are told to pay a “fee” or “tax” first. The money never comes back.',
        ],
      },
      { kind: 'diagram', heading: 'How the scam unfolds', diagram: 'crypto-scam-flow', caption: 'The early “profits” are just numbers on a fake screen.' },
      {
        kind: 'text',
        heading: 'Other common tricks',
        body: [
          'Fake celebrity endorsements and giveaways (“send 1 coin, get 2 back”), pyramid schemes that pay you for recruiting, fake exchanges that copy real names, and messages asking you to “verify” your wallet by typing in your recovery phrase.',
        ],
      },
      { kind: 'diagram', heading: 'Red flags and safer habits', diagram: 'crypto-scam-signs', caption: 'One red flag is enough reason to stop.' },
      {
        kind: 'callout',
        tone: 'warning',
        heading: 'If it happens to you',
        body: ['Stop paying, keep all messages and transaction records, and report it to the police and the relevant regulator. Beware of “recovery agents” who promise to get your crypto back for a fee — they are usually a second scam.'],
      },
    ],
    quiz: [
      {
        id: 'c05-q1',
        prompt: 'An investment app says you must pay a “tax” before you can withdraw your profits. What is most likely happening?',
        choices: ['A normal KRA procedure', 'A scam — the profits are not real', 'A licensed fund’s standard fee', 'A bank error'],
        answer: 1,
        explanation: 'Being asked to pay before you can withdraw is a hallmark of a fake platform.',
      },
      {
        id: 'c05-q2',
        prompt: 'Why are crypto payments attractive to scammers?',
        choices: ['They are always insured', 'They are easy to reverse', 'They are fast, cross borders and usually cannot be reversed', 'The CBK refunds them'],
        answer: 2,
        explanation: 'Irreversible, cross-border payments make it hard for victims to get money back.',
      },
      {
        id: 'c05-q3',
        prompt: 'Someone offers to recover your lost crypto for an upfront fee. What should you assume?',
        choices: ['It is a good deal', 'They work for the CBK', 'It is guaranteed', 'It is probably another scam'],
        answer: 3,
        explanation: 'Fake “recovery” services often target people who have already lost money.',
      },
    ],
    sources: [SRC.cmaScams, SRC.esasCrypto, SRC.cbkBitcoin],
  },
];
