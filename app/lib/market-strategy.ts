import type { MarketBar } from './market-data';
import { getMarketSymbol } from './market-data';

export type RealMarketAdvice = {
  symbol: string;
  platformSymbol: string;
  generatedAt: string;
  status: 'approved' | 'blocked';
  side: 'long' | 'short' | 'flat';
  entry: number;
  stopLoss: number | null;
  takeProfit: number | null;
  rr: number;
  riskUsd: number;
  lotSize: number;
  confidence: number;
  reason: string;
  checks: string[];
  disclaimer: string;
};

export type RealBacktestResult = {
  symbol: string;
  platformSymbol: string;
  strategyId: string;
  from: string;
  to: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  pnlUsd: number;
  maxDrawdownUsd: number;
  equityCurve: Array<{ ts: string; equity: number }>;
  blockedReasons: Record<string, number>;
};

function ema(values: number[], period: number): Array<number | null> {
  const alpha = 2 / (period + 1);
  const result: Array<number | null> = [];
  let current: number | null = null;
  values.forEach((value, index) => {
    if (index < period - 1) {
      result.push(null);
      return;
    }
    if (index === period - 1) {
      current = values.slice(0, period).reduce((sum, item) => sum + item, 0) / period;
    } else if (current != null) {
      current = value * alpha + current * (1 - alpha);
    }
    result.push(current);
  });
  return result;
}

function atr(bars: MarketBar[], period: number): Array<number | null> {
  const trueRanges = bars.map((bar, index) => {
    if (index === 0) return bar.high - bar.low;
    const previousClose = bars[index - 1].close;
    return Math.max(bar.high - bar.low, Math.abs(bar.high - previousClose), Math.abs(bar.low - previousClose));
  });
  return trueRanges.map((_, index) => {
    if (index < period - 1) return null;
    return trueRanges.slice(index - period + 1, index + 1).reduce((sum, item) => sum + item, 0) / period;
  });
}

function rsi(values: number[], period: number): Array<number | null> {
  return values.map((_, index) => {
    if (index < period) return null;
    const window = values.slice(index - period, index + 1);
    let gains = 0;
    let losses = 0;
    for (let i = 1; i < window.length; i += 1) {
      const change = window[i] - window[i - 1];
      gains += Math.max(change, 0);
      losses += Math.max(-change, 0);
    }
    if (losses === 0) return 100;
    const rs = gains / losses;
    return 100 - 100 / (1 + rs);
  });
}

function roundPrice(value: number): number {
  if (Math.abs(value) >= 1000) return Number(value.toFixed(2));
  if (Math.abs(value) >= 10) return Number(value.toFixed(3));
  return Number(value.toFixed(5));
}

export function generateRealMarketAdvice(yahooSymbol: string, bars: MarketBar[]): RealMarketAdvice {
  const symbol = getMarketSymbol(yahooSymbol);
  if (bars.length < 60) {
    throw new Error('At least 60 bars are required for real-market advice');
  }
  const closes = bars.map((bar) => bar.close);
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const atr14 = atr(bars, 14);
  const rsi14 = rsi(closes, 14);
  const lastIndex = bars.length - 1;
  const last = bars[lastIndex];
  const fast = ema20[lastIndex];
  const slow = ema50[lastIndex];
  const volatility = atr14[lastIndex];
  const momentum = rsi14[lastIndex];
  const checks: string[] = ['real_market_data_loaded', 'closed_bar_signal', 'execution_disabled'];

  if (fast == null || slow == null || volatility == null || momentum == null) {
    throw new Error('Indicator warmup failed');
  }

  const trendLong = last.close > fast && fast > slow && momentum < 72;
  const trendShort = last.close < fast && fast < slow && momentum > 28;
  const side = trendLong ? 'long' : trendShort ? 'short' : 'flat';
  if (side === 'flat') {
    return {
      symbol: yahooSymbol,
      platformSymbol: symbol.platformSymbol,
      generatedAt: new Date().toISOString(),
      status: 'blocked',
      side,
      entry: roundPrice(last.close),
      stopLoss: null,
      takeProfit: null,
      rr: 0,
      riskUsd: 0,
      lotSize: 0,
      confidence: 0.35,
      reason: 'no_clear_closed_bar_trend_setup',
      checks,
      disclaimer: 'Research signal only; not financial advice and not an execution instruction.'
    };
  }

  const entry = last.close;
  const stopLoss = side === 'long' ? entry - volatility * 1.5 : entry + volatility * 1.5;
  const takeProfit = side === 'long' ? entry + volatility * 3 : entry - volatility * 3;
  const riskUsd = 250;
  const lotSize = Math.max(0.01, riskUsd / Math.abs(entry - stopLoss));
  checks.push('ema_trend_alignment', 'atr_stop_model', 'rr_ok', 'risk_capped_at_0_25pct_model');

  return {
    symbol: yahooSymbol,
    platformSymbol: symbol.platformSymbol,
    generatedAt: new Date().toISOString(),
    status: 'approved',
    side,
    entry: roundPrice(entry),
    stopLoss: roundPrice(stopLoss),
    takeProfit: roundPrice(takeProfit),
    rr: 2,
    riskUsd,
    lotSize: Number(lotSize.toFixed(2)),
    confidence: Number(Math.min(0.78, 0.52 + Math.abs(fast - slow) / volatility / 20).toFixed(2)),
    reason: 'ema_trend_continuation_with_atr_risk_model',
    checks,
    disclaimer: 'Research signal only; not financial advice and not an execution instruction.'
  };
}

