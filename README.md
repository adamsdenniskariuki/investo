# Investo

**Learn to invest, step by step — starting with Kenyan markets.**
Live at **https://investo.madebyfavor.com**

Investo is a free, static web app with short, illustrated lessons, quick quizzes and calculators. It starts with the
basics (saving vs investing, compound interest, inflation, risk, fees, scams) and then covers how Kenyans can invest:
money market funds, Saccos, Treasury bills and bonds via CBK DhowCSD, NSE shares, REITs, pensions and tax at a conceptual
level.

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
| 1 | Investing basics | In progress |
| 2 | Investing in Kenya | In progress |
| 3 | Global stocks and ETFs from Kenya | Planned |
| 4 | Charts and trading with paper replay and risk tools | Planned |
| 5 | Forex | Planned |
| 6 | Crypto | Planned |

## Local development

Requires Node.js 20+ (CI uses 22).

```sh
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm test           # unit tests (Vitest), incl. WCAG AA contrast checks for every theme
npm run build      # production build to dist/
npm run preview    # serve dist/ on http://localhost:4173
```

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
