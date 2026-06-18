import type { FtmoProfile, SymbolSpec, TradeCandidate } from './domain';

export const defaultProfile: FtmoProfile = {
  productType: '2-step',
  accountType: 'standard',
  phase: 'challenge',
  initialCapital: 100000,
  balanceAtMidnight: 100000,
  currentEquity: 99620,
  openRiskUsd: 640,
  realizedPnlToday: -180,
  highestMidnightBalance: 100000,
  positiveDaysProfit: 6200,
  bestDayProfit: 2850
};

export const symbolRegistry: SymbolSpec[] = [
  {
    platformSymbol: 'EURUSD',
    canonicalSymbol: 'EURUSD',
    assetClass: 'forex',
    quoteCurrency: 'USD',
    tradable: true,
    spread: 0.00008,
    medianSpread20d: 0.00007,
    volumeMin: 0.01,
    volumeStep: 0.01,
    tickValuePerLot: 10,
    contractSize: 100000
  },
  {
    platformSymbol: 'US100.cash',
    canonicalSymbol: 'US100',
    assetClass: 'indices',
    quoteCurrency: 'USD',
    tradable: true,
    spread: 1.4,
    medianSpread20d: 1.1,
    volumeMin: 0.1,
    volumeStep: 0.1,
    tickValuePerLot: 1,
    contractSize: 1
  },
  {
    platformSymbol: 'XAUUSD',
    canonicalSymbol: 'XAUUSD',
    assetClass: 'metals',
    quoteCurrency: 'USD',
    tradable: true,
    spread: 0.24,
    medianSpread20d: 0.19,
    volumeMin: 0.01,
    volumeStep: 0.01,
    tickValuePerLot: 100,
    contractSize: 100
  },
  {
    platformSymbol: 'BTCUSD',
    canonicalSymbol: 'BTCUSD',
    assetClass: 'crypto',
    quoteCurrency: 'USD',
    tradable: false,
    spread: 26,
    medianSpread20d: 18,
    volumeMin: 0.01,
    volumeStep: 0.01,
    tickValuePerLot: 1,
    contractSize: 1
  }
];

export const tradeCandidates: TradeCandidate[] = [
  {
    id: 'sig-eurusd-001',
    symbol: 'EURUSD',
    strategyId: 'adaptive_donchian_trend_breakout_v1',
    side: 'long',
    entry: 1.08745,
    stopLoss: 1.08595,
    takeProfit: 1.0912,
    rr: 2.5,
    confidence: 0.74,
    sessionContext: 'London / NY overlap approaching',
    newsContext: { status: 'clear', nextHighImpactMinutes: 48 },
    tradesToday: 0,
    correlationGroup: 'usd'
  },
  {
    id: 'sig-us100-002',
    symbol: 'US100.cash',
    strategyId: 'session_orb_liquidity_breakout_v1',
    side: 'short',
    entry: 19120.5,
    stopLoss: 19172.5,
    takeProfit: 19016.5,
    rr: 2.0,
    confidence: 0.69,
    sessionContext: 'New York cash open',
    newsContext: { status: 'clear', nextHighImpactMinutes: 75 },
    tradesToday: 1,
    correlationGroup: 'us_index'
  },
  {
    id: 'sig-xau-003',
    symbol: 'XAUUSD',
    strategyId: 'trend_pullback_rsi2_continuation_v1',
    side: 'long',
    entry: 2337.2,
    stopLoss: 2328.2,
    takeProfit: 2355.2,
    rr: 2.0,
    confidence: 0.63,
    sessionContext: 'London metals liquidity',
    newsContext: { status: 'blackout', nextHighImpactMinutes: 4 },
    tradesToday: 0,
    correlationGroup: 'gold_usd'
  },
  {
    id: 'sig-btc-004',
    symbol: 'BTCUSD',
    strategyId: 'adaptive_donchian_trend_breakout_v1',
    side: 'long',
    entry: 66120,
    stopLoss: 65680,
    takeProfit: 67000,
    rr: 2.0,
    confidence: 0.58,
    sessionContext: 'Crypto weekend maintenance window',
    newsContext: { status: 'clear', nextHighImpactMinutes: null },
    tradesToday: 0,
    correlationGroup: 'crypto'
  }
];
