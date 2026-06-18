import json

import pytest

from ftmo_advice.strategies import get_strategy, list_strategies
from ftmo_advice.strategies.indicators import donchian_channels, rsi


def test_catalog_contains_curated_ftmo_constrained_strategies():
    strategies = list_strategies()

    assert {strategy.id for strategy in strategies} == {
        "adaptive_donchian_trend_breakout_v1",
        "session_orb_liquidity_breakout_v1",
        "trend_pullback_rsi2_continuation_v1",
    }
    for strategy in strategies:
        guardrail_codes = {guardrail.code for guardrail in strategy.ftmo_guardrails}
        assert "closed_bar_only" in guardrail_codes
        assert "risk_engine_required" in guardrail_codes
        assert strategy.risk["risk_per_trade_pct"] <= 0.25
        assert strategy.risk["min_rr"] >= 2.0
        assert strategy.research_sources
        json.dumps(strategy.to_json_config())


def test_get_strategy_returns_matching_definition():
    strategy = get_strategy("session_orb_liquidity_breakout_v1")

    assert strategy.name == "Session Opening Range Liquidity Breakout"
    assert strategy.risk["max_trades_per_day"] == 1


def test_get_strategy_rejects_unknown_id():
    with pytest.raises(KeyError):
        get_strategy("unknown")


def test_donchian_excludes_current_bar_by_default():
    highs = [10, 11, 12, 30]
    lows = [5, 6, 7, 8]

    bands = donchian_channels(highs, lows, period=3)

    assert bands[2] == (None, None, None)
    assert bands[3] == (12, 8.5, 5)


def test_rsi_returns_expected_bounds():
    values = [1, 2, 3, 2, 2.5, 3, 2.8, 3.2, 3.5, 3.1]

    values_rsi = rsi(values, period=2)

    assert values_rsi[0] is None
    calculated = [value for value in values_rsi if value is not None]
    assert calculated
    assert all(0 <= value <= 100 for value in calculated)
