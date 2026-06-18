'use client';

import { useEffect, useState } from 'react';
import type { MarketBar, MarketSymbol } from '../lib/market-data';
import type { RealMarketAdvice } from '../lib/market-strategy';

type LiveScanResult = {
  symbol: MarketSymbol;
  advice: RealMarketAdvice | null;
  lastBar: MarketBar | null;
  error: string | null;
};

type LiveScanPayload = {
  startedAt: string;
  completedAt: string;
  universeSize: number;
  dataSource: string;
  executionEnabled: boolean;
  results: LiveScanResult[];
};

export function LiveScanPanel() {
  const [payload, setPayload] = useState<LiveScanPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadScan() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/market/live-scan');
      const data = (await response.json()) as LiveScanPayload | { error?: string };
      if (!response.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : 'Live scan failed');
      }
      setPayload(data as LiveScanPayload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unknown live scan error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!autoRefresh) return undefined;
    void loadScan();
    const timer = window.setInterval(() => void loadScan(), 30000);
    return () => window.clearInterval(timer);
  }, [autoRefresh]);

  const approved = payload?.results.filter((item) => item.advice?.status === 'approved') ?? [];

  return (
    <section className="panel wide live-scan-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Constant live scanner</p>
          <h2>All configured FTMO-style markets</h2>
        </div>
        <div className="market-controls">
          <button onClick={loadScan} disabled={loading}>{loading ? 'Scanning…' : 'Scan all markets now'}</button>
          <label className="toggle-label">
            <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
            Auto-refresh 30s
          </label>
        </div>
      </div>
      <p className="muted">
        This scans the configured FTMO-style universe via delayed public proxy data. Full FTMO coverage still requires
        live symbol discovery from your local/user-managed MT5 terminal.
      </p>
      {error ? <p className="error-box">{error}</p> : null}
      {payload ? (
        <>
          <div className="scan-summary">
            <span>Universe: {payload.universeSize}</span>
            <span>Approved: {approved.length}</span>
            <span>Execution: {payload.executionEnabled ? 'ON' : 'OFF'}</span>
            <span>Completed: {new Date(payload.completedAt).toLocaleTimeString()}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Category</th>
                  <th>Last close</th>
                  <th>Advice</th>
                  <th>Side</th>
                  <th>Entry / SL / TP</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {payload.results.map((item) => (
                  <tr key={item.symbol.yahooSymbol} className={item.advice?.status ?? 'blocked'}>
                    <td>{item.symbol.platformSymbol}</td>
                    <td>{item.symbol.ftmoCategory}</td>
                    <td>{item.lastBar ? item.lastBar.close.toFixed(item.lastBar.close > 100 ? 2 : 5) : '-'}</td>
                    <td><span className="pill">{item.advice?.status ?? 'error'}</span></td>
                    <td>{item.advice?.side.toUpperCase() ?? '-'}</td>
                    <td>{item.advice ? `${item.advice.entry} / ${item.advice.stopLoss ?? '-'} / ${item.advice.takeProfit ?? '-'}` : '-'}</td>
                    <td>{item.advice?.reason ?? item.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : <p className="muted">Click scan or enable auto-refresh to start constant live-data checks.</p>}
    </section>
  );
}
