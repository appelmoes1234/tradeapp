import { createRequire } from 'node:module';
import type { MarketBar } from './market-data';
import { getMarketSymbol, getTradingViewSymbol, isSyntheticInverseSymbol } from './market-data';

const require = createRequire(import.meta.url);

type TradingViewChartPeriod = {
  time?: number;
  open?: number;
  max?: number;
  high?: number;
  min?: number;
  low?: number;
  close?: number;
  volume?: number;
};

type TradingViewChart = {
  infos?: { description?: string; currency_id?: string };
  periods?: TradingViewChartPeriod[];
  setMarket: (symbol: string, options: { timeframe: string; range: number }) => void;
  onError: (callback: (...errors: unknown[]) => void) => void;
  onSymbolLoaded: (callback: () => void) => void;
  onUpdate: (callback: () => void) => void;
  delete?: () => void;
};

type TradingViewClient = {
  Session: {
    Chart: new () => TradingViewChart;
  };
  end: () => void;
};

type TradingViewModule = {
  Client: new () => TradingViewClient;
};

export type TradingViewBarsPayload = {
  requestedSymbol: string;
  tradingViewSymbol: string;
  timeframe: string;
  range: number;
  source: 'tradingview_websocket';
  description: string | null;
  currency: string | null;
  isSyntheticInverse: boolean;
  bars: MarketBar[];
};

function normalizeTimeframe(value: string | null): string {
  const normalized = (value ?? '15').trim().toUpperCase();
  const allowed = new Set(['1', '3', '5', '15', '30', '45', '60', '120', '240', 'D', 'W']);
  if (!allowed.has(normalized)) {
    throw new Error(`Unsupported TradingView timeframe: ${value}`);
  }
  return normalized;
}

function normalizeRange(value: string | null): number {
  const range = Number(value ?? 250);
  if (!Number.isFinite(range) || range < 10 || range > 5000) {
    throw new Error('Range must be a number between 10 and 5000 candles');
  }
  return Math.floor(range);
}

function convertPeriods(periods: TradingViewChartPeriod[]): MarketBar[] {
  return periods
    .flatMap((period) => {
      const high = period.high ?? period.max;
      const low = period.low ?? period.min;
      if (
        period.time == null
        || period.open == null
        || high == null
        || low == null
        || period.close == null
      ) {
        return [];
      }
      return [{
        ts: new Date(period.time * 1000).toISOString(),
        open: period.open,
        high,
        low,
        close: period.close,
        volume: period.volume ?? 0
      }];
    })
    .sort((left, right) => new Date(left.ts).getTime() - new Date(right.ts).getTime());
}

function invertForexBars(bars: MarketBar[]): MarketBar[] {
  return bars.flatMap((bar) => {
    if (bar.open <= 0 || bar.high <= 0 || bar.low <= 0 || bar.close <= 0) return [];
    return [{
      ts: bar.ts,
      open: 1 / bar.open,
      high: 1 / bar.low,
      low: 1 / bar.high,
      close: 1 / bar.close,
      volume: bar.volume
    }];
  });
}

export function parseTradingViewRequest(searchParams: URLSearchParams) {
  const requestedSymbol = searchParams.get('symbol') ?? 'EURUSD=X';
  const marketSymbol = getMarketSymbol(requestedSymbol);
  const tradingViewSymbol = searchParams.get('tvSymbol') ?? getTradingViewSymbol(requestedSymbol);
  const timeframe = normalizeTimeframe(searchParams.get('timeframe'));
  const range = normalizeRange(searchParams.get('range'));
  const isSyntheticInverse = isSyntheticInverseSymbol(requestedSymbol);
  return { requestedSymbol, marketSymbol, tradingViewSymbol, timeframe, range, isSyntheticInverse };
}

export async function fetchTradingViewBars(
  requestedSymbol: string,
  tradingViewSymbol: string,
  timeframe: string,
  range: number,
  timeoutMs = 12000,
  isSyntheticInverse = false
): Promise<TradingViewBarsPayload> {
  const TradingView = require('@mathieuc/tradingview') as TradingViewModule;
  const client = new TradingView.Client();
  const chart = new client.Session.Chart();

  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      try { chart.delete?.(); } catch {}
      try { client.end(); } catch {}
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const finish = () => {
      if (settled) return;
      const rawBars = convertPeriods(chart.periods ?? []);
      const bars = isSyntheticInverse ? invertForexBars(rawBars) : rawBars;
      if (bars.length < Math.min(10, range)) return;
      settled = true;
      const payload: TradingViewBarsPayload = {
        requestedSymbol,
        tradingViewSymbol,
        timeframe,
        range,
        source: 'tradingview_websocket',
        description: chart.infos?.description ?? null,
        currency: isSyntheticInverse ? 'EUR' : (chart.infos?.currency_id ?? null),
        isSyntheticInverse,
        bars
      };
      cleanup();
      resolve(payload);
    };

    const timer = setTimeout(() => {
      fail(new Error(`TradingView candle request timed out for ${tradingViewSymbol}`));
    }, timeoutMs);

    chart.onError((...errors: unknown[]) => {
      clearTimeout(timer);
      fail(new Error(errors.map(String).join(' ') || `TradingView chart error for ${tradingViewSymbol}`));
    });
    chart.onSymbolLoaded(() => {
      // Wait for onUpdate; periods usually arrive shortly after the symbol is loaded.
    });
    chart.onUpdate(() => {
      clearTimeout(timer);
      finish();
    });

    try {
      chart.setMarket(tradingViewSymbol, { timeframe, range });
    } catch (error) {
      clearTimeout(timer);
      fail(error instanceof Error ? error : new Error('TradingView setMarket failed'));
    }
  });
}
