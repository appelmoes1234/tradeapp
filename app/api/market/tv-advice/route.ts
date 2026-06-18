import { NextRequest, NextResponse } from 'next/server';
import { generateRealMarketAdvice } from '../../../lib/market-strategy';
import { fetchTradingViewBars, parseTradingViewRequest } from '../../../lib/tradingview-data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const params = parseTradingViewRequest(request.nextUrl.searchParams);
    const payload = await fetchTradingViewBars(
      params.requestedSymbol,
      params.tradingViewSymbol,
      params.timeframe,
      Math.max(params.range, 80),
      12000,
      params.isSyntheticInverse
    );
    return NextResponse.json({ ...payload, advice: generateRealMarketAdvice(params.requestedSymbol, payload.bars) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown TradingView advice error' },
      { status: 400 }
    );
  }
}
