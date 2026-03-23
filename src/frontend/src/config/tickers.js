export const SECTORS = {
  Tech:    ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META'],
  Biotech: ['LLY', 'MRNA', 'BIIB', 'REGN', 'VRTX'],
}

export const COMPANY_NAMES = {
  AAPL:  'Apple Inc.',
  MSFT:  'Microsoft Corp.',
  NVDA:  'NVIDIA Corp.',
  GOOGL: 'Alphabet Inc.',
  AMZN:  'Amazon.com Inc.',
  META:  'Meta Platforms Inc.',
  LLY:   'Eli Lilly & Co.',
  MRNA:  'Moderna Inc.',
  BIIB:  'Biogen Inc.',
  REGN:  'Regeneron Pharmaceuticals',
  VRTX:  'Vertex Pharmaceuticals',
}

export function getSector(ticker) {
  return Object.entries(SECTORS).find(([, tickers]) => tickers.includes(ticker))?.[0] ?? null
}
