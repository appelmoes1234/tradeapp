# FTMO-constrained trading advice webapp

This repository contains an advisory-first FTMO trading dashboard. It is designed to show
risk-gated trade suggestions, blocked reasons, strategy definitions, chart snapshots, and
backtest summaries without enabling trade execution.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## API endpoints

- `GET /api/advice` - ranked approved/blocked advice objects with FTMO risk context.
- `GET /api/strategies` - strategy registry used by the scanner/backtest layers.
- `GET /api/backtests` - event-driven backtest summary data.

## Python strategy tooling

```bash
python -m pip install -e .
ftmo-strategies
python -m pytest
```

## Safety stance

Execution is off by default. The current app is an advisory MVP with mock symbol and candidate data.
A real production connection should use a local/user-managed MT5 bridge and must run a fresh risk check
before any order action.


## Real market research endpoints

These endpoints fetch delayed/public Yahoo chart data and run a deterministic research signal/backtest:

- `GET /api/market/advice?symbol=EURUSD=X`
- `GET /api/market/backtest?symbol=EURUSD=X`

Supported symbols in the MVP are `EURUSD=X`, `GC=F`, `NQ=F`, and `BTC-USD`.
These endpoints are for research/advisory output only and do not place orders.

## Constant live scanner

The dashboard includes a constant live scanner panel that can poll every 30 seconds.
It calls:

- `GET /api/market/live-scan`

The MVP scans a broad FTMO-style universe through delayed Yahoo public proxies. For exact **all FTMO instruments**
in production, connect a local/user-managed MT5 terminal and replace/extend the public proxy registry with dynamic
`symbols_get()` discovery from the user's FTMO platform.

## TradingView live market data integration

This build includes a local server-side TradingView websocket adapter based on the provided `@mathieuc/tradingview` library.

### New endpoints

```txt
/api/market/tv-candles?symbol=EURUSD=X&timeframe=15&range=180
/api/market/tv-advice?symbol=EURUSD=X&timeframe=15&range=180
```

You can also pass a raw TradingView symbol:

```txt
/api/market/tv-candles?tvSymbol=OANDA:XAUUSD&timeframe=15&range=180
```

### Supported timeframes

```txt
1, 3, 5, 15, 30, 45, 60, 120, 240, D, W
```

### Start locally

```cmd
cd /d "C:\Users\khate\Downloads\FTMO\FTMO"
npm.cmd install
npx.cmd next dev -H 127.0.0.1 -p 4000
```

Open:

```txt
http://127.0.0.1:4000
```

The dashboard now has a TradingView candle chart preview with symbol/timeframe controls and 30-second auto-refresh. Execution remains disabled.


## USD/EUR synthetic inverse

The dashboard includes `USD/EUR` in the market selector. It is generated from the live `OANDA:EURUSD` TradingView feed by calculating the inverse OHLC candles (`USDEUR = 1 / EURUSD`). This avoids relying on a separate TradingView symbol that may not exist for every account/feed.

Direct test URL:

```text
/api/market/tv-candles?symbol=USDEUR=X&timeframe=15&range=180
```
