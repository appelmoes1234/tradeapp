from __future__ import annotations

from collections.abc import Sequence


def simple_moving_average(values: Sequence[float], period: int) -> list[float | None]:
    if period <= 0:
        raise ValueError("period must be positive")
    result: list[float | None] = []
    rolling_sum = 0.0
    for index, value in enumerate(values):
        rolling_sum += value
        if index >= period:
            rolling_sum -= values[index - period]
        result.append(rolling_sum / period if index >= period - 1 else None)
    return result


def exponential_moving_average(values: Sequence[float], period: int) -> list[float | None]:
    if period <= 0:
        raise ValueError("period must be positive")
    if not values:
        return []
    alpha = 2 / (period + 1)
    result: list[float | None] = []
    ema: float | None = None
    for index, value in enumerate(values):
        if index < period - 1:
            result.append(None)
            continue
        if index == period - 1:
            ema = sum(values[:period]) / period
        else:
            assert ema is not None
            ema = (value * alpha) + (ema * (1 - alpha))
        result.append(ema)
    return result


def donchian_channels(
    highs: Sequence[float], lows: Sequence[float], period: int, *, exclude_current: bool = True
) -> list[tuple[float | None, float | None, float | None]]:
    """Calculate Donchian upper/middle/lower bands.

    exclude_current=True is the safer default for backtesting because a breakout on
    bar N must compare against the prior N-period range, not a range that already
    includes the breakout bar.
    """
    if period <= 0:
        raise ValueError("period must be positive")
    if len(highs) != len(lows):
        raise ValueError("highs and lows must have the same length")

    bands: list[tuple[float | None, float | None, float | None]] = []
    for index in range(len(highs)):
        end = index if exclude_current else index + 1
        start = end - period
        if start < 0:
            bands.append((None, None, None))
            continue
        upper = max(highs[start:end])
        lower = min(lows[start:end])
        middle = (upper + lower) / 2
        bands.append((upper, middle, lower))
    return bands


def rsi(values: Sequence[float], period: int = 14) -> list[float | None]:
    if period <= 0:
        raise ValueError("period must be positive")
    if len(values) < 2:
        return [None for _ in values]

    result: list[float | None] = [None]
    gains: list[float] = []
    losses: list[float] = []
    avg_gain: float | None = None
    avg_loss: float | None = None

    for index in range(1, len(values)):
        change = values[index] - values[index - 1]
        gain = max(change, 0.0)
        loss = max(-change, 0.0)

        if index <= period:
            gains.append(gain)
            losses.append(loss)
            if index < period:
                result.append(None)
                continue
            avg_gain = sum(gains) / period
            avg_loss = sum(losses) / period
        else:
            assert avg_gain is not None and avg_loss is not None
            avg_gain = ((avg_gain * (period - 1)) + gain) / period
            avg_loss = ((avg_loss * (period - 1)) + loss) / period

        if avg_loss == 0:
            result.append(100.0)
        else:
            rs = avg_gain / avg_loss
            result.append(100 - (100 / (1 + rs)))
    return result


def true_range(highs: Sequence[float], lows: Sequence[float], closes: Sequence[float]) -> list[float]:
    if not (len(highs) == len(lows) == len(closes)):
        raise ValueError("highs, lows and closes must have the same length")
    ranges: list[float] = []
    for index, high in enumerate(highs):
        low = lows[index]
        if index == 0:
            ranges.append(high - low)
            continue
        previous_close = closes[index - 1]
        ranges.append(max(high - low, abs(high - previous_close), abs(low - previous_close)))
    return ranges


def average_true_range(highs: Sequence[float], lows: Sequence[float], closes: Sequence[float], period: int = 14) -> list[float | None]:
    return simple_moving_average(true_range(highs, lows, closes), period)
