import { NextRequest, NextResponse } from 'next/server';
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
      params.range,
      12000,
      params.isSyntheticInverse
    );
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown TradingView candle error' },
      { status: 400 }
    );
  }
}
