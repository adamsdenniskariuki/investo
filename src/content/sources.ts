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
} satisfies Record<string, Source>;
