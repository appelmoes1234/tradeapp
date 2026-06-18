'use client';

import { useState } from 'react';
import { marketSymbols } from '../lib/market-symbols';
import type { RealBacktestResult, RealMarketAdvice } from '../lib/market-strategy';

type MarketPayload = {
  advice?: RealMarketAdvice;
  backtest?: RealBacktestResult;
  error?: string;
};

export function RealMarketPanel() {
  const [symbol, setSymbol] = useState('EURUSD=X');
  const [advice, setAdvice] = useState<RealMarketAdvice | null>(null);
  const [backtest, setBacktest] = useState<RealBacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMarket() {
    setLoading(true);
    setError(null);
    try {
      const [adviceResponse, backtestResponse] = await Promise.all([
        fetch(`/api/market/advice?symbol=${encodeURIComponent(symbol)}`),
        fetch(`/api/market/backtest?symbol=${encodeURIComponent(symbol)}`)
      ]);
      const advicePayload = (await adviceResponse.json()) as MarketPayload;
      const backtestPayload = (await backtestResponse.json()) as MarketPayload;
      if (!adviceResponse.ok || advicePayload.error) throw new Error(advicePayload.error ?? 'Advice request failed');
      if (!backtestResponse.ok || backtestPayload.error) throw new Error(backtestPayload.error ?? 'Backtest request failed');
      setAdvice(advicePayload.advice ?? null);
      setBacktest(backtestPayload.backtest ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unknown market-data error');
      setAdvice(null);
      setBacktest(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel wide real-market-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Real market research</p>
          <h2>Live data advice + backtest</h2>
        </div>
        <div className="market-controls">
          <select value={symbol} onChange={(event) => setSymbol(event.target.value)}>
            {marketSymbols.map((item) => <option value={item.yahooSymbol} key={item.yahooSymbol}>{item.label}</option>)}
          </select>
          <button onClick={loadMarket} disabled={loading}>{loading ? 'Loading…' : 'Run real market check'}</button>
        </div>
      </div>
      <p className="muted">Uses delayed/public Yahoo chart data for research. Output is not financial advice and never sends orders.</p>
      {error ? <p className="error-box">{error}</p> : null}
      <div className="real-market-grid">
        <article>
          <h3>Advice</h3>
          {advice ? (
            <dl>
              <div><dt>Status</dt><dd>{advice.status}</dd></div>
              <div><dt>Symbol</dt><dd>{advice.platformSymbol}</dd></div>
              <div><dt>Side</dt><dd>{advice.side.toUpperCase()}</dd></div>
              <div><dt>Entry</dt><dd>{advice.entry}</dd></div>
              <div><dt>SL</dt><dd>{advice.stopLoss ?? '-'}</dd></div>
              <div><dt>TP</dt><dd>{advice.takeProfit ?? '-'}</dd></div>
              <div><dt>Risk</dt><dd>${advice.riskUsd}</dd></div>
              <div><dt>Reason</dt><dd>{advice.reason}</dd></div>
            </dl>
          ) : <p className="muted">Click the button to fetch current market data.</p>}
        </article>
        <article>
          <h3>Backtest</h3>
          {backtest ? (
            <dl>
              <div><dt>Trades</dt><dd>{backtest.trades}</dd></div>
              <div><dt>Winrate</dt><dd>{backtest.winRate}%</dd></div>
              <div><dt>PnL</dt><dd>${backtest.pnlUsd}</dd></div>
              <div><dt>Max DD</dt><dd>${backtest.maxDrawdownUsd}</dd></div>
              <div><dt>From</dt><dd>{backtest.from.slice(0, 10)}</dd></div>
              <div><dt>To</dt><dd>{backtest.to.slice(0, 10)}</dd></div>
            </dl>
          ) : <p className="muted">Backtest appears here after the same real-market request.</p>}
        </article>
      </div>
    </section>
  );
}
