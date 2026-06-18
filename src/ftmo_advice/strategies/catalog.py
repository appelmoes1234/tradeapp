from __future__ import annotations

from .models import Guardrail, ResearchSource, StrategyDefinition

FTMO_COMMON_GUARDRAILS = (
    Guardrail(
        code="closed_bar_only",
        severity="hard_block",
        description="Signals are generated only after the signal candle closes; fills are scheduled for the next tradable bar/tick.",
    ),
    Guardrail(
        code="risk_engine_required",
        severity="hard_block",
        description="Every candidate must pass the FTMO risk engine before it can become advice.",
    ),
    Guardrail(
        code="news_and_closure_gate",
        severity="hard_block",
        description="FTMO-relevant news windows, strategy blackouts, and market-closure restrictions are evaluated before ranking.",
    ),
    Guardrail(
        code="spread_regime_gate",
        severity="soft_block",
        description="Reject candidates when current spread is materially wider than the symbol's recent median spread.",
    ),
)

TSMOM_SOURCE = ResearchSource(
    title="Time Series Momentum",
    url="https://w4.stern.nyu.edu/facdir/lpederse/papers/TimeSeriesMomentum.pdf",
    finding="Documents time-series momentum across equity index, currency, commodity, and bond futures, with return persistence over 1-12 months.",
)
TREND_CENTURY_SOURCE = ResearchSource(
    title="A Century of Evidence on Trend-Following Investing",
    url="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2993026",
    finding="Long-horizon trend-following evidence supports diversified breakout/momentum rules with disciplined risk management.",
)
DONCHIAN_SOURCE = ResearchSource(
    title="Donchian Channels: Formula, Calculations, and Uses",
    url="https://www.investopedia.com/donchian-channels-formula-8415235",
    finding="Donchian channels identify breakouts using rolling highest highs and lowest lows, but should be combined with confirmation filters.",
)
RSI2_SOURCE = ResearchSource(
    title="RSI(2) - ChartSchool",
    url="https://chartschool.stockcharts.com/table-of-contents/trading-strategies-and-models/trading-strategies/rsi-2",
    finding="Connors-style RSI(2) is a short-term mean-reversion setup for corrections inside a broader trend, not a standalone reversal signal.",
)
ORB_SOURCE = ResearchSource(
    title="Opening Range Breakout Strategy - FTMO/OANDA",
    url="https://ftmo.oanda.com/blog/opening-range-breakout-strategy-how-to-master-the-1530-us-session/",
    finding="Opening range breakout can be robust for the US session when confirmed and paired with disciplined risk management.",
)
OPEN_PRICE_SOURCE = ResearchSource(
    title="Master the Opening Price Principle for Trading Success",
    url="https://www.investopedia.com/articles/active-trading/012215/expert-trader-strategies-opening-price-principle.asp",
    finding="Opening price and early range levels can act as intraday support/resistance in liquid markets.",
)

