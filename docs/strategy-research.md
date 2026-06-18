# Research-backed strategy catalog

This project intentionally implements **strategy definitions**, not auto-execution.
Every setup is adapted for an FTMO-constrained advisory flow where the risk engine,
news/session filters, spread gates, and audit logging have final authority.

## Selection principles

1. Prefer strategies with cross-market or long-lived evidence.
2. Convert public strategy ideas into conservative, closed-bar rule sets.
3. Avoid high-frequency/scalping behavior that can create excessive server requests.
4. Require spread, news, session, risk/reward, and FTMO buffer gates before advice.
5. Keep strategy JSON deterministic so live scanning and backtesting can share rules.

## Implemented strategies

### Adaptive Donchian Trend Breakout

Evidence base: time-series momentum/trend following and Donchian breakout logic.
The strategy compares a closed candle with the prior 55-period Donchian range,
requires EMA trend alignment, and exits with shorter Donchian/ATR logic. It is
adapted for FTMO with low risk per trade, ADX/range avoidance, spread checks,
closed-bar signals, and portfolio-wide risk gating.

### Session Opening Range Liquidity Breakout

Evidence base: opening range and opening price principles in liquid sessions.
The strategy builds a 15-minute range for London or New York cash context, then
requires a confirmed close outside the range plus VWAP alignment. It is limited to
one trade per day and exits before session close to reduce overnight/session-risk.

### Trend Pullback RSI2 Continuation

Evidence base: Connors-style RSI(2) pullback concepts combined with trend
filters. RSI(2) is used only as a pullback detector inside higher-timeframe EMA
alignment; it is not used to blindly fade strong moves. This keeps the setup more
compatible with FTMO daily-loss constraints.

## Sources reviewed

- Time Series Momentum: https://w4.stern.nyu.edu/facdir/lpederse/papers/TimeSeriesMomentum.pdf
- A Century of Evidence on Trend-Following Investing: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2993026
- Donchian Channels: https://www.investopedia.com/donchian-channels-formula-8415235
- RSI(2) strategy: https://chartschool.stockcharts.com/table-of-contents/trading-strategies-and-models/trading-strategies/rsi-2
- Opening Range Breakout: https://ftmo.oanda.com/blog/opening-range-breakout-strategy-how-to-master-the-1530-us-session/
- Opening Price Principle: https://www.investopedia.com/articles/active-trading/012215/expert-trader-strategies-opening-price-principle.asp
