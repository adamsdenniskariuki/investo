# Investo

**Learn to invest, step by step — starting with Kenyan markets.**
Live at **https://investo.madebyfavor.com**

Investo is a free, static web app with short, illustrated lessons, quick quizzes and calculators. It starts with the
basics (saving vs investing, compound interest, inflation, risk, fees, scams) and then covers how Kenyans can invest:
money market funds, Saccos, Treasury bills and bonds via CBK DhowCSD, NSE shares, REITs, pensions and tax at a conceptual
level. Stage 3 adds global stocks and ETFs from Kenya: index funds, currency risk, foreign costs and taxes, and choosing a
platform safely. Stage 4 teaches charts and trading risk honestly: candlesticks, randomness, orders and spreads,
position sizing, win rate and reward/risk, drawdowns, and a paper replay on made-up markets — never real signals. Stage 5 explains forex: currency pairs, pips and lots,
leverage and margin (with a leverage calculator), why most retail traders lose, and how to check a CMA-licensed broker. Stage 6 covers crypto: what crypto assets are, volatility and crashes (with a crash
and recovery calculator), wallets and keys, Kenya's 2025 licensing law and tax at a high level, and common crypto scams.

There is no account and no server. Progress (XP, streaks, badges) stays in your browser, and you can export it to a JSON
file and import it on another device. The app works offline once loaded.

## ⚠️ Disclaimer

Investo is **educational only**. It is **not financial, investment, tax or legal advice**, does not recommend any
product, and never gives buy/sell signals or tips. Investo and its authors are **not licensed by the Capital Markets
Authority (CMA)** or any other regulator. Any money used in Investo is practice (paper) money.

Rates, tax rules, minimum amounts and procedures change. Numbers in lessons are illustrative examples with an “as of”
note; always confirm current details with the official source (CBK, CMA, NSE, KRA, RBA, NSSF, SASRA) and, for decisions
about your own money, a licensed professional.

## Roadmap

| Stage | Track | Status |
| ----- | ----- | ------ |
| 1 | Investing basics | Available |
| 2 | Investing in Kenya | Available |
| 3 | Global stocks and ETFs from Kenya | Available |
| 4 | Charts and trading with paper replay and risk tools | Available |
| 5 | Forex | Available |
| 6 | Crypto | Available |

## Local development

Requires Node.js 20+ (CI uses 22).

```sh
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm test           # unit tests (Vitest), incl. WCAG AA contrast checks for every theme
npm run build      # production build to dist/
npm run preview    # serve dist/ on http://localhost:4173
npx playwright install chromium   # once
npm run e2e        # Playwright end-to-end + axe accessibility sweep (mobile/tablet/desktop × light/dark)
```

`npm test` also regenerates [`docs/SOURCES.md`](docs/SOURCES.md) from the lessons; CI fails if it is out of date.

## Content rules

- Lessons live in `src/content/` (one file per track, e.g. `basics.ts`, `kenya.ts`, `global.ts`, `trading.ts`, `forex.ts`, `crypto.ts`); tracks and calculators in `tracks.ts`.
- **IDs are append-only.** Track, lesson, question, badge and tool IDs are listed in `src/content/ids.lock.ts`
  and a test fails if one disappears, so old backups keep working. Add new IDs; never rename or reuse old ones.
- Every lesson has 2–4 original SVG diagrams (`src/diagrams/specs.ts`), each with a title, description and caption.
  A test renders each one and checks it is accessible.
- Rates, limits and tax rules are written as dated examples (“as of …”) with links to official sources, and
  calculators only use numbers the learner types in.

## Stack

Vite + React + TypeScript, hand-built SVG diagrams and charts (no chart library), self-hosted fonts (Atkinson
Hyperlegible, Lexend, Literata), and a small hand-written service worker for offline use.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `dist/` to GitHub Pages
(Pages source: **GitHub Actions**). `public/CNAME` sets the custom domain. Pull requests run `.github/workflows/ci.yml`.

### DNS

On the `madebyfavor.com` DNS zone:

| Type  | Name      | Value                          |
| ----- | --------- | ------------------------------ |
| CNAME | `investo` | `adamsdenniskariuki.github.io` |

Once GitHub has issued the certificate, **Enforce HTTPS** is turned on in the repository’s Pages settings.

## Backup format

Progress is stored in the browser (`localStorage` key `investo:v1`). **Progress → Export backup** downloads
`investo-backup-YYYY-MM-DD.json`:

```json
{
  "app": "investo",
  "format": 1,
  "exportedAt": "2026-10-01T09:30:00.000Z",
  "progress": {
    "schema": 1,
    "xp": 145,
    "lessons": { "b01": { "completedAt": "…", "bestScore": 3, "total": 3, "attempts": 1, "rev": 1 } },
    "correct": { "b01-q1": "…" },
    "activeDays": ["2026-09-30", "2026-10-01"],
    "badges": { "first-step": "…" },
    "toolsUsed": { "compound": "…" },
    "lastExportAt": "…"
  },
  "settings": { "palette": "savanna", "mode": "system", "font": "atkinson", "textSize": "md" }
}
```

Import validates the file, drops unknown or malformed fields, and refuses backups from a newer `format`. Because
content IDs are append-only, a backup made today will still import after new lessons are added.
