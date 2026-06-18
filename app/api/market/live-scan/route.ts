import { NextResponse } from 'next/server';
import { fetchYahooBars, marketSymbols } from '../../../lib/market-data';
import { generateRealMarketAdvice } from '../../../lib/market-strategy';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = new Date().toISOString();
  const results = [];

  for (const symbol of marketSymbols) {
    try {
      const bars = await fetchYahooBars(symbol.yahooSymbol, '6mo', '1d');
      results.push({
        symbol,
        advice: generateRealMarketAdvice(symbol.yahooSymbol, bars),
        lastBar: bars.at(-1) ?? null,
        error: null
      });
    } catch (error) {
      results.push({
        symbol,
        advice: null,
        lastBar: null,
        error: error instanceof Error ? error.message : 'Unknown live scan error'
      });
    }
  }

  return NextResponse.json({
    startedAt,
    completedAt: new Date().toISOString(),
    universeSize: marketSymbols.length,
    dataSource: 'Delayed Yahoo public proxy; production FTMO coverage requires MT5 symbol discovery from the user terminal.',
    executionEnabled: false,
    results
  });
}
