import { NextRequest, NextResponse } from 'next/server';
import { fetchYahooBars } from '../../../lib/market-data';
import { runRealBacktest } from '../../../lib/market-strategy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') ?? 'EURUSD=X';
  try {
    const bars = await fetchYahooBars(symbol, '1y', '1d');
    return NextResponse.json({ backtest: runRealBacktest(symbol, bars) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown market backtest error' },
      { status: 400 }
    );
  }
}
