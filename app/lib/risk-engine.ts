import type { AdviceOutput, FtmoProfile, RiskDecision, SymbolSpec, TradeCandidate } from './domain';
import { getStrategy } from './strategies';

export function roundDownToStep(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.floor(value / step) * step;
}

export function calculateFtmoLimits(profile: FtmoProfile) {
  const maxDailyLossPct = profile.productType === '1-step' ? 0.03 : 0.05;
  const maxLossPct = 0.1;
  const dailyLimitEquity = profile.balanceAtMidnight - profile.initialCapital * maxDailyLossPct;
  const totalLimitEquity =
    profile.productType === '1-step'
      ? profile.highestMidnightBalance - profile.initialCapital * maxLossPct
      : profile.initialCapital - profile.initialCapital * maxLossPct;

  return {
    maxDailyLossPct,
    maxLossPct,
    dailyLimitEquity,
    totalLimitEquity,
    remainingDailyBufferUsd: Math.max(0, profile.currentEquity - dailyLimitEquity),
    remainingTotalBufferUsd: Math.max(0, profile.currentEquity - totalLimitEquity)
  };
}

function estimateLossPerLot(candidate: TradeCandidate, symbol: SymbolSpec): number {
  const priceDistance = Math.abs(candidate.entry - candidate.stopLoss);
  const rawLoss = priceDistance * symbol.tickValuePerLot;
  const commissionEstimate = symbol.assetClass === 'crypto' ? candidate.entry * 0.000325 : 5;
  return rawLoss + commissionEstimate;
}

export function evaluateCandidate(
  candidate: TradeCandidate,
  profile: FtmoProfile,
  symbol: SymbolSpec
): RiskDecision {
  const strategy = getStrategy(candidate.strategyId);
  const limits = calculateFtmoLimits(profile);
  const checksPassed: string[] = [];
  const blockedReasons: string[] = [];

  if (!symbol.tradable) {
    blockedReasons.push('market_not_tradable');
  } else {
    checksPassed.push('market_tradable');
  }

  if (candidate.newsContext.status === 'restricted') {
    blockedReasons.push('ftmo_restricted_news_window');
  } else if (candidate.newsContext.status === 'blackout') {
    blockedReasons.push('strategy_news_blackout');
  } else {
    checksPassed.push('news_ok');
  }

  const spreadMultiplier = symbol.spread / symbol.medianSpread20d;
  if (spreadMultiplier > 1.5) {
    blockedReasons.push('spread_too_wide');
  } else {
    checksPassed.push('spread_ok');
  }

  if (candidate.rr < strategy.risk.minRr) {
    blockedReasons.push('rr_too_low');
  } else {
    checksPassed.push('rr_ok');
  }

  if (candidate.tradesToday >= strategy.risk.maxTradesPerDay) {
    blockedReasons.push('max_trades_today');
  } else {
    checksPassed.push('trade_frequency_ok');
  }

  const lossPerLot = estimateLossPerLot(candidate, symbol);
  const perTradeBudget = profile.balanceAtMidnight * (strategy.risk.riskPerTradePct / 100);
  const remainingOpenRiskBudget = profile.balanceAtMidnight * (strategy.risk.maxOpenRiskPct / 100) - profile.openRiskUsd;
  const riskBudget = Math.max(0, Math.min(perTradeBudget, limits.remainingDailyBufferUsd, limits.remainingTotalBufferUsd, remainingOpenRiskBudget));
  const rawLotSize = lossPerLot > 0 ? riskBudget / lossPerLot : 0;
  const lotSize = roundDownToStep(rawLotSize, symbol.volumeStep);
  const riskUsd = lotSize * lossPerLot;
  const projectedPortfolioOpenRiskUsd = profile.openRiskUsd + riskUsd;

  if (lotSize < symbol.volumeMin) {
    blockedReasons.push('volume_below_min');
  } else {
    checksPassed.push('lot_size_ok');
  }

  if (profile.currentEquity <= limits.dailyLimitEquity) {
    blockedReasons.push('daily_loss_limit_reached');
  } else {
    checksPassed.push('daily_buffer_ok');
  }

  if (profile.currentEquity <= limits.totalLimitEquity) {
    blockedReasons.push('total_loss_limit_reached');
  } else {
    checksPassed.push('total_buffer_ok');
  }

  if (projectedPortfolioOpenRiskUsd > profile.balanceAtMidnight * (strategy.risk.maxOpenRiskPct / 100)) {
    blockedReasons.push('portfolio_open_risk_too_high');
  } else {
    checksPassed.push('portfolio_open_risk_ok');
  }

  const status = blockedReasons.length === 0 ? 'approved' : 'blocked';
  return {
    status,
    severity: status === 'approved' ? 'approved' : blockedReasons.includes('ftmo_restricted_news_window') ? 'hard_block' : 'soft_block',
    reasonCode: status === 'approved' ? 'approved_for_advice' : blockedReasons[0],
    checksPassed,
    blockedReasons,
    riskUsd: Number(riskUsd.toFixed(2)),
    lotSize: Number(lotSize.toFixed(2)),
    remainingDailyBufferUsd: Number(limits.remainingDailyBufferUsd.toFixed(2)),
    remainingTotalBufferUsd: Number(limits.remainingTotalBufferUsd.toFixed(2)),
    projectedPortfolioOpenRiskUsd: Number(projectedPortfolioOpenRiskUsd.toFixed(2))
  };
}

export function buildAdviceOutputs(
  candidates: TradeCandidate[],
  profile: FtmoProfile,
  symbols: SymbolSpec[]
): AdviceOutput[] {
  return candidates
    .map((candidate) => {
      const symbol = symbols.find((item) => item.platformSymbol === candidate.symbol);
      if (!symbol) {
        throw new Error(`Unknown symbol ${candidate.symbol}`);
      }
      const strategy = getStrategy(candidate.strategyId);
      return {
        ...candidate,
        strategy,
        decision: evaluateCandidate(candidate, profile, symbol),
        snapshotRef: `snapshot://${candidate.symbol}/${candidate.id}`
      };
    })
    .sort((left, right) => {
      if (left.decision.status !== right.decision.status) {
        return left.decision.status === 'approved' ? -1 : 1;
      }
      return right.confidence - left.confidence;
    });
}
