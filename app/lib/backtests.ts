export type BacktestSummary = {
  strategyId: string;
  market: string;
  trades: number;
  winRate: number;
  expectancy: number;
  pnl: number;
  maxDrawdown: number;
  ftmoPass: boolean;
  blockedReasons: Record<string, number>;
};

export const backtestSummaries: BacktestSummary[] = [
  {
    strategyId: 'adaptive_donchian_trend_breakout_v1',
    market: 'EURUSD / US100.cash / XAUUSD',
    trades: 47,
    winRate: 43.6,
    expectancy: 82.4,
    pnl: 3872,
    maxDrawdown: 1820,
    ftmoPass: true,
    blockedReasons: { spread_too_wide: 8, strategy_news_blackout: 6, rr_too_low: 4 }
  },
  {
    strategyId: 'session_orb_liquidity_breakout_v1',
    market: 'US100.cash',
    trades: 18,
    winRate: 50,
    expectancy: 96.1,
    pnl: 1730,
    maxDrawdown: 760,
    ftmoPass: true,
    blockedReasons: { max_trades_today: 12, strategy_news_blackout: 5, spread_too_wide: 3 }
  },
  {
    strategyId: 'trend_pullback_rsi2_continuation_v1',
    market: 'EURUSD / XAUUSD',
    trades: 31,
    winRate: 48.4,
    expectancy: 61.7,
    pnl: 1913,
    maxDrawdown: 1120,
    ftmoPass: true,
    blockedReasons: { trend_alignment_failed: 15, strategy_news_blackout: 7, min_rr_after_costs: 5 }
  }
];
