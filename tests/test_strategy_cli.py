import json

from ftmo_advice.strategies.cli import export_strategies, main


def test_export_strategies_returns_json_ready_catalog():
    exported = export_strategies()

    assert len(exported) == 3
    assert exported[0]["id"] == "adaptive_donchian_trend_breakout_v1"
    json.dumps(exported)


def test_export_strategies_can_filter_by_id():
    exported = export_strategies("trend_pullback_rsi2_continuation_v1")

    assert len(exported) == 1
    assert exported[0]["name"] == "Trend Pullback RSI2 Continuation"


def test_cli_main_prints_strategy_json(capsys):
    assert main(["--strategy-id", "session_orb_liquidity_breakout_v1", "--indent", "0"]) == 0

    output = capsys.readouterr().out
    parsed = json.loads(output)
    assert parsed[0]["id"] == "session_orb_liquidity_breakout_v1"
