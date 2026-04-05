export const SECTORS = {
  Tech:       ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'AMD', 'TSLA', 'CRM', 'ADBE', 'INTC', 'ORCL'],
  Biotech:    ['LLY', 'MRNA', 'BIIB', 'REGN', 'VRTX', 'ABBV', 'BMY', 'GILD', 'AMGN', 'PFE'],
  Financials: ['JPM', 'GS', 'BAC', 'MS', 'WFC'],
  Energy:            ['XOM', 'CVX', 'COP', 'SLB', 'EOG'],
  ConsumerStaples:   ['KO', 'PG', 'WMT', 'COST', 'CL'],
  Semiconductors:    ['TSM', 'ASML', 'AMAT', 'LRCX', 'KLAC'],
}

export const COMPANY_NAMES = {
  // Tech
  AAPL:  'Apple Inc.',
  MSFT:  'Microsoft Corp.',
  NVDA:  'NVIDIA Corp.',
  GOOGL: 'Alphabet Inc.',
  AMZN:  'Amazon.com Inc.',
  META:  'Meta Platforms Inc.',
  AMD:   'Advanced Micro Devices',
  TSLA:  'Tesla Inc.',
  CRM:   'Salesforce Inc.',
  ADBE:  'Adobe Inc.',
  INTC:  'Intel Corp.',
  ORCL:  'Oracle Corp.',
  // Biotech
  LLY:   'Eli Lilly & Co.',
  MRNA:  'Moderna Inc.',
  BIIB:  'Biogen Inc.',
  REGN:  'Regeneron Pharmaceuticals',
  VRTX:  'Vertex Pharmaceuticals',
  ABBV:  'AbbVie Inc.',
  BMY:   'Bristol-Myers Squibb',
  GILD:  'Gilead Sciences',
  AMGN:  'Amgen Inc.',
  PFE:   'Pfizer Inc.',
  // Financials
  JPM:   'JPMorgan Chase & Co.',
  GS:    'Goldman Sachs Group',
  BAC:   'Bank of America Corp.',
  MS:    'Morgan Stanley',
  WFC:   'Wells Fargo & Co.',
  // Energy
  XOM:   'Exxon Mobil Corp.',
  CVX:   'Chevron Corp.',
  COP:   'ConocoPhillips',
  SLB:   'SLB (Schlumberger)',
  EOG:   'EOG Resources',
  // Consumer Staples
  KO:    'Coca-Cola Co.',
  PG:    'Procter & Gamble Co.',
  WMT:   'Walmart Inc.',
  COST:  'Costco Wholesale Corp.',
  CL:    'Colgate-Palmolive Co.',
  // Semiconductors
  TSM:   'Taiwan Semiconductor',
  ASML:  'ASML Holding NV',
  AMAT:  'Applied Materials Inc.',
  LRCX:  'Lam Research Corp.',
  KLAC:  'KLA Corp.',
}

export function getSector(ticker) {
  return Object.entries(SECTORS).find(([, tickers]) => tickers.includes(ticker))?.[0] ?? null
}
