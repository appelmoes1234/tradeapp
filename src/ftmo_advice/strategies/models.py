from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal

SignalType = Literal["breakout", "pullback", "mean_reversion", "continuation"]
MarketRegime = Literal["trend", "range", "high_volatility", "session_momentum"]
BlockSeverity = Literal["hard_block", "soft_block", "warning"]


@dataclass(frozen=True)
class ResearchSource:
    """A compact source note used to keep strategy provenance auditable."""

    title: str
    url: str
    finding: str


@dataclass(frozen=True)
class Guardrail:
    """A rule that makes a public strategy usable in an FTMO-constrained product."""

    code: str
    severity: BlockSeverity
    description: str


@dataclass(frozen=True)
class StrategyDefinition:
    """Deterministic strategy configuration consumed by backtest and live scanner layers.

    The catalog intentionally stores rules and filters rather than executable orders. The
    FTMO risk engine remains the final authority for position sizing, account buffers,
    news/closure blocks, correlation, and max daily/total loss checks.
    """

    id: str
    name: str
    version: str
    signal_type: SignalType
    intended_regime: MarketRegime
    asset_classes: tuple[str, ...]
    timeframes: dict[str, str]
    entry_rules: tuple[dict[str, Any], ...]
    exit_rules: tuple[dict[str, Any], ...]
    filters: tuple[dict[str, Any], ...]
    risk: dict[str, Any]
    ftmo_guardrails: tuple[Guardrail, ...]
    research_sources: tuple[ResearchSource, ...]
    notes: str = ""

    def to_json_config(self) -> dict[str, Any]:
        """Return a JSON-serializable strategy config for persistence."""
        return {
            "id": self.id,
            "name": self.name,
            "version": self.version,
            "signal_type": self.signal_type,
            "intended_regime": self.intended_regime,
            "asset_classes": list(self.asset_classes),
            "timeframes": self.timeframes,
            "entry_rules": list(self.entry_rules),
            "exit_rules": list(self.exit_rules),
            "filters": list(self.filters),
            "risk": self.risk,
            "ftmo_guardrails": [guardrail.__dict__ for guardrail in self.ftmo_guardrails],
            "research_sources": [source.__dict__ for source in self.research_sources],
            "notes": self.notes,
        }
