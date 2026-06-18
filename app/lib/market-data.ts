import { getMarketSymbol } from './market-symbols';

export type { MarketBar, MarketSymbol } from './market-symbols';
export {
  marketSymbols,
  getMarketSymbol,
  getTradingViewSymbol,
  isSyntheticInverseSymbol
} from './market-symbols';

import type { MarketBar } from './market-symbols';

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
    error?: { description?: string } | null;
  };
};

async function fetchTextWithCurlFallback(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'user-agent': 'Mozilla/5.0 (compatible; FTMO-Advisory-Research/0.1)',
        'cache-control': 'no-cache'
      },
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error(`Market data request failed with status ${response.status}`);
    }
    return response.text();
  } catch (error) {
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const execFileAsync = promisify(execFile);
    const { stdout } = await execFileAsync('curl', ['-fsSL', '-A', 'Mozilla/5.0 (compatible; FTMO-Advisory-Research/0.1)', url], {
      maxBuffer: 1024 * 1024 * 8
    });
    return stdout;
  }
}

export async function fetchYahooBars(
  yahooSymbol: string,
  range = '6mo',
  interval = '1d'
): Promise<MarketBar[]> {
  getMarketSymbol(yahooSymbol);
  const params = new URLSearchParams({ range, interval, includePrePost: 'false' });
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?${params}`;
  const data = JSON.parse(await fetchTextWithCurlFallback(url)) as YahooChartResponse;
  const result = data.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  if (!result?.timestamp || !quote?.open || !quote.high || !quote.low || !quote.close) {
    throw new Error(data.chart?.error?.description ?? 'Yahoo chart response did not include OHLC data');
  }

  return result.timestamp.flatMap((timestamp, index) => {
    const open = quote.open?.[index];
    const high = quote.high?.[index];
    const low = quote.low?.[index];
    const close = quote.close?.[index];
    if (open == null || high == null || low == null || close == null) {
      return [];
    }
    return [{
      ts: new Date(timestamp * 1000).toISOString(),
      open,
      high,
      low,
      close,
      volume: quote.volume?.[index] ?? 0
    }];
  });
}
