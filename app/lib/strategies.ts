import type { StrategyConfig } from './domain';

export const strategies: StrategyConfig[] = [
  {
    id: 'adaptive_donchian_trend_breakout_v1',
    name: 'Adaptive Donchian Trend Breakout',
    version: '1.0.0',
    description:
      'Cross-asset trend following setup using prior Donchian range breakouts, EMA trend alignment, ATR expansion and FTMO risk gating.',
    signalType: 'breakout',
    intendedRegime: 'trend',
    timeframes: { signal: 'H1', context: 'H4', execution: 'M15' },
    risk: { riskPerTradePct: 0.25, maxOpenRiskPct: 1.0, maxTradesPerDay: 2, minRr: 2.0 },
    gates: ['closed_bar_only', 'ftmo_risk_engine', 'news_filter', 'spread_filter', 'correlation_cap']
  },
  {
    id: 'session_orb_liquidity_breakout_v1',
    name: 'Session Opening Range Liquidity Breakout',
    version: '1.0.0',
    description:
      'London/New York opening-range breakout with VWAP confirmation, one-trade-per-day limit and session-close time stop.',
    signalType: 'breakout',
    intendedRegime: 'session_momentum',
    timeframes: { signal: 'M5', context: 'M30', execution: 'M1' },
    risk: { riskPerTradePct: 0.2, maxOpenRiskPct: 0.75, maxTradesPerDay: 1, minRr: 2.0 },
    gates: ['closed_bar_only', 'primary_session_only', 'news_filter', 'spread_filter', 'time_stop']
  },
  {
    id: 'trend_pullback_rsi2_continuation_v1',
    name: 'Trend Pullback RSI2 Continuation',
    version: '1.0.0',
    description:
      'RSI(2) pullback detector inside higher-timeframe EMA alignment, avoiding blind countertrend mean reversion.',
    signalType: 'pullback',
    intendedRegime: 'trend',
    timeframes: { signal: 'M30', context: 'H4', execution: 'M15' },
    risk: { riskPerTradePct: 0.2, maxOpenRiskPct: 0.75, maxTradesPerDay: 2, minRr: 2.0 },
    gates: ['closed_bar_only', 'trend_alignment', 'news_filter', 'spread_filter', 'min_rr_after_costs']
  }
];

export function getStrategy(strategyId: string): StrategyConfig {
  const strategy = strategies.find((item) => item.id === strategyId);
  if (!strategy) {
    throw new Error(`Unknown strategy: ${strategyId}`);
  }
  return strategy;
}
