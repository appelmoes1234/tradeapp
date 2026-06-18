from __future__ import annotations

import argparse
import json
from collections.abc import Sequence

from .catalog import get_strategy, list_strategies


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Inspect FTMO-constrained strategy definitions.")
    parser.add_argument(
        "--strategy-id",
        help="Export one strategy by id. When omitted, all strategies are exported.",
    )
    parser.add_argument(
        "--indent",
        type=int,
        default=2,
        help="JSON indentation level. Use 0 for compact output.",
    )
    return parser


def export_strategies(strategy_id: str | None = None) -> list[dict[str, object]]:
    strategies = [get_strategy(strategy_id)] if strategy_id else list(list_strategies())
    return [strategy.to_json_config() for strategy in strategies]


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    indent = None if args.indent == 0 else args.indent
    print(json.dumps(export_strategies(args.strategy_id), indent=indent, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