export function runRealBacktest(yahooSymbol: string, bars: MarketBar[]): RealBacktestResult {
  const symbol = getMarketSymbol(yahooSymbol);
  const closes = bars.map((bar) => bar.close);
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const atr14 = atr(bars, 14);
  let equity = 100000;
  let peak = equity;
  let maxDrawdown = 0;
  let trades = 0;
  let wins = 0;
  let losses = 0;
  const equityCurve: Array<{ ts: string; equity: number }> = [];
  const blockedReasons: Record<string, number> = { warmup: 0, no_signal: 0 };

  for (let index = 51; index < bars.length - 1; index += 1) {
    const fast = ema20[index];
    const slow = ema50[index];
    const volatility = atr14[index];
    if (fast == null || slow == null || volatility == null) {
      blockedReasons.warmup += 1;
      continue;
    }
    const bar = bars[index];
    const next = bars[index + 1];
    const long = bar.close > fast && fast > slow;
    const short = bar.close < fast && fast < slow;
    if (!long && !short) {
      blockedReasons.no_signal += 1;
      equityCurve.push({ ts: bar.ts, equity: Number(equity.toFixed(2)) });
      continue;
    }

    trades += 1;
    const entry = next.open;
    const stop = long ? entry - volatility * 1.5 : entry + volatility * 1.5;
    const target = long ? entry + volatility * 3 : entry - volatility * 3;
    const risk = 250;
    const hitStop = long ? next.low <= stop : next.high >= stop;
    const hitTarget = long ? next.high >= target : next.low <= target;
    const pnl = hitStop && hitTarget ? -risk : hitTarget ? risk * 2 : hitStop ? -risk : (long ? next.close - entry : entry - next.close) * (risk / Math.abs(entry - stop));
    if (pnl > 0) wins += 1;
    if (pnl <= 0) losses += 1;
    equity += pnl;
    peak = Math.max(peak, equity);
    maxDrawdown = Math.max(maxDrawdown, peak - equity);
    equityCurve.push({ ts: next.ts, equity: Number(equity.toFixed(2)) });
  }

  return {
    symbol: yahooSymbol,
    platformSymbol: symbol.platformSymbol,
    strategyId: 'real_market_ema_atr_closed_bar_v1',
    from: bars[0]?.ts ?? '',
    to: bars[bars.length - 1]?.ts ?? '',
    trades,
    wins,
    losses,
    winRate: trades === 0 ? 0 : Number(((wins / trades) * 100).toFixed(1)),
    pnlUsd: Number((equity - 100000).toFixed(2)),
    maxDrawdownUsd: Number(maxDrawdown.toFixed(2)),
    equityCurve,
    blockedReasons
  };
}
