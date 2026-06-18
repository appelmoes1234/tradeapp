import { NextRequest, NextResponse } from 'next/server';
import { fetchYahooBars } from '../../../lib/market-data';
import { generateRealMarketAdvice } from '../../../lib/market-strategy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') ?? 'EURUSD=X';
  try {
    const bars = await fetchYahooBars(symbol, '6mo', '1d');
    return NextResponse.json({ bars: bars.slice(-80), advice: generateRealMarketAdvice(symbol, bars) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown market advice error' },
      { status: 400 }
    );
  }
}