STRATEGY_CATALOG: tuple[StrategyDefinition, ...] = (
    StrategyDefinition(
        id="adaptive_donchian_trend_breakout_v1",
        name="Adaptive Donchian Trend Breakout",
        version="1.0.0",
        signal_type="breakout",
        intended_regime="trend",
        asset_classes=("forex", "indices", "metals", "commodities", "crypto"),
        timeframes={"signal_tf": "H1", "context_tf": "H4", "execution_tf": "M15"},
        entry_rules=(
            {"rule": "close_breaks_prior_donchian_high", "lookback": 55, "side": "long"},
            {"rule": "close_breaks_prior_donchian_low", "lookback": 55, "side": "short"},
            {"rule": "ema_trend_filter", "fast": 50, "slow": 200, "long_requires": "fast_above_slow", "short_requires": "fast_below_slow"},
            {"rule": "atr_expansion_filter", "atr_period": 14, "min_atr_percentile_lookback": 120, "min_percentile": 45},
        ),
        exit_rules=(
            {"rule": "opposite_donchian_exit", "lookback": 20},
            {"rule": "initial_stop_atr_multiple", "atr_period": 14, "multiple": 2.0},
            {"rule": "minimum_rr_take_profit", "rr": 2.5},
            {"rule": "trail_after_rr", "activate_at_rr": 1.5, "trail_atr_multiple": 2.0},
        ),
        filters=(
            {"filter": "avoid_range_regime", "adx_period": 14, "min_adx": 18},
            {"filter": "no_late_friday_entries", "after": "16:00", "timezone": "Europe/Prague"},
            {"filter": "max_spread_vs_20d_median", "multiplier": 1.5},
        ),
        risk={"risk_per_trade_pct": 0.25, "max_open_risk_pct": 1.0, "max_trades_per_day": 2, "min_rr": 2.0},
        ftmo_guardrails=FTMO_COMMON_GUARDRAILS,
        research_sources=(TSMOM_SOURCE, TREND_CENTURY_SOURCE, DONCHIAN_SOURCE),
        notes="Chosen because trend following has the broadest cross-asset evidence. Adapted for FTMO by using low risk, closed-bar confirmation, ADX/spread filters, and strict daily/total loss gating.",
    ),
    StrategyDefinition(
        id="session_orb_liquidity_breakout_v1",
        name="Session Opening Range Liquidity Breakout",
        version="1.0.0",
        signal_type="breakout",
        intended_regime="session_momentum",
        asset_classes=("indices", "forex", "metals", "commodities"),
        timeframes={"signal_tf": "M5", "context_tf": "M30", "execution_tf": "M1"},
        entry_rules=(
            {"rule": "build_opening_range", "minutes": 15, "sessions": ("LONDON", "NEW_YORK_CASH")},
            {"rule": "close_outside_opening_range", "side": "both", "confirmation_closes": 1},
            {"rule": "directional_vwap_filter", "long_requires": "close_above_vwap", "short_requires": "close_below_vwap"},
            {"rule": "range_quality_filter", "min_atr_fraction": 0.35, "max_atr_fraction": 1.25, "atr_period": 14},
        ),
        exit_rules=(
            {"rule": "stop_other_side_of_opening_range", "buffer_atr_multiple": 0.1},
            {"rule": "take_profit_rr", "rr": 2.0},
            {"rule": "time_stop", "exit_before_session_close_minutes": 30},
            {"rule": "break_even_after_rr", "rr": 1.0},
        ),
        filters=(
            {"filter": "trade_only_primary_session", "allowed": ("LONDON", "NEW_YORK_CASH")},
            {"filter": "skip_first_minutes_after_high_impact_news", "minutes_after": 15},
            {"filter": "max_spread_vs_20d_median", "multiplier": 1.3},
        ),
        risk={"risk_per_trade_pct": 0.20, "max_open_risk_pct": 0.75, "max_trades_per_day": 1, "min_rr": 2.0},
        ftmo_guardrails=FTMO_COMMON_GUARDRAILS,
        research_sources=(ORB_SOURCE, OPEN_PRICE_SOURCE),
        notes="Selected for liquid-session momentum, not all-day scalping. FTMO adaptation limits it to one confirmed breakout in primary sessions, with news/spread gates and time-based exit to reduce overtrading.",
    ),
    StrategyDefinition(
        id="trend_pullback_rsi2_continuation_v1",
        name="Trend Pullback RSI2 Continuation",
        version="1.0.0",
        signal_type="pullback",
        intended_regime="trend",
        asset_classes=("forex", "indices", "metals"),
        timeframes={"signal_tf": "M30", "context_tf": "H4", "execution_tf": "M15"},
        entry_rules=(
            {"rule": "higher_timeframe_trend", "ema_fast": 50, "ema_slow": 200, "side": "both"},
            {"rule": "rsi2_extreme_pullback", "long_below": 10, "short_above": 90},
            {"rule": "reclaim_trigger", "long": "close_back_above_ema20", "short": "close_back_below_ema20"},
            {"rule": "avoid_countertrend", "requires_context_ema_alignment": True},
        ),
        exit_rules=(
            {"rule": "initial_stop_structure_or_atr", "atr_period": 14, "atr_multiple": 1.5},
            {"rule": "take_profit_rr", "rr": 2.0},
            {"rule": "exit_on_rsi_normalization", "long_exit_rsi2_above": 70, "short_exit_rsi2_below": 30},
        ),
        filters=(
            {"filter": "block_low_liquidity_sessions", "blocked": ("SUNDAY_OPEN", "MONDAY_ASIA")},
            {"filter": "no_entry_into_high_impact_news", "minutes_before": 15, "minutes_after": 15},
            {"filter": "max_spread_vs_20d_median", "multiplier": 1.4},
            {"filter": "min_distance_to_tp_after_spread", "min_rr_after_costs": 1.8},
        ),
        risk={"risk_per_trade_pct": 0.20, "max_open_risk_pct": 0.75, "max_trades_per_day": 2, "min_rr": 2.0},
        ftmo_guardrails=FTMO_COMMON_GUARDRAILS,
        research_sources=(RSI2_SOURCE, TSMOM_SOURCE),
        notes="Uses RSI(2) only as a pullback detector inside a confirmed trend. This avoids blindly fading strong moves, which is unsafe for FTMO daily loss limits.",
    ),
)


def list_strategies() -> tuple[StrategyDefinition, ...]:
    """Return the curated, research-backed strategy definitions."""
    return STRATEGY_CATALOG


def get_strategy(strategy_id: str) -> StrategyDefinition:
    """Return a strategy definition by id."""
    for strategy in STRATEGY_CATALOG:
        if strategy.id == strategy_id:
            return strategy
    raise KeyError(f"Unknown strategy id: {strategy_id}")
