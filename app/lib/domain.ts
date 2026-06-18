export type FtmoProductType = '1-step' | '2-step';
export type AccountType = 'standard' | 'swing';
export type AdviceStatus = 'approved' | 'blocked';

export type FtmoProfile = {
  productType: FtmoProductType;
  accountType: AccountType;
  phase: 'challenge' | 'verification' | 'funded';
  initialCapital: number;
  balanceAtMidnight: number;
  currentEquity: number;
  openRiskUsd: number;
  realizedPnlToday: number;
  highestMidnightBalance: number;
  positiveDaysProfit: number;
  bestDayProfit: number;
};

export type SymbolSpec = {
  platformSymbol: string;
  canonicalSymbol: string;
  assetClass: 'forex' | 'indices' | 'metals' | 'commodities' | 'crypto' | 'stocks';
  quoteCurrency: string;
  tradable: boolean;
  spread: number;
  medianSpread20d: number;
  volumeMin: number;
  volumeStep: number;
  tickValuePerLot: number;
  contractSize: number;
};

export type StrategyConfig = {
  id: string;
  name: string;
  version: string;
  description: string;
  signalType: 'breakout' | 'pullback';
  intendedRegime: 'trend' | 'session_momentum';
  timeframes: Record<string, string>;
  risk: {
    riskPerTradePct: number;
    maxOpenRiskPct: number;
    maxTradesPerDay: number;
    minRr: number;
  };
  gates: string[];
};

export type TradeCandidate = {
  id: string;
  symbol: string;
  strategyId: string;
  side: 'long' | 'short';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  rr: number;
  confidence: number;
  sessionContext: string;
  newsContext: {
    status: 'clear' | 'blackout' | 'restricted';
    nextHighImpactMinutes: number | null;
  };
  tradesToday: number;
  correlationGroup: string;
};

export type RiskDecision = {
  status: AdviceStatus;
  severity: 'approved' | 'hard_block' | 'soft_block';
  reasonCode: string;
  checksPassed: string[];
  blockedReasons: string[];
  riskUsd: number;
  lotSize: number;
  remainingDailyBufferUsd: number;
  remainingTotalBufferUsd: number;
  projectedPortfolioOpenRiskUsd: number;
};

export type AdviceOutput = TradeCandidate & {
  strategy: StrategyConfig;
  decision: RiskDecision;
  snapshotRef: string;
};
