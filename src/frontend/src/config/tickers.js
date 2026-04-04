export const SECTORS = {
  Tech:       ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'AMD', 'TSLA', 'CRM', 'ADBE', 'INTC', 'ORCL'],
  Biotech:    ['LLY', 'MRNA', 'BIIB', 'REGN', 'VRTX', 'ABBV', 'BMY', 'GILD', 'AMGN', 'PFE'],
  Financials: ['JPM', 'GS', 'BAC', 'MS', 'WFC'],
  Energy:     ['XOM', 'CVX', 'COP', 'SLB', 'EOG'],
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
  // Energy (pending pipeline data)
  XOM:   'Exxon Mobil Corp.',
  CVX:   'Chevron Corp.',
  COP:   'ConocoPhillips',
  SLB:   'SLB (Schlumberger)',
  EOG:   'EOG Resources',
}

export function getSector(ticker) {
  return Object.entries(SECTORS).find(([, tickers]) => tickers.includes(ticker))?.[0] ?? null
}
