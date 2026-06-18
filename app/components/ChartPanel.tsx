'use client';

import { useEffect, useMemo, useState } from 'react';
import { marketSymbols, type MarketBar } from '../lib/market-data';

type TradingViewPayload = {
  requestedSymbol: string;
  tradingViewSymbol: string;
  timeframe: string;
  source: string;
  description: string | null;
  currency: string | null;
  isSyntheticInverse: boolean;
  bars: MarketBar[];
  error?: string;
};

function formatPrice(value: number): string {
  if (Math.abs(value) >= 1000) return value.toFixed(2);
  if (Math.abs(value) >= 10) return value.toFixed(3);
  return value.toFixed(5);
}

function buildPolyline(bars: MarketBar[]): string {
  const width = 660;
  const height = 170;
  const padding = 18;
  const values = bars.map((bar) => bar.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((value, index) => {
    const x = bars.length === 1 ? 0 : (index / (bars.length - 1)) * width;
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

export function ChartPanel() {
  const [symbol, setSymbol] = useState('EURUSD=X');
  const [timeframe, setTimeframe] = useState('15');
  const [payload, setPayload] = useState<TradingViewPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCandles() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ symbol, timeframe, range: '180' });
      const response = await fetch(`/api/market/tv-candles?${params}`);
      const data = (await response.json()) as TradingViewPayload;
      if (!response.ok || data.error) throw new Error(data.error ?? 'TradingView candle request failed');
      setPayload(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unknown TradingView error');
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCandles();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = window.setInterval(() => void loadCandles(), 30000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, symbol, timeframe]);

  const bars = payload?.bars.slice(-80) ?? [];
  const latest = bars.at(-1);
  const polyline = useMemo(() => (bars.length > 1 ? buildPolyline(bars) : ''), [bars]);
  const high = bars.length ? Math.max(...bars.map((bar) => bar.high)) : null;
  const low = bars.length ? Math.min(...bars.map((bar) => bar.low)) : null;

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">TradingView market data</p>
          <h2>Live candle chart preview</h2>
        </div>
        <div className="market-controls">
          <select value={symbol} onChange={(event) => setSymbol(event.target.value)}>
            {marketSymbols.map((item) => <option value={item.yahooSymbol} key={item.yahooSymbol}>{item.label}</option>)}
          </select>
          <select value={timeframe} onChange={(event) => setTimeframe(event.target.value)}>
            <option value="1">M1</option>
            <option value="5">M5</option>
            <option value="15">M15</option>
            <option value="30">M30</option>
            <option value="60">H1</option>
            <option value="240">H4</option>
            <option value="D">D1</option>
          </select>
          <button onClick={loadCandles} disabled={loading}>{loading ? 'Loading…' : 'Load live chart'}</button>
        </div>
      </div>

      {error ? <p className="error-box">{error}</p> : null}

      <svg viewBox="0 0 660 170" role="img" aria-label="TradingView live candle close line preview">
        {bars.length > 1 ? <polyline points={polyline} fill="none" className="price-line" /> : null}
        <text x="18" y="30">{payload?.tradingViewSymbol ?? 'TradingView symbol'}</text>
        <text x="18" y="54">{latest ? `Last ${formatPrice(latest.close)}` : 'Waiting for candles'}</text>
        <text x="500" y="30">{high != null ? `High ${formatPrice(high)}` : ''}</text>
        <text x="500" y="54">{low != null ? `Low ${formatPrice(low)}` : ''}</text>
      </svg>

      <div className="scan-summary">
        <span>Source: {payload?.source ?? 'TradingView websocket'}</span>
        <span>Bars: {payload?.bars.length ?? 0}</span>
        <span>TF: {payload?.timeframe ?? timeframe}</span>
        <span>{payload?.isSyntheticInverse ? 'Synthetic inverse: 1 / EURUSD' : 'Direct feed'}</span>
        <span>Updated: {latest ? new Date(latest.ts).toLocaleString() : '-'}</span>
      </div>
      <label className="toggle-label">
        <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
        Auto-refresh 30s
      </label>
      <p className="muted">Uses the local server-side TradingView websocket adapter. This is market-data research only; execution remains OFF.</p>
    </section>
  );
}
