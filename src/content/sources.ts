import type { Source } from './types';

/** Official sources used across lessons. Prefer these over secondary sites. */
export const SRC = {
  cbk: { label: 'Central Bank of Kenya (CBK)', url: 'https://www.centralbank.go.ke/' },
  cbkSecurities: { label: 'CBK – Government securities', url: 'https://www.centralbank.go.ke/securities/' },
  dhowcsd: { label: 'CBK DhowCSD portal', url: 'https://dhowcsd.centralbank.go.ke/' },
  cbkBanks: { label: 'CBK – Directory of licensed banks and payment providers', url: 'https://www.centralbank.go.ke/bank-supervision/' },
  cma: { label: 'Capital Markets Authority (CMA)', url: 'https://www.cma.or.ke/' },
  cmaLicensees: { label: 'CMA – Licensees and approved schemes portal', url: 'https://licensees.cma.or.ke/' },
  nse: { label: 'Nairobi Securities Exchange (NSE)', url: 'https://www.nse.co.ke/' },
  cdsc: { label: 'Central Depository & Settlement Corporation (CDSC)', url: 'https://www.cdsckenya.com/' },
  kra: { label: 'Kenya Revenue Authority (KRA)', url: 'https://www.kra.go.ke/' },
  rba: { label: 'Retirement Benefits Authority (RBA)', url: 'https://www.rba.go.ke/' },
  rbaTax: {
    label: 'RBA – Tax Laws (Amendment) Act 2024 and the retirement sector',
    url: 'https://www.rba.go.ke/the-tax-laws-amendment-act-2024-a-detailed-analysis-of-the-amendments-benefiting-the-retirement-benefits-sector/',
  },
  nssf: { label: 'National Social Security Fund (NSSF)', url: 'https://www.nssf.or.ke/' },
  sasra: { label: 'Sacco Societies Regulatory Authority (SASRA)', url: 'https://www.sasra.go.ke/' },
  kdic: { label: 'Kenya Deposit Insurance Corporation (KDIC)', url: 'https://www.kdic.go.ke/' },
  knbs: { label: 'Kenya National Bureau of Statistics (KNBS) – inflation (CPI)', url: 'https://www.knbs.or.ke/' },
  cbkFx: { label: 'CBK – Foreign exchange rates', url: 'https://www.centralbank.go.ke/rates/forex-exchange-rates/' },
  nseSatrix: {
    label: 'NSE – Satrix MSCI World Feeder ETF listing announcement',
    url: 'https://www.nse.co.ke/wp-content/uploads/Investors-on-Kenyas-securities-exchange-will-soon-get-access-to-trade-global-markets-as-Satrix-lists-MSCI-World-Feeder-ETF-on-the-NSE.pdf',
  },
  secEtf: { label: 'US SEC Investor.gov – Exchange-traded fund (ETF)', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/exchange-traded-fund-etf' },
  secIndex: { label: 'US SEC Investor.gov – Index fund', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/index-fund' },
  irsW8: { label: 'IRS – About Form W-8BEN', url: 'https://www.irs.gov/forms-pubs/about-form-w-8-ben' },
  irsEstate: {
    label: 'IRS – Some nonresidents with US assets must file estate tax returns',
    url: 'https://www.irs.gov/individuals/international-taxpayers/some-nonresidents-with-us-assets-must-file-estate-tax-returns',
  },
  finra: { label: 'FINRA BrokerCheck (US brokers)', url: 'https://brokercheck.finra.org/' },
  cmaForexRegs: {
    label: 'CMA – Capital Markets (Online Foreign Exchange Trading) Regulations, 2017',
    url: 'https://www.cma.or.ke/wpfd_file/capital-markets-online-foreign-exchange-trading-regulations-2017/',
  },
  cmaScams: { label: 'CMA – Public caution against investment scams', url: 'https://www.cma.or.ke/public-caution-against-investment-scams/' },
  esmaCfd: {
    label: 'ESMA – Restrictions on CFDs for retail investors (2018)',
    url: 'https://www.esma.europa.eu/press-news/esma-news/esma-agrees-prohibit-binary-options-and-restrict-cfds-protect-retail-investors',
  },
  bisFx: { label: 'BIS – Triennial Central Bank Survey of foreign exchange markets (2025)', url: 'https://www.bis.org/statistics/rpfx25.htm' },
  vaspAct: { label: 'Kenya Law – Virtual Asset Service Providers Act, 2025', url: 'https://new.kenyalaw.org/akn/ke/act/2025/20/eng@2025-11-04' },
  cbkVasp: {
    label: 'CBK – Public notice on the Virtual Asset Service Providers Act, 2025',
    url: 'https://www.centralbank.go.ke/uploads/press_releases/665231223_Public%20Notice%20on%20the%20Virtual%20Assets%20Service%20Providers%20Act%202025.pdf',
  },
  cbkBitcoin: {
    label: 'CBK – Public notice on virtual currencies such as Bitcoin (2015)',
    url: 'https://www.centralbank.go.ke/images/docs/media/Public_Notice_on_virtual_currencies_such_as_Bitcoin.pdf',
  },
} satisfies Record<string, Source>;
